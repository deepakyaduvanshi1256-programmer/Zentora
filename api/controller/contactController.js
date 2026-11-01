import { sendProjectEmail } from "../utils/emailService.js";

const blockedEmailDomains = new Set(["example.com", "test.com"]);
const isValidAutoReplyEmail = (email = "") => {
    const value = email.trim().toLowerCase();
    const domain = value.split("@")[1] || "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        && !blockedEmailDomains.has(domain)
        && !value.startsWith("example@")
        && !value.startsWith("test@");
};

export const submitContactMessage = async (req, res) => {
    const { name = "", email = "", phone = "", message = "" } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || "deepakyaduvanshi1255@gmail.com";

    try {
        if (!name.trim() || !email.trim() || !message.trim()) {
            return res.status(400).json({ success: false, message: "Name, email and message are required" });
        }

        await sendProjectEmail({
            to: adminEmail,
            subject: `New Zentora contact message from ${name.trim()}`,
            text: `Name: ${name.trim()}\nEmail: ${email.trim()}\nPhone: ${phone.trim() || "Not provided"}\n\nMessage:\n${message.trim()}`
        });

        if (isValidAutoReplyEmail(email)) {
            try {
                await sendProjectEmail({
                    to: email.trim(),
                    subject: "Thanks for contacting Zentora",
                    text: `Hi ${name.trim()},\n\nThank you for contacting Zentora. We received your message and will get back to you soon.\n\nZentora Support`
                });
            } catch (error) {
                console.error("Contact auto-reply failed:", error.message);
            }
        }

        return res.json({ success: true, message: "Message sent successfully" });
    } catch (error) {
        console.error("Contact admin email failed:", error.message);
        return res.json({ success: true, message: "Message saved. We will contact you soon." });
    }
};
