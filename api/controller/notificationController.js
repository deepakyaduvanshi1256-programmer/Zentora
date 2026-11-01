import { NotificationModel, userModel, ProjectModel } from "../models/model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
        const senderIds = [...new Set(notifications.map((item) => item.senderId).filter(Boolean))];
        const projectIds = [...new Set(notifications.map((item) => item.relatedProjectId).filter(Boolean))];
        const [senders, projects] = await Promise.all([
            userModel.find({ _id: { $in: senderIds } }).select("name type email"),
            ProjectModel.find({ _id: { $in: projectIds } }).select("title clientId assignedTo")
        ]);
        const senderMap = Object.fromEntries(senders.map((person) => [person._id.toString(), person.toObject()]));
        const projectMap = Object.fromEntries(projects.map((project) => [project._id.toString(), project.toObject()]));
        const recipient = await userModel.findById(userId).select("name");
        const result = notifications.map((item) => {
            const plain = item.toObject();
            const project = projectMap[plain.relatedProjectId];
            const sender = senderMap[plain.senderId];
            return {
                ...plain,
                senderName: plain.senderName && plain.senderName !== "Zentora" ? plain.senderName : sender?.name || plain.senderName || "Zentora",
                senderEmail: sender?.email || null,
                recipientName: plain.recipientName || recipient?.name || "You",
                recipientId: userId,
                projectTitle: project?.title || null
            };
        });
        const unreadCount = await NotificationModel.countDocuments({ userId, isRead: false });
        res.json({ code: 200, success: true, message: "Notifications fetched", result: { notifications: result, unreadCount }, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.body;
        const result = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, userId: req.user.id },
            { isRead: true },
            { new: true }
        );
        if (!result) return res.status(404).json({ code: 404, success: false, message: "Notification not found", result: null, error: true });
        res.json({ code: 200, success: true, message: "Marked as read", result, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await NotificationModel.updateMany({ userId, isRead: false }, { isRead: true });
        res.json({ code: 200, success: true, message: "All marked as read", result: "", error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Delete one of the logged-in user's own notifications
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.body || {};
        const removed = notificationId ? await NotificationModel.findOneAndDelete({ _id: notificationId, userId: req.user.id }) : null;
        if (!removed) return res.status(404).json({ code: 404, success: false, message: "Notification not found", result: null, error: true });
        res.json({ code: 200, success: true, message: "Notification deleted", result: null, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};

// Delete every notification the user has already read
export const deleteReadNotifications = async (req, res) => {
    try {
        const out = await NotificationModel.deleteMany({ userId: req.user.id, isRead: true });
        res.json({ code: 200, success: true, message: "Read notifications cleared", result: { deleted: out.deletedCount }, error: false });
    } catch (err) {
        res.json({ code: 500, success: false, message: "Internal Server Error", result: "", error: true });
    }
};
