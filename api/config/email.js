import nodemailer from "nodemailer";

// All values are read lazily so dotenv has always run before they are used.
// SMTP credentials live ONLY in the backend environment — never in the React/Android bundle.
export const emailConfig = () => ({
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    user: (process.env.SMTP_USER || "").trim(),
    pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""), // Gmail app passwords are shown with spaces
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "",
    adminEmail: (process.env.ADMIN_EMAIL || "").trim(),
    frontendUrl: (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, ""),
    appName: process.env.APP_NAME || "Freelancing 24x7",
    batchSize: Math.max(1, Number(process.env.EMAIL_BATCH_SIZE || 10)),
    batchDelayMs: Math.max(0, Number(process.env.EMAIL_BATCH_DELAY_MS || 1000)),
    maxPerRecipientPerHour: Math.max(1, Number(process.env.EMAIL_MAX_PER_RECIPIENT_PER_HOUR || 20)),
    // EMAIL_DRY_RUN=true renders and logs emails as "skipped" without contacting SMTP (local testing only)
    dryRun: process.env.EMAIL_DRY_RUN === "true"
});

export const isSmtpConfigured = () => {
    const c = emailConfig();
    return Boolean(c.host && c.user && c.pass);
};

let transporter = null;
let transporterKey = "";

// One pooled transporter is reused for every email (the old code opened a new connection per message).
export const getTransporter = () => {
    const c = emailConfig();
    if (!isSmtpConfigured()) return null;
    const key = `${c.host}:${c.port}:${c.secure}:${c.user}`;
    if (!transporter || transporterKey !== key) {
        transporter = nodemailer.createTransport({
            host: c.host,
            port: c.port,
            secure: c.secure,
            pool: true,
            maxConnections: 3,
            maxMessages: 100,
            auth: { user: c.user, pass: c.pass }
        });
        transporterKey = key;
    }
    return transporter;
};

// Used by the admin "test connection" button — returns a real SMTP handshake result.
export const verifySmtp = async () => {
    const t = getTransporter();
    if (!t) return { ok: false, error: "SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)" };
    try {
        await t.verify();
        return { ok: true };
    } catch (err) {
        return { ok: false, error: err.message };
    }
};
