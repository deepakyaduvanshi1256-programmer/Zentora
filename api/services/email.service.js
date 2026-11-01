import { emailConfig, getTransporter, isSmtpConfigured } from "../config/email.js";
import { templates } from "../templates/emailTemplates.js";
import { EmailLogModel, EmailSettingModel, userModel } from "../models/model.js";

// Every email type the platform can send. `pref` links a type to a per-user preference
// (users can opt out); types with pref:null are always sent unless an admin disables the type globally.
export const EMAIL_TYPES = {
    welcome:              { label: "Welcome email (new user/client)",        pref: null },
    admin_registration:   { label: "Admin: new registration alert",          pref: null },
    project_posted_owner: { label: "Project posted confirmation (client)",   pref: null },
    new_project:          { label: "New project broadcast (users & clients)", pref: "newProjects" },
    new_project_admin:    { label: "Admin: new project alert",               pref: null },
    bid_received:         { label: "Bid received (client)",                  pref: "bids" },
    bid_submitted:        { label: "Bid submitted confirmation (freelancer)", pref: "bids" },
    bid_accepted:         { label: "Bid accepted (freelancer)",              pref: "bids" },
    bid_rejected:         { label: "Bid rejected (freelancer)",              pref: "bids" },
    profile_updated:      { label: "Profile updated",                        pref: "profile" },
    account_status:       { label: "Account status changed",                 pref: null },
    login_alert:          { label: "New sign-in alert",                      pref: "loginAlerts" },
    admin_activity:       { label: "Admin: important activity alerts",       pref: null },
    general:              { label: "Other project / chat emails",            pref: null }
};

// ---------------- validation ----------------
const EMAIL_RE = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]{2,}$/;
export const normalizeEmail = (value) => {
    const email = String(value ?? "").trim().toLowerCase();
    if (!email || email.length > 254 || /[\r\n]/.test(email) || !EMAIL_RE.test(email)) return null;
    return email;
};

// ---------------- admin settings (cached 30s) ----------------
let settingsCache = { at: 0, value: null };
export const getEmailSettings = async (force = false) => {
    if (!force && settingsCache.value && Date.now() - settingsCache.at < 30000) return settingsCache.value;
    const doc = await EmailSettingModel.findOneAndUpdate(
        { key: "email" }, { $setOnInsert: { key: "email" } }, { upsert: true, returnDocument: "after" }
    );
    settingsCache = { at: Date.now(), value: doc.toObject() };
    return settingsCache.value;
};
export const invalidateEmailSettings = () => { settingsCache = { at: 0, value: null }; };

// ---------------- logging ----------------
const logEmail = async (entry) => {
    try { await EmailLogModel.create(entry); } catch (err) { console.error("Email log write failed:", err.message); }
};

// ---------------- per-recipient throttle + duplicate guards ----------------
const sentWindow = new Map();   // email -> [timestamps]
const inFlight = new Set();     // "email|dedupeKey" while sending
const underHourlyLimit = (email) => {
    const now = Date.now();
    const list = (sentWindow.get(email) || []).filter((t) => now - t < 3600000);
    if (list.length >= emailConfig().maxPerRecipientPerHour) { sentWindow.set(email, list); return false; }
    list.push(now);
    sentWindow.set(email, list);
    return true;
};

const isTransient = (err) => /ETIMEDOUT|ECONNRESET|ECONNECTION|EAI_AGAIN|421|450|451|452/.test(`${err?.code || ""} ${err?.responseCode || ""} ${err?.message || ""}`);

/**
 * Send ONE email to ONE recipient. Never throws — callers (project creation, bidding, …)
 * must never fail because an email failed. Every outcome is written to EmailLog.
 */
export const sendEmail = async ({ to, type = "general", subject, html, text, dedupeKey = null }) => {
    const email = normalizeEmail(to);
    const base = { type, to: email || String(to ?? "").slice(0, 200), subject, dedupeKey };
    try {
        if (!email) { await logEmail({ ...base, status: "skipped", reason: "invalid_email" }); return { ok: false, skipped: "invalid_email" }; }

        const settings = await getEmailSettings();
        if (!settings.emailsEnabled || (settings.disabledTypes || []).includes(type)) {
            await logEmail({ ...base, status: "skipped", reason: "disabled_by_admin" });
            return { ok: false, skipped: "disabled_by_admin" };
        }

        const flightKey = dedupeKey ? `${email}|${dedupeKey}` : null;
        if (flightKey) {
            if (inFlight.has(flightKey) || await EmailLogModel.exists({ to: email, dedupeKey, status: "sent" })) {
                await logEmail({ ...base, status: "skipped", reason: "duplicate" });
                return { ok: false, skipped: "duplicate" };
            }
            inFlight.add(flightKey);
        }

        try {
            if (!underHourlyLimit(email)) {
                await logEmail({ ...base, status: "skipped", reason: "rate_limited" });
                return { ok: false, skipped: "rate_limited" };
            }
            if (emailConfig().dryRun) {
                await logEmail({ ...base, status: "skipped", reason: "dry_run" });
                return { ok: false, skipped: "dry_run" };
            }
            const transport = getTransporter();
            if (!transport) {
                await logEmail({ ...base, status: "failed", reason: "smtp_not_configured" });
                return { ok: false, error: "smtp_not_configured" };
            }

            const message = { from: emailConfig().from, to: email, subject, html, text };
            let info;
            try {
                info = await transport.sendMail(message);
            } catch (err) {
                if (!isTransient(err)) throw err;
                await new Promise((r) => setTimeout(r, 1500));
                info = await transport.sendMail(message); // one retry for transient network errors
            }
            await logEmail({ ...base, status: "sent", messageId: info?.messageId || null });
            return { ok: true, messageId: info?.messageId };
        } finally {
            if (flightKey) inFlight.delete(flightKey);
        }
    } catch (err) {
        console.error("Email delivery failed:", err.message);
        await logEmail({ ...base, status: "failed", reason: String(err.message).slice(0, 300) });
        return { ok: false, error: err.message };
    }
};

/** Render a named template and send it. */
export const sendTemplate = (to, type, templateName, data, dedupeKey = null) => {
    const { subject, html, text } = templates[templateName](data);
    return sendEmail({ to, type, subject, html, text, dedupeKey });
};

// ---------------- recipients ----------------
const BLOCKED_STATUSES = ["blocked", "deleted", "suspended", "inactive", "banned"];

/** Active, non-blocked, non-deleted account with a valid address that has not opted out. */
export const isEligibleRecipient = (user, prefKey = null) => {
    if (!user || user.isDeleted || user.isBlocked) return false;
    if (BLOCKED_STATUSES.includes(String(user.status || "active").toLowerCase())) return false;
    if (!normalizeEmail(user.email)) return false;
    if (prefKey && user.emailPrefs?.[prefKey] === false) return false;
    return true;
};

/** Admin accounts in the DB plus the optional ADMIN_EMAIL env address (deduplicated). */
export const getAdminRecipients = async () => {
    const admins = await userModel.find({ type: "admin", isDeleted: { $ne: true }, isBlocked: { $ne: true } }).select("_id name email");
    const list = admins.map((a) => ({ _id: a._id, name: a.name, email: a.email }));
    const envAdmin = normalizeEmail(emailConfig().adminEmail);
    if (envAdmin && !list.some((a) => normalizeEmail(a.email) === envAdmin)) list.push({ _id: null, name: "Admin", email: envAdmin });
    return list;
};

/**
 * Send a templated email to one user document, honouring their preference for this type.
 * Use ignoreStatus:true for account-status notices (a blocked/deleted user must still be told).
 */
export const sendToUser = async (user, type, templateName, data, { dedupeKey = null, ignoreStatus = false } = {}) => {
    if (!user) return { ok: false, skipped: "no_user" };
    const prefKey = EMAIL_TYPES[type]?.pref || null;
    if (prefKey && user.emailPrefs?.[prefKey] === false) {
        await logEmail({ type, to: normalizeEmail(user.email) || String(user.email || ""), status: "skipped", reason: "user_opted_out", dedupeKey });
        return { ok: false, skipped: "user_opted_out" };
    }
    if (!ignoreStatus && !isEligibleRecipient(user)) {
        await logEmail({ type, to: normalizeEmail(user.email) || String(user.email || ""), status: "skipped", reason: "recipient_not_eligible", dedupeKey });
        return { ok: false, skipped: "recipient_not_eligible" };
    }
    return sendTemplate(user.email, type, templateName, data, dedupeKey);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Safe bulk delivery: each recipient gets an individual email (so no address is ever exposed to
 * another recipient — no CC/BCC lists), sent in small batches with a pause between batches.
 * `build(user)` returns { subject, html, text }.
 */
export const sendToUsers = async (users, { type, build, dedupeBase = null, respectPrefs = true }) => {
    const prefKey = respectPrefs ? EMAIL_TYPES[type]?.pref || null : null;
    const seen = new Set();
    const eligible = [];
    for (const u of users || []) {
        const email = normalizeEmail(u?.email);
        if (!email || seen.has(email)) continue;
        seen.add(email);
        if (isEligibleRecipient(u, prefKey)) eligible.push(u);
    }
    const summary = { requested: (users || []).length, eligible: eligible.length, sent: 0, failed: 0, skipped: 0 };
    const { batchSize, batchDelayMs } = emailConfig();
    for (let i = 0; i < eligible.length; i += batchSize) {
        const batch = eligible.slice(i, i + batchSize);
        const results = await Promise.all(batch.map((u) => {
            const { subject, html, text } = build(u);
            return sendEmail({ to: u.email, type, subject, html, text, dedupeKey: dedupeBase ? `${dedupeBase}:${u._id ?? u.email}` : null });
        }));
        for (const r of results) {
            if (r.ok) summary.sent += 1; else if (r.skipped) summary.skipped += 1; else summary.failed += 1;
        }
        if (i + batchSize < eligible.length && batchDelayMs) await sleep(batchDelayMs);
    }
    return summary;
};

/** Run side-effect work after the HTTP response; errors are logged, never thrown. */
export const runInBackground = (label, fn) => {
    setImmediate(async () => {
        try { await fn(); } catch (err) { console.error(`${label} failed:`, err.message); }
    });
};

export { isSmtpConfigured };
