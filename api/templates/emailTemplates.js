import { emailConfig } from "../config/email.js";

// ---------- helpers ----------
export const esc = (value) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const clip = (value, max = 300) => {
    const text = String(value ?? "").trim();
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
};
const money = (v) => (v === undefined || v === null || v === "" ? "—" : `₹${esc(v)}`);
const date = (d = new Date()) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
const roleLabel = (type) => (type === "client" ? "Client" : type === "admin" ? "Admin" : "Freelancer");

const row = (label, value) =>
    `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:38%;vertical-align:top">${esc(label)}</td>` +
    `<td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;vertical-align:top">${value}</td></tr>`;

const detailTable = (rows) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;margin:18px 0">${rows.join("")}</table>`;

// ---------- responsive layout (table based + inline CSS for email clients) ----------
const layout = ({ title, preheader = "", bodyHtml, ctaLabel, ctaUrl, footerNote }) => {
    const { appName, frontendUrl } = emailConfig();
    const cta = ctaLabel && ctaUrl
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px"><tr><td style="border-radius:8px;background:#0d6efd">` +
          `<a href="${esc(ctaUrl)}" style="display:inline-block;padding:12px 26px;color:#ffffff;font-weight:600;font-size:15px;text-decoration:none;border-radius:8px">${esc(ctaLabel)}</a></td></tr></table>`
        : "";
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden">
    <tr><td style="background:#0d6efd;padding:22px 28px;color:#ffffff;font-size:20px;font-weight:700">${esc(appName)}</td></tr>
    <tr><td style="padding:28px">
      <h1 style="margin:0 0 14px;font-size:21px;line-height:1.3;color:#111827">${esc(title)}</h1>
      ${bodyHtml}
      ${cta}
    </td></tr>
    <tr><td style="padding:18px 28px;background:#f9fafb;color:#6b7280;font-size:12px;line-height:1.6">
      ${footerNote ? `${esc(footerNote)}<br>` : ""}
      You are receiving this because you have an account on <a href="${esc(frontendUrl)}" style="color:#0d6efd">${esc(appName)}</a>.
    </td></tr>
  </table>
</td></tr></table></body></html>`;
};

const p = (html) => `<p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6">${html}</p>`;
const result = (subject, html, text) => ({ subject, html, text });

// ---------- templates ----------
export const templates = {
    welcome: ({ name, email, type, createdAt }) => {
        const url = `${emailConfig().frontendUrl}/login`;
        return result(
            `Welcome to ${emailConfig().appName}!`,
            layout({
                title: `Welcome, ${name || "there"}!`,
                preheader: "Your account is ready.",
                bodyHtml: p(`Your <strong>${roleLabel(type)}</strong> account has been created successfully.`) +
                    detailTable([row("Name", esc(name || "—")), row("Email", esc(email)), row("Role", roleLabel(type)), row("Registered on", date(createdAt))]) +
                    p(type === "client" ? "You can now post projects and review bids from talented freelancers." : "You can now browse open projects and place bids. A starter token balance has been added to your wallet."),
                ctaLabel: "Sign in",
                ctaUrl: url
            }),
            `Welcome to ${emailConfig().appName}, ${name || ""}! Your ${roleLabel(type)} account is ready. Sign in: ${url}`
        );
    },

    adminNewRegistration: ({ name, email, type, createdAt }) =>
        result(
            `New ${roleLabel(type).toLowerCase()} registered: ${name || email}`,
            layout({
                title: `New ${roleLabel(type)} registration`,
                bodyHtml: detailTable([row("Name", esc(name || "—")), row("Email", esc(email)), row("Role", roleLabel(type)), row("Registered on", date(createdAt))]),
                ctaLabel: "Open admin dashboard",
                ctaUrl: `${emailConfig().frontendUrl}/admin-dashboard`
            }),
            `New ${roleLabel(type)} registered: ${name || ""} <${email}> on ${date(createdAt)}.`
        ),

    projectPostedOwner: ({ project }) =>
        result(
            `Project posted: ${project.title}`,
            layout({
                title: "Your project is live",
                bodyHtml: p("Freelancers can now see and bid on your project.") +
                    detailTable([row("Title", esc(project.title)), row("Budget", money(project.budget)), row("Timeline", esc(project.duration || "—"))]),
                ctaLabel: "Manage your projects",
                ctaUrl: `${emailConfig().frontendUrl}/client-manage-project`
            }),
            `Your project "${project.title}" is live. Budget ${project.budget}, timeline ${project.duration}.`
        ),

    // sent to eligible users/clients (never the owner)
    newProject: ({ project, client, link }) =>
        result(
            `New project: ${project.title}`,
            layout({
                title: "A new project was just posted",
                preheader: `${project.title} — budget ${project.budget}`,
                bodyHtml: detailTable([
                    row("Project", esc(project.title)),
                    row("Description", esc(clip(project.des))),
                    row("Budget", money(project.budget)),
                    row("Deadline / duration", esc(project.duration || "—")),
                    row("Posted by", esc(client?.name || "A client"))
                ]),
                ctaLabel: "View project",
                ctaUrl: link,
                footerNote: "You can turn off new-project emails in your profile settings."
            }),
            `New project "${project.title}" (budget ${project.budget}, ${project.duration}) posted by ${client?.name || "a client"}. View: ${link}`
        ),

    newProjectAdmin: ({ project, client }) =>
        result(
            `Project posted: ${project.title}`,
            layout({
                title: "New project posted",
                bodyHtml: detailTable([
                    row("Project", esc(project.title)),
                    row("Description", esc(clip(project.des))),
                    row("Budget", money(project.budget)),
                    row("Deadline / duration", esc(project.duration || "—")),
                    row("Client", `${esc(client?.name || "—")} (${esc(client?.email || "—")})`)
                ]),
                ctaLabel: "Review in admin panel",
                ctaUrl: `${emailConfig().frontendUrl}/admin-project`
            }),
            `${client?.name || "A client"} posted "${project.title}" (budget ${project.budget}).`
        ),

    bidReceived: ({ project, developer, bid }) =>
        result(
            `New bid on "${project.title}"`,
            layout({
                title: "You received a new bid",
                bodyHtml: detailTable([
                    row("Project", esc(project.title)),
                    row("Freelancer", esc(developer?.name || "A freelancer")),
                    row("Bid amount", money(bid.amount)),
                    row("Delivery time", esc(bid.duration || "—")),
                    row("Proposal", esc(clip(bid.proposal, 250) || "—"))
                ]),
                ctaLabel: "Review bids",
                ctaUrl: `${emailConfig().frontendUrl}/client-review-bids`
            }),
            `${developer?.name || "A freelancer"} bid ${bid.amount} on "${project.title}".`
        ),

    bidSubmitted: ({ project, bid }) =>
        result(
            `Bid submitted: ${project.title}`,
            layout({
                title: "Your bid was submitted",
                bodyHtml: p("The client has been notified.") +
                    detailTable([row("Project", esc(project.title)), row("Bid amount", money(bid.amount)), row("Delivery time", esc(bid.duration || "—"))]),
                ctaLabel: "View my bids",
                ctaUrl: `${emailConfig().frontendUrl}/user-bids`
            }),
            `Your bid of ${bid.amount} on "${project.title}" was submitted.`
        ),

    bidAccepted: ({ project, bid, client }) =>
        result(
            `Your bid was accepted: ${project.title}`,
            layout({
                title: "Congratulations — your bid was accepted!",
                bodyHtml: detailTable([row("Project", esc(project.title)), row("Client", esc(client?.name || "—")), row("Accepted amount", money(bid?.amount))]) +
                    p("Open the project to start the conversation with your client."),
                ctaLabel: "Open my projects",
                ctaUrl: `${emailConfig().frontendUrl}/user-project`
            }),
            `Your bid on "${project.title}" was accepted by ${client?.name || "the client"}.`
        ),

    bidRejected: ({ project, bid }) =>
        result(
            `Bid update: ${project.title}`,
            layout({
                title: "Your bid was not selected",
                bodyHtml: p("The client decided to go in a different direction this time. Don't be discouraged — there are many more open projects.") +
                    detailTable([row("Project", esc(project?.title || "—")), row("Your bid", money(bid?.amount))]),
                ctaLabel: "Browse open projects",
                ctaUrl: `${emailConfig().frontendUrl}/user-project`
            }),
            `Your bid on "${project?.title || "the project"}" was not selected.`
        ),

    profileUpdated: ({ name, changedFields }) =>
        result(
            "Your profile was updated",
            layout({
                title: "Profile updated",
                bodyHtml: p(`Hi ${esc(name || "there")}, your profile was just updated.`) +
                    detailTable([row("Fields changed", esc((changedFields || []).join(", ") || "—")), row("When", esc(new Date().toLocaleString("en-IN")))]) +
                    p("If this wasn't you, change your password immediately and contact support."),
                ctaLabel: "Open my profile",
                ctaUrl: `${emailConfig().frontendUrl}/login`
            }),
            `Your profile was updated (${(changedFields || []).join(", ")}). If this wasn't you, change your password.`
        ),

    accountStatus: ({ name, status, detail }) =>
        result(
            `Account ${status}`,
            layout({
                title: `Your account was ${esc(status)}`,
                bodyHtml: p(`Hi ${esc(name || "there")},`) + p(esc(detail || `Your account status is now: ${status}.`)),
                footerNote: "Contact support if you think this is a mistake."
            }),
            `Your account was ${status}. ${detail || ""}`
        ),

    loginAlert: ({ name }) =>
        result(
            "New sign-in to your account",
            layout({
                title: "New sign-in detected",
                bodyHtml: p(`Hi ${esc(name || "there")}, you signed in at ${esc(new Date().toLocaleString("en-IN"))}.`) +
                    p("If this wasn't you, change your password right away."),
            }),
            `You signed in at ${new Date().toLocaleString("en-IN")}.`
        ),

    // wrapper used by legacy plain-text call sites so they also get the branded HTML layout
    generic: ({ subject, text }) =>
        result(
            subject,
            layout({
                title: subject,
                bodyHtml: String(text || "").split(/\n{2,}/).map((chunk) => p(esc(chunk).replace(/\n/g, "<br>"))).join("")
            }),
            String(text || "")
        )
};
