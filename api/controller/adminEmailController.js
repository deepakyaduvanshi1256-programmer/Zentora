import { EmailLogModel, userModel, ProjectModel, BidModel } from "../models/model.js";
import { EMAIL_TYPES, getEmailSettings, invalidateEmailSettings, sendEmail } from "../services/email.service.js";
import { emailConfig, isSmtpConfigured, verifySmtp } from "../config/email.js";
import { templates } from "../templates/emailTemplates.js";
import { EmailSettingModel } from "../models/model.js";
import { createNotification } from "../services/notification.service.js";

const ok = (res, message, result) => res.json({ code: 200, success: true, message, result, error: false });
const bad = (res, code, message) => res.json({ code, success: false, message, result: "", error: true });
const maskEmail = (e) => (e ? e.replace(/^(.).*(@.*)$/, "$1•••$2") : "");

// GET /admin-email-settings
export const getAdminEmailSettings = async (req, res) => {
    try {
        const settings = await getEmailSettings(true);
        const c = emailConfig();
        ok(res, "Email settings fetched", {
            emailsEnabled: settings.emailsEnabled,
            disabledTypes: settings.disabledTypes || [],
            types: Object.entries(EMAIL_TYPES).map(([key, v]) => ({ key, label: v.label, userCanOptOut: Boolean(v.pref) })),
            smtp: { configured: isSmtpConfigured(), host: c.host, port: c.port, user: maskEmail(c.user), dryRun: c.dryRun },
            adminEmailConfigured: Boolean(c.adminEmail)
        });
    } catch (err) { bad(res, 500, "Internal Server Error"); }
};

// POST /admin-email-settings  { emailsEnabled?: boolean, disabledTypes?: string[] }
export const updateAdminEmailSettings = async (req, res) => {
    try {
        const { emailsEnabled, disabledTypes } = req.body || {};
        const update = { updatedBy: req.user.id, updatedAt: new Date() };
        if (emailsEnabled !== undefined) {
            if (typeof emailsEnabled !== "boolean") return bad(res, 400, "emailsEnabled must be true or false");
            update.emailsEnabled = emailsEnabled;
        }
        if (disabledTypes !== undefined) {
            if (!Array.isArray(disabledTypes) || disabledTypes.some((t) => !EMAIL_TYPES[t])) return bad(res, 400, "Unknown email type in disabledTypes");
            update.disabledTypes = [...new Set(disabledTypes)];
        }
        await EmailSettingModel.findOneAndUpdate({ key: "email" }, { $set: update, $setOnInsert: { key: "email" } }, { upsert: true });
        invalidateEmailSettings();
        const settings = await getEmailSettings(true);
        ok(res, "Email settings saved", { emailsEnabled: settings.emailsEnabled, disabledTypes: settings.disabledTypes });
    } catch (err) { bad(res, 500, "Internal Server Error"); }
};

// GET /admin-email-logs?page=1&limit=25&status=failed&type=new_project
export const getAdminEmailLogs = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
        const filter = {};
        if (["sent", "failed", "skipped"].includes(req.query.status)) filter.status = req.query.status;
        if (EMAIL_TYPES[req.query.type]) filter.type = req.query.type;
        const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
        const [logs, total, statRows] = await Promise.all([
            EmailLogModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            EmailLogModel.countDocuments(filter),
            EmailLogModel.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: "$status", n: { $sum: 1 } } }])
        ]);
        const stats = { sent: 0, failed: 0, skipped: 0 };
        statRows.forEach((r) => { stats[r._id] = r.n; });
        ok(res, "Email logs fetched", { logs, total, page, pages: Math.ceil(total / limit) || 1, stats7d: stats });
    } catch (err) { bad(res, 500, "Internal Server Error"); }
};

// POST /admin-email-test  { send?: boolean }  — real SMTP handshake, optionally a real email to the admin's own address
export const testAdminEmail = async (req, res) => {
    try {
        const check = await verifySmtp();
        if (!check.ok) return ok(res, "SMTP check failed", { smtpOk: false, error: check.error });
        if (!req.body?.send) return ok(res, "SMTP connection verified", { smtpOk: true });
        const admin = await userModel.findById(req.user.id).select("email name");
        const { subject, html, text } = templates.generic({ subject: "SMTP test email", text: `Hi ${admin?.name || "admin"},\n\nThis is a real test email sent from your server's SMTP settings. If you can read this, email delivery works.` });
        const sent = await sendEmail({ to: admin?.email, type: "general", subject, html, text });
        ok(res, sent.ok ? "Test email sent" : "Test email not sent", { smtpOk: true, sent: Boolean(sent.ok), detail: sent.error || sent.skipped || null, to: maskEmail(admin?.email) });
    } catch (err) { bad(res, 500, "Internal Server Error"); }
};

// GET /admin-activity — registrations, new projects and bids merged into one recent-activity feed
export const getAdminActivity = async (req, res) => {
    try {
        const [users, projects, bids] = await Promise.all([
            userModel.find({ type: { $in: ["user", "client"] } }).sort({ createdAt: -1 }).limit(15).select("name type createdAt"),
            ProjectModel.find().sort({ createdAt: -1 }).limit(15).select("title status createdAt"),
            BidModel.find().sort({ createdAt: -1 }).limit(15).select("amount status projectId createdAt")
        ]);
        const feed = [
            ...users.map((u) => ({ kind: "registration", text: `${u.name || "Someone"} registered as a ${u.type === "client" ? "client" : "freelancer"}`, at: u.createdAt })),
            ...projects.map((p) => ({ kind: "project", text: `Project posted: ${p.title} (${p.status})`, at: p.createdAt })),
            ...bids.map((b) => ({ kind: "bid", text: `Bid of ₹${b.amount} placed (${b.status})`, at: b.createdAt }))
        ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 30);
        ok(res, "Activity fetched", feed);
    } catch (err) { bad(res, 500, "Internal Server Error"); }
};

// POST /admin-delete-bid { bidId }
export const adminDeleteBid = async (req, res) => {
    try {
        const { bidId } = req.body || {};
        const bid = bidId ? await BidModel.findById(bidId) : null;
        if (!bid) return bad(res, 404, "Bid not found");
        const project = await ProjectModel.findById(bid.projectId);
        if (project && bid.status === "accepted" && ["assigned", "in_progress", "awaiting_review"].includes(project.status)) {
            return bad(res, 400, "This bid is the accepted bid of an active project and cannot be deleted");
        }
        await BidModel.findByIdAndDelete(bidId);
        await createNotification({ userId: bid.developerId, senderName: "Admin", message: `Your bid on "${project?.title || "a project"}" was removed by an administrator.`, type: "admin_alert", relatedProjectId: bid.projectId });
        ok(res, "Bid deleted", null);
    } catch (err) { bad(res, 500, "Internal Server Error"); }
};
