import { ProjectModel, BidModel, userModel, NotificationModel } from "../models/model.js"
import { sendProjectEmail, sendBulkProjectEmails } from "../utils/emailService.js"
import { emailConfig } from "../config/email.js";
import { sendToUser, sendToUsers, sendTemplate, getAdminRecipients, isEligibleRecipient, runInBackground } from "../services/email.service.js";
import { templates } from "../templates/emailTemplates.js";
import { createNotifications, notifyAdmins } from "../services/notification.service.js";

export const postProject = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { title, des, budget, duration } = req.body
        if (!title || !String(title).trim() || String(title).length > 200) {
            return res.json({ code: 400, success: false, message: "Project title is required (max 200 characters)", result: "", error: true })
        }
        const isExist = await ProjectModel.findOne({ clientId, title })
        if (isExist) {
            return res.json({
                code: 400,
                success: false,
                message: "Project allready Exist",
                result: "",
                error: true
            })
        }
        const data = new ProjectModel({ clientId, title, des, budget, duration })
        const result = await data.save()
        res.json({
            code: 200,
            success: true,
            message: "Project Posted Successfully",
            result: result,
            error: false
        })

        // Everything below runs after the response is sent: a failed email can never fail project creation.
        runInBackground("New project notifications", async () => {
            const project = result.toObject();
            const client = await userModel.findById(clientId).select("name email");

            // 1) confirmation to the owner
            await sendToUser(client, "project_posted_owner", "projectPostedOwner", { project }, { dedupeKey: `project_posted_owner:${result._id}` });

            // 2) eligible recipients: active, non-blocked, non-deleted users & clients — never the owner or admins
            const candidates = await userModel.find({
                _id: { $ne: clientId },
                type: { $in: ["user", "client"] },
                isDeleted: { $ne: true },
                isBlocked: { $ne: true },
                email: { $exists: true, $ne: "" }
            }).select("_id name email type status isBlocked isDeleted emailPrefs");
            const eligible = candidates.filter((u) => isEligibleRecipient(u));

            // in-app notification for every eligible recipient (independent of email preferences)
            await createNotifications(eligible.map((u) => ({
                userId: u._id, senderId: clientId, senderName: client?.name || "Client", recipientName: u.name || null,
                message: `${client?.name || "A client"} posted a new project "${title}" with a budget of ₹${budget}.`,
                type: "new_project", relatedProjectId: result._id.toString()
            })));

            // email: one individual message each, in batches (no recipient ever sees another address)
            const base = emailConfig().frontendUrl;
            await sendToUsers(eligible, {
                type: "new_project",
                dedupeBase: `new_project:${result._id}`,
                build: (u) => templates.newProject({ project, client, link: `${base}${u.type === "client" ? "/client-dashboard" : `/user-project?project=${result._id}`}` })
            });

            // 3) separate admin email + in-app notification
            const admins = await getAdminRecipients();
            await Promise.all(admins.map((a) => sendTemplate(a.email, "new_project_admin", "newProjectAdmin", { project, client }, `new_project_admin:${result._id}:${a.email}`)));
            await notifyAdmins({ message: `${client?.name || "A client"} posted a new project "${title}" (₹${budget}).`, type: "admin_alert", senderId: clientId, senderName: client?.name || "Client", relatedProjectId: result._id.toString() });
        });
    } catch (err) {
        res.json({
            code: 500,
            success: false,
            message: "Internal Server Error",
            result: "",
            error: true
        })
    }
}

// Client (owner only) can update the details of an open project
export const updateProject = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, title, des, budget, duration } = req.body;
        if (!projectId || !title?.trim() || !budget?.trim() || !duration?.trim() || !des?.trim()) {
            return res.json({ code: 400, success: false, message: "All project fields are required", result: "", error: true });
        }
        const project = await ProjectModel.findOneAndUpdate(
            { _id: projectId, clientId, status: "open" },
            { title: title.trim(), des: des.trim(), budget: budget.trim(), duration: duration.trim() },
            { new: true, runValidators: true }
        );
        if (!project) {
            return res.json({ code: 400, success: false, message: "Only open projects can be edited", result: "", error: true });
        }
        res.json({ code: 200, success: true, message: "Project updated successfully", result: project, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
}

// Client's own projects (any status)
export const clientProjectList = async (req, res) => {
    try {
        const clientId = req.user.id;
        const projects = await ProjectModel.find({ clientId, isDeleted: { $ne: true } }).sort({ createdAt: -1 })
        const developerIds = projects.map(project => project.assignedTo).filter(Boolean)
        const developers = await userModel.find({ _id: { $in: developerIds } }).select("name email phone headline skill")
        const developerMap = Object.fromEntries(developers.map(developer => [developer._id.toString(), developer.toObject()]))
        const result = projects.map(project => ({
            ...project.toObject(),
            developer: developerMap[project.assignedTo?.toString()] || null
        }))
        res.json({
            code: 200,
            success: true,
            message: "data fetched",
            result: result,
            error: false
        })
    } catch (err) {
        res.json({
            code: 500,
            success: false,
            message: "Internal Server Error",
            result: "",
            error: true
        })
    }
}

// Public feed for developers to browse & bid on
export const listOpenProjects = async (req, res) => {
    try {
        const projects = await ProjectModel.find({ status: "open", isDeleted: { $ne: true } }).sort({ createdAt: -1 })
        const clientIds = projects.map(project => project.clientId).filter(Boolean)
        const clients = await userModel.find({ _id: { $in: clientIds } }).select("name email phone")
        const clientMap = Object.fromEntries(clients.map(client => [client._id.toString(), client.toObject()]))
        const result = projects.map(project => ({ ...project.toObject(), client: clientMap[project.clientId?.toString()] || null }))
        res.json({ code: 200, success: true, message: "Open projects fetched", result, error: false })
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true })
    }
}

// Developer's currently assigned/in-progress work
export const listMyAssignedProjects = async (req, res) => {
    try {
        const developerId = req.user.id;
        const projects = await ProjectModel.find({ assignedTo: developerId, isDeleted: { $ne: true } }).sort({ createdAt: -1 })
        const clientIds = projects.map(project => project.clientId).filter(Boolean)
        const clients = await userModel.find({ _id: { $in: clientIds } }).select("name email phone")
        const clientMap = Object.fromEntries(clients.map(client => [client._id.toString(), client.toObject()]))
        const result = projects.map(project => ({ ...project.toObject(), client: clientMap[project.clientId] || null }))
        res.json({ code: 200, success: true, message: "Assigned projects fetched", result, error: false })
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true })
    }
}

// Client (owner only) can move status forward: in_progress -> completed, or open/assigned -> cancelled
export const requestProjectStart = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, message } = req.body;
        const project = await ProjectModel.findOne({ _id: projectId, clientId, status: "assigned" });
        if (!project) return res.json({ code: 400, success: false, message: "Project has not been assigned yet", result: "", error: true });
        await NotificationModel.create({ userId: project.assignedTo, message: `Client requested to start "${project.title}"${message?.trim() ? `: ${message.trim()}` : ". Please confirm when work begins."}`, type: "project_assigned", relatedProjectId: project._id.toString() });
        const developer = await userModel.findById(project.assignedTo);
        sendProjectEmail({ to: developer?.email, subject: `Project ready to start: ${project.title}`, text: message?.trim() || `Please confirm when you start work on ${project.title}.` }).catch(() => {});
        res.json({ code: 200, success: true, message: "Start request sent to freelancer", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
}

export const receiveCompletedProject = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, note } = req.body;
        const project = await ProjectModel.findOneAndUpdate({ _id: projectId, clientId, status: "awaiting_review" }, { status: "completed" }, { new: true });
        if (!project) return res.json({ code: 400, success: false, message: "No delivery is waiting for your confirmation", result: "", error: true });
        await NotificationModel.create({ userId: project.assignedTo, message: note?.trim() ? `Client received and completed "${project.title}": ${note.trim()}` : `Client received and completed "${project.title}".`, type: "project_completed", relatedProjectId: project._id.toString() });
        const developer = await userModel.findById(project.assignedTo);
        sendProjectEmail({ to: developer?.email, subject: `Delivery accepted: ${project.title}`, text: note?.trim() || `The client confirmed receipt and completed ${project.title}.` }).catch(() => {});
        const client = await userModel.findById(clientId);
        userModel.find({ type: "admin", isDeleted: { $ne: true } }).select("email").then((admins) => {
            sendBulkProjectEmails(admins.map((admin) => admin.email), { subject: `Project completed: ${project.title}`, text: `${client?.name || client?.email || "Client"} confirmed delivery and completed "${project.title}".` });
        }).catch(() => {});
        res.json({ code: 200, success: true, message: "Delivery received. Project completed.", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
}

export const approveCompletedProject = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, note } = req.body;
        const project = await ProjectModel.findOneAndUpdate({ _id: projectId, clientId, status: "awaiting_review" }, { status: "completed" }, { new: true });
        if (!project) return res.json({ code: 400, success: false, message: "Project is not waiting for client approval", result: "", error: true });
        const { NotificationModel } = await import("../models/model.js");
        await NotificationModel.create({ userId: project.assignedTo, message: note?.trim() ? `Client approved your completed project "${project.title}". Note: ${note.trim()}` : `Client approved and completed your project "${project.title}".`, type: "project_completed", relatedProjectId: project._id.toString() });
        res.json({ code: 200, success: true, message: "Project completed successfully", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
}

export const requestProjectRevision = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, note } = req.body;
        if (!note?.trim()) return res.json({ code: 400, success: false, message: "Please add revision instructions for the freelancer", result: "", error: true });
        const project = await ProjectModel.findOneAndUpdate({ _id: projectId, clientId, status: "awaiting_review" }, { status: "in_progress" }, { new: true });
        if (!project) return res.json({ code: 400, success: false, message: "Project is not waiting for client review", result: "", error: true });
        const { NotificationModel } = await import("../models/model.js");
        await NotificationModel.create({ userId: project.assignedTo, message: `Client requested revisions on "${project.title}": ${note.trim()}`, type: "general", relatedProjectId: project._id.toString() });
        const developer = await userModel.findById(project.assignedTo);
        sendProjectEmail({ to: developer?.email, subject: `Revision requested: ${project.title}`, text: `The client requested revisions for "${project.title}".\n\n${note.trim()}` }).catch(() => {});
        res.json({ code: 200, success: true, message: "Revision request sent to freelancer", result: project, error: false });
    } catch (err) { res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true }); }
}

export const updateProjectStatus = async (req, res) => {
    try {
        const clientId = req.user.id;
        const { projectId, status } = req.body; // status: "in_progress" | "completed" | "cancelled"
        const allowed = ["in_progress", "completed", "cancelled"];
        if (!allowed.includes(status) || status === "completed") {
            if (status === "completed") return res.json({ code: 400, success: false, message: "Project completion must be approved by the client after freelancer delivery", result: "", error: true });
            return res.json({ code: 400, success: false, message: "Invalid status", result: "", error: true })
        }
        const project = await ProjectModel.findOneAndUpdate(
            { _id: projectId, clientId },
            { status },
            { new: true }
        );
        if (!project) {
            return res.json({ code: 404, success: false, message: "Project not found or not yours", result: "", error: true })
        }
        res.json({ code: 200, success: true, message: `Project marked as ${status}`, result: project, error: false })
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true })
    }
}
