import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from '../models/model.js'
import { JWT_SECRET } from "../middleware/auth.js";
import { sendToUser, sendTemplate, getAdminRecipients, runInBackground } from "../services/email.service.js";
import { notifyAdmins } from "../services/notification.service.js";
import { emailQuery, normalizeEmail, fail } from "../utils/validate.js";

// Only these roles can self-register. "admin" accounts are created with `npm run create-admin`
// (previously any caller could POST type:"admin" and become an administrator).
const SELF_REGISTER_TYPES = ["client", "user"];

export const userRegister = async (req, res) => {
    try {
        const { type, name, password } = req.body || {};
        const email = normalizeEmail(req.body?.email);
        if (!SELF_REGISTER_TYPES.includes(type)) return fail(res, 400, "Please select a valid account type");
        if (!name || !String(name).trim() || String(name).length > 100) return fail(res, 400, "Name is required (max 100 characters)");
        if (!email) return fail(res, 400, "Please enter a valid email address");
        if (typeof password !== "string" || password.length < 6 || password.length > 128) return fail(res, 400, "Password must be 6 to 128 characters");

        const isExist = await userModel.findOne({ email: emailQuery(email) });
        if (isExist) {
            return res.json({
                code: 400,
                success: false,
                message: "User already exists",
                result: "",
                error: true
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // new developers get a free starter token balance, clients/admin don't need tokens
        const startingCredit = type === "user" ? 50 : 0;
        const data = new userModel({ type, name: String(name).trim(), email, password: hashedPassword, credit: startingCredit })
        const result = await data.save()

        // Emails + in-app admin notification run after the response; a mail failure never breaks sign-up.
        runInBackground("Registration notifications", async () => {
            const info = { name: result.name, email: result.email, type: result.type, createdAt: result.createdAt };
            await sendToUser(result, "welcome", "welcome", info, { dedupeKey: `welcome:${result._id}` });
            const admins = await getAdminRecipients();
            await Promise.all(admins.map((admin) =>
                sendTemplate(admin.email, "admin_registration", "adminNewRegistration", info, `admin_registration:${result._id}:${admin.email}`)));
            await notifyAdmins({
                message: `New ${result.type === "client" ? "client" : "user"} registered: ${result.name} (${result.email})`,
                type: "registration", senderId: result._id.toString(), senderName: result.name
            });
        });

        const safeResult = result.toObject();
        delete safeResult.password;
        res.json({
            code: 200,
            success: true,
            message: "User register successfully.",
            result: safeResult,
            error: false
        })
    } catch (err) {
        console.error("Register failed:", err.message);
        res.json({
            code: 500,
            success: false,
            message: "Internal Server Error",
            result: "",
            error: true
        })
    }
}

export const userLogin = async (req, res) => {
    try {
        const { password } = req.body || {};
        const email = String(req.body?.email || "").trim();
        if (!email || typeof password !== "string" || !password) return fail(res, 400, "Email and password are required");
        const user = await userModel.findOne({ email: emailQuery(email) });
        if (!user) {
            return res.json({
                code: 404,
                success: false,
                message: "Invalid email or password.",
                result: '',
                error: true
            })
        }
        if (user.isDeleted) {
            return res.json({ code: 403, success: false, message: "This account has been deleted", result: "", error: true })
        }
        if (user.isBlocked) {
            return res.json({
                code: 403,
                success: false,
                message: "Your account has been blocked. Contact support.",
                result: '',
                error: true
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({
                code: 404,
                success: false,
                message: "Invalid email or password.",
                result: '',
                error: true
            })
        }
        const token = jwt.sign({ id: user._id, type: user.type }, JWT_SECRET, { expiresIn: "7d" });
        // Sign-in alert (existing behaviour): now a typed email the admin or the user can switch off.
        runInBackground("Login alert", () =>
            sendToUser(user, "login_alert", "loginAlert", { name: user.name }));
        const safeUser = user.toObject();
        delete safeUser.password;
        res.json({
            code: 200,
            success: true,
            message: "Login successful",
            result: { user: safeUser, token },
            error: false
        })
    } catch (err) {
        console.error("Login failed:", err.message);
        res.json({
            code: 500,
            success: false,
            message: "Internal Server Error",
            result: "",
            error: true
        })
    }
}
