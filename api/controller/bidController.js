import mongoose from "mongoose";
import { BidModel, ProjectModel, userModel, NotificationModel, ProjectMessageModel } from "../models/model.js";
import { sendProjectEmail, sendBulkProjectEmails } from "../utils/emailService.js";
import { emitProjectMessage } from "../socketServer.js";
import { sendToUser, getAdminRecipients, runInBackground } from "../services/email.service.js";
import { createNotification, notifyAdmins } from "../services/notification.service.js";

const BID_COST = 10; // tokens spent whenever a developer places a bid

// Developer places a bid on an open project. Costs BID_COST tokens.
export const placeBid = async (req, res) => {
    try {
        const developerId = req.user.id; // from verifyToken
        const { projectId, amount, duration, proposal } = req.body;

        const project = await ProjectModel.findById(projectId);
        if (!project) {
            return res.json({ code: 404, success: false, message: "Project not found", result: "", error: true });
        }
        if (project.status !== "open") {
            return res.json({ code: 400, success: false, message: "This project is not open for bidding", result: "", error: true });
        }

        const alreadyBid = await BidModel.findOne({ projectId, developerId, status: { $ne: "rejected" } });
        if (alreadyBid) {
            return res.json({ code: 400, success: false, message: "You have already placed a bid on this project", result: "", error: true });
        }

        // Atomic deduction: only succeeds if the developer currently has enough tokens.
        // Prevents a race where two simultaneous bids both pass a balance check done beforehand.
        const developer = await userModel.findOneAndUpdate(
            { _id: developerId, credit: { $gte: BID_COST } },
            { $inc: { credit: -BID_COST } },
            { new: true }
        );
        if (!developer) {
            return res.json({ code: 400, success: false, message: "Not enough tokens to place a bid. Please top up.", result: "", error: true });
        }

        const bid = new BidModel({ projectId, developerId, amount, duration, proposal, tokensUsed: BID_COST });
        const result = await bid.save();

        res.json({ code: 200, success: true, message: "Bid placed successfully", result, error: false });

        // Keep SMTP and secondary notification work completely outside the bid response.
        runInBackground("Bid notifications", async () => {
            const client = await userModel.findById(project.clientId);
            const projectData = project.toObject();
            const bidData = result.toObject();
            await createNotification({
                userId: project.clientId,
                senderId: developerId,
                senderName: developer.name || "Developer",
                recipientName: client?.name || "Client",
                message: `New bid received on your project "${project.title}"`,
                type: "bid_received",
                relatedProjectId: project._id.toString()
            });
            // client is told about the bid; freelancer gets a confirmation (both typed + logged + opt-out aware)
            await sendToUser(client, "bid_received", "bidReceived", { project: projectData, developer, bid: bidData }, { dedupeKey: `bid_received:${result._id}` });
            await sendToUser(developer, "bid_submitted", "bidSubmitted", { project: projectData, bid: bidData }, { dedupeKey: `bid_submitted:${result._id}` });
            await notifyAdmins({ message: `${developer.name || developer.email} placed a bid of ₹${amount} on "${project.title}".`, type: "admin_alert", senderId: developerId, senderName: developer.name || "Developer", relatedProjectId: project._id.toString() });
        });
    } catch (err) {
        console.log(err);
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Developer can update a pending bid while the project is still open
export const updateMyBid = async (req, res) => {
    try {
        const developerId = req.user.id;
        const { bidId, amount, duration, proposal } = req.body;
        if (!bidId || !amount?.toString().trim() || !duration?.trim() || !proposal?.trim()) {
            return res.json({ code: 400, success: false, message: "Amount, duration and proposal are required", result: "", error: true });
        }
        const bid = await BidModel.findOne({ _id: bidId, developerId, status: "pending" });
        if (!bid) return res.json({ code: 404, success: false, message: "Only pending bids can be edited", result: "", error: true });
        const project = await ProjectModel.findOne({ _id: bid.projectId, status: "open", isDeleted: { $ne: true } });
        if (!project) return res.json({ code: 400, success: false, message: "This project is no longer open for bidding", result: "", error: true });

        bid.amount = amount.toString().trim();
        bid.duration = duration.trim();
        bid.proposal = proposal.trim();
        await bid.save();
        const client = await userModel.findById(project.clientId);
        await NotificationModel.create({ userId: project.clientId, message: `A freelancer updated their bid on "${project.title}".`, type: "bid_received", relatedProjectId: project._id.toString() });
        sendProjectEmail({ to: client?.email, subject: `Bid updated: ${project.title}`, text: `A freelancer updated their bid on "${project.title}". New amount: ₹${amount}.` }).catch(() => {});
        res.json({ code: 200, success: true, message: "Bid updated successfully", result: bid, error: false });
    } catch (err) {
        console.log(err);
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

export const confirmProjectStart = async (req, res) => {
    try {
        const developerId = req.user.id;
        const { projectId, message } = req.body;
        const project = await ProjectModel.findOne({ _id: projectId, assignedTo: developerId, status: "assigned" });
        if (!project) return res.json({ code: 400, success: false, message: "Project is not ready to start", result: "", error: true });
        project.status = "in_progress";
        await project.save();
        const client = await userModel.findById(project.clientId);
        await NotificationModel.create({ userId: client?._id?.toString(), message: `Freelancer confirmed work has started on "${project.title}"${message?.trim() ? `: ${message.trim()}` : "."}`, type: "project_assigned", relatedProjectId: project._id.toString() });
        sendProjectEmail({ to: client?.email, subject: `Work started: ${project.title}`, text: `Your assigned freelancer has started the project. ${message?.trim() || ""}` }).catch(() => {});
        res.json({ code: 200, success: true, message: "Work started successfully", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
};

export const sendProjectConversationMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { projectId, message, deliveryLink } = req.body;
        if (!message?.trim()) return res.json({ code: 400, success: false, message: "Message is required", result: "", error: true });
        const project = await ProjectModel.findOne({ _id: projectId, $or: [{ clientId: senderId }, { assignedTo: senderId }] });
        if (!project) return res.json({ code: 403, success: false, message: "You are not part of this project", result: "", error: true });
        const recipientId = project.clientId.toString() === senderId ? project.assignedTo : project.clientId;
        if (!recipientId) return res.json({ code: 400, success: false, message: "No assigned freelancer yet", result: "", error: true });
        const saved = await ProjectMessageModel.create({ projectId, senderId, recipientId, message: message.trim(), deliveryLink: deliveryLink?.trim() || null });
        await NotificationModel.create({ userId: recipientId, message: `New project message on "${project.title}": ${message.trim()}`, type: "general", relatedProjectId: projectId });
        const recipient = await userModel.findById(recipientId);
        sendProjectEmail({ to: recipient?.email, subject: `Message about ${project.title}`, text: `${message.trim()}${deliveryLink?.trim() ? `\nDelivery/file link: ${deliveryLink.trim()}` : ""}` }).catch(() => {});
        emitProjectMessage(projectId, saved);
        res.json({ code: 200, success: true, message: "Message sent", result: saved, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
};

export const getProjectConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { projectId } = req.params;
        const project = await ProjectModel.findOne({ _id: projectId, $or: [{ clientId: userId }, { assignedTo: userId }] });
        if (!project) return res.json({ code: 403, success: false, message: "Access denied", result: [], error: true });
        await ProjectMessageModel.updateMany(
            { projectId, recipientId: userId, readBy: { $ne: userId } },
            { $addToSet: { readBy: userId }, $set: { readAt: new Date() } }
        );
        const messages = await ProjectMessageModel.find({ projectId }).sort({ createdAt: 1 });
        res.json({ code: 200, success: true, message: "Conversation fetched", result: messages, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: [], error: true }); }
};

export const submitProjectForReview = async (req, res) => {
    try {
        const developerId = req.user.id;
        const { projectId, message, deliveryLink } = req.body;
        if (!message?.trim()) return res.json({ code: 400, success: false, message: "Add a completion message for the client", result: "", error: true });
        const uploadedFile = req.file;
        const deliveryFileUrl = uploadedFile ? `${req.protocol}://${req.get("host")}/uploads/deliveries/${encodeURIComponent(uploadedFile.filename)}` : null;
        const deliveryData = {
            status: "awaiting_review",
            deliveryLink: deliveryLink?.trim() || null,
            deliveryFileUrl,
            deliveryFileName: uploadedFile?.originalname || null
        };
        const project = await ProjectModel.findOneAndUpdate(
            { _id: projectId, assignedTo: developerId, status: { $in: ["assigned", "in_progress"] } },
            deliveryData,
            { new: true }
        );
        if (!project) return res.json({ code: 400, success: false, message: "Only assigned work can be submitted for review", result: "", error: true });
        await NotificationModel.create({ userId: project.clientId, message: `Freelancer submitted "${project.title}" for your review: ${message.trim()}`, type: "project_completed", relatedProjectId: project._id.toString() });
        await ProjectMessageModel.create({ projectId, senderId: developerId, recipientId: project.clientId, message: message.trim(), deliveryLink: deliveryLink?.trim() || null, deliveryFileUrl, deliveryFileName: uploadedFile?.originalname || null });
        const client = await userModel.findById(project.clientId);
        sendProjectEmail({ to: client?.email, subject: `Delivery ready: ${project.title}`, text: `${message.trim()}${deliveryLink?.trim() ? `\nDelivery link: ${deliveryLink.trim()}` : ""}${deliveryFileUrl ? `\nUploaded file: ${deliveryFileUrl}` : ""}` }).catch(() => {});
        const developer = await userModel.findById(developerId);
        userModel.find({ type: "admin", isDeleted: { $ne: true } }).select("email").then((admins) => {
            sendBulkProjectEmails(admins.map((admin) => admin.email), { subject: `Project delivered: ${project.title}`, text: `${developer?.name || developer?.email || "Developer"} submitted delivery for review on "${project.title}".` });
        }).catch(() => {});
        res.json({ code: 200, success: true, message: "Project sent to client for review", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
};

// Client views all bids on one of their projects
export const getBidsForProject = async (req, res) => {
    try {
        const { projectId } = req.query;
        const project = await ProjectModel.findOne({ _id: projectId, clientId: req.user.id, isDeleted: { $ne: true } });
        if (!project) return res.status(403).json({ code: 403, success: false, message: "You can only view bids on your own projects", result: [], error: true });
        const bids = await BidModel.find({ projectId }).sort({ createdAt: -1 });
        // attach basic developer info to each bid
        const developerIds = bids.map(b => b.developerId);
        const developers = await userModel.find({ _id: { $in: developerIds } }).select("name email skill rate headline profile");
        const devMap = {};
        developers.forEach(d => { devMap[d._id.toString()] = d; });
        const result = bids.map(b => ({ ...b.toObject(), developer: devMap[b.developerId] || null }));
        res.json({ code: 200, success: true, message: "Bids fetched", result, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Developer views their own bid history
export const getMyBids = async (req, res) => {
    try {
        res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        res.set("Pragma", "no-cache");
        res.set("Expires", "0");
        const developerId = req.user.id;
        const bids = await BidModel.find({ developerId }).sort({ createdAt: -1, _id: -1 });
        const projectIds = bids.map(b => b.projectId);
        const projects = await ProjectModel.find({ _id: { $in: projectIds } });
        const projMap = {};
        projects.forEach(p => { projMap[p._id.toString()] = p; });
        const result = bids.map(b => ({ ...b.toObject(), project: projMap[b.projectId] || null }));
        res.json({ code: 200, success: true, message: "Bids fetched", result, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Client accepts one bid -> project assigned, all other pending bids on that project auto-rejected.
// Tokens already spent to bid are NOT refunded (real-life freelance platforms treat this as
// a non-refundable cost of participating, same as Upwork "Connects").
export const acceptBid = async (req, res) => {
    try {
        const { bidId } = req.body;
        const bid = await BidModel.findById(bidId);
        if (!bid) {
            return res.json({ code: 404, success: false, message: "Bid not found", result: "", error: true });
        }
        // Ownership: a client may only accept bids on their OWN project, and only while the bid is pending.
        const ownedProject = await ProjectModel.findOne({ _id: bid.projectId, clientId: req.user.id, isDeleted: { $ne: true } });
        if (!ownedProject) {
            return res.json({ code: 403, success: false, message: "You can only accept bids on your own projects", result: "", error: true });
        }
        if (bid.status !== "pending") {
            return res.json({ code: 400, success: false, message: "This bid is no longer pending", result: "", error: true });
        }

        // Atomic guard: project must still be "open" at the moment we assign it.
        // This stops two different bids being accepted at the same time (double-assign race).
        const project = await ProjectModel.findOneAndUpdate(
            { _id: bid.projectId, status: "open" },
            { status: "assigned", assignedTo: bid.developerId, assignedBidId: bid._id.toString() },
            { new: true }
        );
        if (!project) {
            return res.json({ code: 400, success: false, message: "This project is no longer open (already assigned/cancelled)", result: "", error: true });
        }

        bid.status = "accepted";
        await bid.save();

        // reject every other pending bid on this project
        const otherBids = await BidModel.find({ projectId: bid.projectId, _id: { $ne: bid._id }, status: "pending" });
        await BidModel.updateMany(
            { projectId: bid.projectId, _id: { $ne: bid._id }, status: "pending" },
            { status: "rejected" }
        );

        res.json({ code: 200, success: true, message: "Bid accepted, project assigned", result: { bid, project }, error: false });

        runInBackground("Bid accepted notifications", async () => {
            const acceptedDeveloper = await userModel.findById(bid.developerId);
            const assigningClient = await userModel.findById(req.user.id);
            const projectData = project.toObject();
            await createNotification({
                userId: bid.developerId,
                senderId: req.user.id,
                senderName: assigningClient?.name || "Client",
                recipientName: acceptedDeveloper?.name || "Developer",
                message: `Your bid was accepted! Project "${project.title}" has been assigned to you.`,
                type: "bid_accepted",
                relatedProjectId: project._id.toString()
            });
            await sendToUser(acceptedDeveloper, "bid_accepted", "bidAccepted", { project: projectData, bid: bid.toObject(), client: assigningClient }, { dedupeKey: `bid_accepted:${bid._id}` });
            await sendProjectEmail({ to: assigningClient?.email, type: "general", subject: `Project assigned: ${project.title}`, text: `You assigned "${project.title}" to ${acceptedDeveloper?.name || "the selected developer"}.` });
            const admins = await getAdminRecipients();
            await sendBulkProjectEmails(admins.map((a) => a.email), { type: "admin_activity", subject: `Project assigned: ${project.title}`, text: `${assigningClient?.name || "Client"} assigned "${project.title}" to ${acceptedDeveloper?.name || acceptedDeveloper?.email || "a developer"}.` });
            await notifyAdmins({ message: `${assigningClient?.name || "A client"} assigned "${project.title}" to ${acceptedDeveloper?.name || "a developer"}.`, type: "admin_alert", senderId: req.user.id, senderName: assigningClient?.name || "Client", relatedProjectId: project._id.toString() });

            for (const ob of otherBids) {
                await createNotification({
                    userId: ob.developerId,
                    senderId: req.user.id,
                    senderName: assigningClient?.name || "Client",
                    message: `Your bid on "${project.title}" was not selected this time.`,
                    type: "bid_rejected",
                    relatedProjectId: project._id.toString()
                });
                const rejectedDeveloper = await userModel.findById(ob.developerId);
                await sendToUser(rejectedDeveloper, "bid_rejected", "bidRejected", { project: projectData, bid: ob.toObject() }, { dedupeKey: `bid_rejected:${ob._id}` });
            }
        });
    } catch (err) {
        console.log(err);
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Client rejects a single bid without assigning the project
export const rejectBid = async (req, res) => {
    try {
        const { bidId } = req.body;
        const existing = bidId ? await BidModel.findById(bidId) : null;
        if (!existing) {
            return res.json({ code: 404, success: false, message: "Bid not found", result: "", error: true });
        }
        // Ownership: only the client who owns the project may reject its bids.
        const project = await ProjectModel.findOne({ _id: existing.projectId, clientId: req.user.id, isDeleted: { $ne: true } });
        if (!project) {
            return res.json({ code: 403, success: false, message: "You can only reject bids on your own projects", result: "", error: true });
        }
        if (existing.status !== "pending") {
            return res.json({ code: 400, success: false, message: "Only pending bids can be rejected", result: "", error: true });
        }
        existing.status = "rejected";
        const bid = await existing.save();
        res.json({ code: 200, success: true, message: "Bid rejected", result: bid, error: false });

        runInBackground("Bid rejected notifications", async () => {
            const client = await userModel.findById(req.user.id).select("name");
            await createNotification({
                userId: bid.developerId,
                senderId: req.user.id,
                senderName: client?.name || "Client",
                message: `Your bid on "${project.title}" was rejected.`,
                type: "bid_rejected",
                relatedProjectId: bid.projectId
            });
            const rejectedDeveloper = await userModel.findById(bid.developerId);
            await sendToUser(rejectedDeveloper, "bid_rejected", "bidRejected", { project: project.toObject(), bid: bid.toObject() }, { dedupeKey: `bid_rejected:${bid._id}` });
        });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};
