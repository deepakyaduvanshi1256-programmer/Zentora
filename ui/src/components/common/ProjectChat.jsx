import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import axiosInstance from "../../utils/axiosInstance";

const neuBackground = "#e9edf4";
const neuInset = "inset 5px 5px 10px #cbd0d8, inset -5px -5px 10px #ffffff";
const neuRaised = "9px 9px 18px #cbd0d8, -9px -9px 18px #ffffff";

const ProjectChat = ({ project, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [tappedMessage, setTappedMessage] = useState(null);
  const socketRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    let active = true;
    axiosInstance
      .get(`/project-message/${project._id}`)
      .then((response) => {
        if (active) setMessages(response?.data?.result || []);
      })
      .catch(() => {});
    const apiUrl = (
      import.meta.env.VITE_API_URL || "http://localhost:3001"
    ).replace(/\/$/, "");
    const socket = io(apiUrl, {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      socket.emit("join-project", { projectId: project._id });
      socket.emit("mark-project-messages-read", { projectId: project._id });
    });
    socket.on("project-messages-read", ({ readerId }) => {
      setMessages((current) => current.map((message) =>
        String(message.senderId) !== String(readerId)
          ? { ...message, readBy: [...new Set([...(message.readBy || []), readerId])] }
          : message,
      ));
    });
    socket.on("project-message", (message) => {
      setMessages((current) =>
        current.some((item) => item._id === message._id)
          ? current
          : [...current, message],
      );
      socket.emit("mark-project-messages-read", { projectId: project._id });
    });
    return () => {
      active = false;
      socket.disconnect();
    };
  }, [project._id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const message = text.trim();
    if (!message || sending || !socketRef.current?.connected) return;
    setSending(true);
    socketRef.current.emit(
      "project-message",
      { projectId: project._id, message },
      (response) => {
        if (response?.success) setText("");
        setSending(false);
      },
    );
  };

  const storedUser = JSON.parse(localStorage.getItem("info") || "{}");
  const currentUserId = storedUser._id || storedUser.id;
  const markMessageRead = (message) => {
    if (String(message.senderId) === String(currentUserId)) return;
    setMessages((current) => current.map((item) =>
      item._id === message._id ? { ...item, readBy: [...new Set([...(item.readBy || []), currentUserId])] } : item,
    ));
    socketRef.current?.emit("mark-project-messages-read", { projectId: project._id });
  };
  return (
    <div
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className="d-flex align-items-center justify-content-center p-3"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1060,
        background: "rgba(57,66,82,.46)",
        backdropFilter: "blur(8px)",
      }}
    >
      <section
        className="d-flex flex-column"
        style={{
          width: "min(680px, 100%)",
          height: "min(720px, calc(100vh - 32px))",
          overflow: "hidden",
          borderRadius: "28px",
          background: neuBackground,
          boxShadow: "16px 16px 32px rgba(123,130,145,.7), -16px -16px 32px rgba(255,255,255,.95)",
        }}
      >
        <header className="d-flex align-items-center justify-content-between px-4 py-3" style={{ background: neuBackground, borderBottom: "1px solid rgba(255,255,255,.65)" }}>
          <div>
            <span className="fw-bold text-uppercase" style={{ color: "#7c3aed", fontSize: "0.72rem", letterSpacing: "0.12em" }}>
              Live project chat
            </span>
            <h4 className="mb-0 fw-bold" style={{ color: "#273244" }}>{project.title}</h4>
          </div>
          <button
            type="button"
            aria-label="Close chat"
            onClick={onClose}
            style={{ width: 42, height: 42, border: 0, borderRadius: "50%", background: neuBackground, boxShadow: neuRaised, color: "#273244" }}
          >✕</button>
        </header>
        <div
          className="flex-grow-1 overflow-auto p-4"
          style={{ background: neuBackground }}
        >
          {messages.length === 0 && (
            <div className="text-center mx-auto mt-4 p-4 rounded-4" style={{ maxWidth: 360, color: "#7b8494", boxShadow: neuInset }}>
              No messages yet.<br />Start the conversation.
            </div>
          )}
          {messages.map((message) => {
            const mine = String(message.senderId) === String(currentUserId);
            return (
              <div
                key={message._id || `${message.createdAt}-${message.message}`}
                className={`d-flex mb-3 ${mine ? "justify-content-end" : "justify-content-start"}`}
              >
                <div
                  className="px-3 py-2"
                  onClick={() => markMessageRead(message)}
                  onDoubleClick={() => setTappedMessage((current) => current === message._id ? null : message._id)}
                  title="Single tap to mark as read. Double tap to add a read reaction."
                  style={{ maxWidth: "80%", borderRadius: mine ? "20px 20px 5px 20px" : "20px 20px 20px 5px", background: mine ? "linear-gradient(135deg, #ddd6fe, #c4b5fd)" : neuBackground, color: "#273244", boxShadow: neuRaised, cursor: "pointer", position: "relative" }}
                >
                  <div>{message.message}</div>
                  {message.deliveryFileUrl && (
                    <a
                      className="small d-block mt-1"
                      href={message.deliveryFileUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download delivery file
                    </a>
                  )}
                  {tappedMessage === message._id && (
                    <span style={{ position: "absolute", right: mine ? -14 : "auto", left: mine ? "auto" : -14, bottom: -10, width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", background: "#22c55e", color: "white", boxShadow: neuRaised, fontWeight: 800 }}>✓</span>
                  )}
                  <small className="d-block mt-2 text-end" style={{ opacity: 0.62 }}>
                    {message.createdAt
                      ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Now"}
                    {mine && (
                      <span className="ms-2" style={{ color: (message.readBy || []).some((id) => String(id) !== String(currentUserId)) ? "#16a34a" : "#64748b", fontWeight: 700 }}>
                        {(message.readBy || []).some((id) => String(id) !== String(currentUserId)) ? "✓✓ Read" : "✓ Delivered"}
                      </span>
                    )}
                    {!mine && !(message.readBy || []).includes(String(currentUserId)) && (
                      <span className="ms-2" style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,.18)" }} title="Unread message"></span>
                    )}
                  </small>
                </div>
              </div>
            );
          })}
          <div ref={endRef}></div>
        </div>
        <div className="d-flex gap-3 p-3 px-4" style={{ background: neuBackground }}>
          <input
            className="form-control rounded-pill"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            placeholder="Type a project message..."
            style={{ border: 0, borderRadius: "22px", background: neuBackground, boxShadow: neuInset, padding: "12px 18px", color: "#273244" }}
          />
          <button
            type="button"
            disabled={sending || !text.trim()}
            onClick={sendMessage}
            style={{ border: 0, borderRadius: "22px", minWidth: 92, background: "linear-gradient(135deg, #22c55e, #14b8a6)", color: "#ffffff", fontWeight: 700, boxShadow: neuRaised }}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProjectChat;
