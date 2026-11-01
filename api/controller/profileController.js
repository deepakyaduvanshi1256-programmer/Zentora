import bcrypt from "bcryptjs";
import { userModel } from "../models/model.js";
import { sendToUser, runInBackground } from "../services/email.service.js";

// Logged-in user's own profile (any role)
export const getMe = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) {
            return res.json({ code: 404, success: false, message: "User not found", result: "", error: true });
        }
        res.json({ code: 200, success: true, message: "Profile fetched", result: user, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Update editable profile fields for the logged-in user
export const updateProfile = async (req, res) => {
    try {
        const allowed = ["name", "phone", "location", "bio", "profile", "headline", "rate", "skill"];
        const updates = {};
        allowed.forEach((key) => {
            if (req.body[key] !== undefined) updates[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
        });
        if (updates.name !== undefined && (!String(updates.name).trim() || String(updates.name).length > 100)) {
            return res.json({ code: 400, success: false, message: "Name is required (max 100 characters)", result: "", error: true });
        }
        if (updates.bio !== undefined && String(updates.bio).length > 2000) {
            return res.json({ code: 400, success: false, message: "Bio is too long (max 2000 characters)", result: "", error: true });
        }
        // Configurable email preferences (booleans only)
        if (req.body.emailPrefs && typeof req.body.emailPrefs === "object") {
            ["newProjects", "bids", "profile", "loginAlerts"].forEach((key) => {
                if (typeof req.body.emailPrefs[key] === "boolean") updates[`emailPrefs.${key}`] = req.body.emailPrefs[key];
            });
        }
        const before = await userModel.findById(req.user.id).select("-password");
        if (!before) {
            return res.json({ code: 404, success: false, message: "User not found", result: "", error: true });
        }
        await userModel.findByIdAndUpdate(req.user.id, updates);
        const user = await userModel.findById(req.user.id).select("-password");
        res.json({ code: 200, success: true, message: "Profile updated", result: user, error: false });

        const changedFields = allowed.filter((key) => updates[key] !== undefined && String(before[key] ?? "") !== String(user[key] ?? ""));
        if (changedFields.length) {
            runInBackground("Profile update email", () =>
                sendToUser(user, "profile_updated", "profileUpdated", { name: user.name, changedFields }));
        }
    } catch (err) {
        console.error("Update profile failed:", err);
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Change password for the logged-in user (requires current password)
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.json({ code: 400, success: false, message: "Current and new password are required", result: "", error: true });
        }
        if (newPassword.length < 6) {
            return res.json({ code: 400, success: false, message: "New password must be at least 6 characters", result: "", error: true });
        }
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.json({ code: 404, success: false, message: "User not found", result: "", error: true });
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.json({ code: 400, success: false, message: "Current password is incorrect", result: "", error: true });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ code: 200, success: true, message: "Password changed successfully", result: "", error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};
