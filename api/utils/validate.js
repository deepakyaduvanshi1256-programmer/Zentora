import { normalizeEmail } from "../services/email.service.js";

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Case-insensitive exact email match that also finds older accounts stored with mixed case. */
export const emailQuery = (email) => ({ $regex: new RegExp(`^${escapeRegex(String(email).trim())}$`, "i") });

export const fail = (res, code, message) =>
    res.json({ code, success: false, message, result: "", error: true });

export { normalizeEmail };
