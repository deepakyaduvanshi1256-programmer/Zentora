import { ProjectModel, userModel, BidModel, NotificationModel, PlanModel } from "../models/model.js";
import { sendProjectEmail } from "../utils/emailService.js";
import { sendToUser, runInBackground } from "../services/email.service.js";

// Account-status emails use the typed template and must reach blocked/deleted users too.
const notifyAccountStatus = (user, status, detail) =>
    runInBackground("Account status email", () =>
        sendToUser(user, "account_status", "accountStatus", { name: user.name, status, detail }, { ignoreStatus: true }));

export const adminUserList = async (req, res) => {
    try {
        const result = await userModel.find({ type: "user" }).select("-password");
        res.status(200).json({ code: 200, success: true, message: "Data fetched", result, error: false });
    } catch (err) {
        res.status(500).json({ code: 500, success: false, message: err.message, result: [], error: true });
    }
};

export const adminClientList = async (req, res) => {
    try {
        const result = await userModel.find({ type: "client" }).select("-password");
        res.status(200).json({ code: 200, success: true, message: "Data fetched", result, error: false });
    } catch (err) {
        res.status(500).json({ code: 500, success: false, message: err.message, result: [], error: true });
    }
};

export const adminProjectList = async (req, res) => {
    try {
        const projects = await ProjectModel.find().sort({ createdAt: -1 });
        const clientIds = projects.map(p => p.clientId);
        const developerIds = projects.map(p => p.assignedTo).filter(Boolean);
        const clients = await userModel.find({ _id: { $in: clientIds } }).select("name email phone location");
        const developers = await userModel.find({ _id: { $in: developerIds } }).select("name email phone location headline skill rate");
        const bids = await BidModel.find({ projectId: { $in: projects.map(p => p._id.toString()) } }).sort({ createdAt: -1 });
        const clientMap = Object.fromEntries(clients.map(c => [c._id.toString(), c.toObject()]));
        const developerMap = Object.fromEntries(developers.map(d => [d._id.toString(), d.toObject()]));
        const result = projects.map(project => {
            const p = project.toObject();
            const assignedBid = bids.find(b => b.projectId === p._id.toString() && (b._id.toString() === p.assignedBidId || b.developerId === p.assignedTo));
            return { ...p, client: clientMap[p.clientId] || null, developer: developerMap[p.assignedTo] || null, assignedBid: assignedBid ? assignedBid.toObject() : null };
        });
        res.status(200).json({ code: 200, success: true, message: "Data fetched", result, error: false });
    } catch (err) {
        res.status(500).json({ code: 500, success: false, message: err.message, result: [], error: true });
    }
};

export const adminBidList = async (req, res) => {
    try {
        const bids = await BidModel.find().sort({ createdAt: -1 });
        const developerIds = bids.map(b => b.developerId);
        const projectIds = bids.map(b => b.projectId);
        const developers = await userModel.find({ _id: { $in: developerIds } }).select("name email");
        const projects = await ProjectModel.find({ _id: { $in: projectIds } }).select("title status clientId");
        const devMap = {};
        developers.forEach(d => { devMap[d._id.toString()] = d; });
        const projMap = {};
        projects.forEach(p => { projMap[p._id.toString()] = p; });
        const result = bids.map(b => ({
            ...b.toObject(),
            developer: devMap[b.developerId] || null,
            project: projMap[b.projectId] || null
        }));
        res.status(200).json({ code: 200, success: true, message: "Data fetched", result, error: false });
    } catch (err) {
        res.status(500).json({ code: 500, success: false, message: err.message, result: [], error: true });
    }
};

// Admin sees every plan (active + inactive), unlike the public /plans list
export const adminPlanList = async (req, res) => {
    try {
        const result = await PlanModel.find().sort({ tokens: 1 });
        res.status(200).json({ code: 200, success: true, message: "Data fetched", result, error: false });
    } catch (err) {
        res.status(500).json({ code: 500, success: false, message: err.message, result: [], error: true });
    }
};

// Admin blocks/unblocks a user or client account (blocked users can't log in or bid)
export const adminDeleteUser = async (req, res) => {
    try {
        const { userId, permanent = false, restore = false } = req.body;
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ code: 404, success: false, message: "User not found", result: null, error: true });
        if (user.type === "admin" || String(user._id) === String(req.user.id)) {
            return res.status(403).json({ code: 403, success: false, message: "Admin accounts cannot be deleted from here", result: null, error: true });
        }

        if (restore) {
            await userModel.findByIdAndUpdate(userId, { isDeleted: false, deletedAt: null, isBlocked: false });
            notifyAccountStatus(user, "restored", "Your account has been restored by the administrator. You can sign in again.");
            return res.json({ code: 200, success: true, message: "User restored successfully", result: null, error: false });
        }
        if (permanent) {
            await ProjectModel.deleteMany({ $or: [{ clientId: userId }, { assignedTo: userId }] });
            await BidModel.deleteMany({ developerId: userId });
            await userModel.findByIdAndDelete(userId);
            return res.json({ code: 200, success: true, message: "User permanently deleted", result: null, error: false });
        }
        await userModel.findByIdAndUpdate(userId, { isDeleted: true, deletedAt: new Date(), isBlocked: true });
        notifyAccountStatus(user, "deleted", "Your account has been temporarily deleted by an administrator. Contact support if you need it restored.");
        res.json({ code: 200, success: true, message: "User moved to trash", result: null, error: false });
    } catch (err) {
        res.status(500).json({ code: 500, success: false, message: err.message, result: null, error: true });
    }
};

export const adminDeleteProject = async (req, res) => {
    try {
        const { projectId, permanent = false, restore = false } = req.body;
        const project = await ProjectModel.findById(projectId);
        if (!project) return res.status(404).json({ code: 404, success: false, message: "Project not found", result: null, error: true });

        if (restore) {
            await ProjectModel.findByIdAndUpdate(projectId, { isDeleted: false, deletedAt: null });
            const client = await userModel.findById(project.clientId);
            sendProjectEmail({ to: client?.email, subject: `Project restored: ${project.title}`, text: `Your project "${project.title}" has been restored by admin.` }).catch(() => {});
            return res.json({ code: 200, success: true, message: "Project restored successfully", result: null, error: false });
        }
        if (permanent) {
            await BidModel.deleteMany({ projectId });
            await ProjectModel.findByIdAndDelete(projectId);
            return res.json({ code: 200, success: true, message: "Project permanently deleted", result: null, error: false });
        }
        await ProjectModel.findByIdAndUpdate(projectId, { isDeleted: true, deletedAt: new Date() });
        const client = await userModel.findById(project.clientId);
        sendProjectEmail({ to: client?.email, subject: `Project moved to trash: ${project.title}`, text: `Your project "${project.title}" has been temporarily deleted by admin.` }).catch(() => {});
        res.json({ code: 200, success: true, message: "Project moved to trash", result: null, error: false });
    } catch (err) {
        res.status(500).json({ code: 500, success: false, message: err.message, result: null, error: true });
    }
};

export const toggleBlockUser = async (req, res) => {
    try {
        const { userId, isBlocked } = req.body;
        const target = await userModel.findById(userId).select("type");
        if (target && (target.type === "admin" || String(target._id) === String(req.user.id))) {
            return res.json({ code: 403, success: false, message: "Admin accounts cannot be blocked", result: "", error: true });
        }
        await userModel.findByIdAndUpdate(userId, { isBlocked });
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.json({ code: 404, success: false, message: "User not found", result: "", error: true });
        }
        await NotificationModel.create({
            userId: user._id.toString(),
            message: isBlocked ? "Your account has been blocked by admin." : "Your account has been unblocked.",
            type: "account_status"
        });
        notifyAccountStatus(user, isBlocked ? "blocked" : "unblocked", isBlocked ? "Your account has been blocked by an administrator. Contact support for more information." : "Your account has been unblocked and restored. You can sign in again.");
        res.json({ code: 200, success: true, message: `User ${isBlocked ? "blocked" : "unblocked"}`, result: user, error: false });
    } catch (err) {
        console.error("Toggle block failed:", err);
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Admin force-blocks a project (e.g. flagged / disputed) — stops further bidding
export const adminBlockProject = async (req, res) => {
    try {
        const { projectId, unblock } = req.body;
        const current = await ProjectModel.findById(projectId);
        if (!current) return res.json({ code: 404, success: false, message: "Project not found", result: "", error: true });

        if (unblock) {
            const restoredStatus = current.previousStatus || "open";
            const project = await ProjectModel.findByIdAndUpdate(projectId, { status: restoredStatus, previousStatus: null }, { new: true });
            await NotificationModel.create({ userId: project.clientId, message: `Your project "${project.title}" has been unblocked by admin.`, type: "general", relatedProjectId: project._id.toString() });
            const unblockedClient = await userModel.findById(project.clientId);
            sendProjectEmail({ to: unblockedClient?.email, subject: `Project restored: ${project.title}`, text: `Admin has restored your project "${project.title}".` }).catch(() => {});
            return res.json({ code: 200, success: true, message: "Project unblocked", result: project, error: false });
        }

        const project = await ProjectModel.findByIdAndUpdate(projectId, { previousStatus: current.status, status: "blocked" }, { new: true });
        await NotificationModel.create({ userId: project.clientId, message: `Your project "${project.title}" has been blocked by admin.`, type: "project_blocked", relatedProjectId: project._id.toString() });
        const blockedClient = await userModel.findById(project.clientId);
        sendProjectEmail({ to: blockedClient?.email, subject: `Project blocked: ${project.title}`, text: `Admin has blocked your project "${project.title}". Contact support for more information.` }).catch(() => {});
        res.json({ code: 200, success: true, message: "Project blocked", result: project, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};
