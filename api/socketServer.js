import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./middleware/auth.js";
import { ProjectModel, ProjectMessageModel } from "./models/model.js";

let io;

export const initSocketServer = (httpServer) => {
    io = new Server(httpServer, { cors: { origin: true, credentials: true } });
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) return next(new Error("Authentication required"));
            socket.user = jwt.verify(token, JWT_SECRET);
            next();
        } catch {
            next(new Error("Invalid authentication token"));
        }
    });
    io.on("connection", (socket) => {
        socket.on("join-project", async ({ projectId }) => {
            if (!projectId) return;
            const project = await ProjectModel.findOne({ _id: projectId });
            if (!project) return;
            const userId = socket.user.id;
            if (project.clientId?.toString() !== userId && project.assignedTo?.toString() !== userId) return;
            socket.join(`project:${projectId}`);
        });
        socket.on("mark-project-messages-read", async ({ projectId }) => {
            if (!projectId) return;
            const project = await ProjectModel.findOne({ _id: projectId });
            if (!project) return;
            const userId = socket.user.id;
            if (project.clientId?.toString() !== userId && project.assignedTo?.toString() !== userId) return;
            const result = await ProjectMessageModel.updateMany(
                { projectId, recipientId: userId, readBy: { $ne: userId } },
                { $addToSet: { readBy: userId }, $set: { readAt: new Date() } }
            );
            if (result.modifiedCount) io.to(`project:${projectId}`).emit("project-messages-read", { projectId, readerId: userId });
        });
        socket.on("project-message", async ({ projectId, message }, callback) => {
            try {
                const text = String(message || "").trim();
                if (!text || !projectId) return callback?.({ success: false, message: "Message is required" });
                const project = await ProjectModel.findOne({ _id: projectId });
                if (!project) return callback?.({ success: false, message: "Project not found" });
                const userId = socket.user.id;
                if (project.clientId?.toString() !== userId && project.assignedTo?.toString() !== userId) return callback?.({ success: false, message: "Access denied" });
                const recipientId = project.clientId?.toString() === userId ? project.assignedTo?.toString() : project.clientId?.toString();
                if (!recipientId) return callback?.({ success: false, message: "Freelancer is not assigned yet" });
                const saved = await ProjectMessageModel.create({ projectId, senderId: userId, recipientId, message: text });
                io.to(`project:${projectId}`).emit("project-message", saved);
                callback?.({ success: true, message: "Message sent", result: saved });
            } catch (error) {
                callback?.({ success: false, message: "Unable to send message" });
            }
        });
    });
    return io;
};

export const emitProjectMessage = (projectId, message) => {
    if (io) io.to(`project:${projectId}`).emit("project-message", message);
};
