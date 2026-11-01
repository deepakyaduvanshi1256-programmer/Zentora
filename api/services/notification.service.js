import { NotificationModel, userModel } from "../models/model.js";

/** Create one in-app notification. Never throws. */
export const createNotification = async (data) => {
    try {
        if (!data?.userId || !data?.message) return null;
        return await NotificationModel.create({ ...data, userId: String(data.userId) });
    } catch (err) {
        console.error("Notification create failed:", err.message);
        return null;
    }
};

/** Create many in-app notifications at once. Never throws. */
export const createNotifications = async (items) => {
    try {
        const docs = (items || []).filter((i) => i?.userId && i?.message).map((i) => ({ ...i, userId: String(i.userId) }));
        if (!docs.length) return 0;
        await NotificationModel.insertMany(docs, { ordered: false });
        return docs.length;
    } catch (err) {
        console.error("Bulk notification create failed:", err.message);
        return 0;
    }
};

/** In-app notification for every active admin account. */
export const notifyAdmins = async ({ message, type = "admin_alert", senderId = null, senderName = "System", relatedProjectId = null }) => {
    try {
        const admins = await userModel.find({ type: "admin", isDeleted: { $ne: true } }).select("_id name");
        return await createNotifications(admins.map((a) => ({
            userId: a._id, senderId, senderName, recipientName: a.name || "Admin", message, type, relatedProjectId
        })));
    } catch (err) {
        console.error("notifyAdmins failed:", err.message);
        return 0;
    }
};
