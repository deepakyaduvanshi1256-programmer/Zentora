// Backwards-compatible wrappers. ~35 existing call sites in the controllers use these two functions
// with plain text; they now render the branded HTML layout and go through the shared email service
// (admin on/off switches, delivery log, duplicate guard, per-recipient throttle, batching).
// New code should call services/email.service.js directly with a typed template.
import { sendEmail, sendToUsers } from "../services/email.service.js";
import { templates } from "../templates/emailTemplates.js";

export const sendProjectEmail = async ({ to, subject, text, type = "general", dedupeKey = null }) => {
    const { html } = templates.generic({ subject, text });
    const result = await sendEmail({ to, type, subject, html, text, dedupeKey });
    return Boolean(result.ok);
};

export const sendBulkProjectEmails = async (recipients, { subject, text, type = "general" }) => {
    if (!Array.isArray(recipients)) return { requested: 0, eligible: 0, sent: 0, failed: 0, skipped: 0 };
    const { html } = templates.generic({ subject, text });
    return sendToUsers(recipients.map((email) => ({ email })), {
        type, respectPrefs: false, build: () => ({ subject, html, text })
    });
};
