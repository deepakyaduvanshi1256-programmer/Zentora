import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res?.data?.result?.notifications || []);
      setUnreadCount(res?.data?.result?.unreadCount || 0);
    } catch (err) {
      // fail silently — a broken bell shouldn't break navigation
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleOpen = () => setOpen((o) => !o);

  const markOneRead = async (id) => {
    try {
      await axiosInstance.post("/notifications-mark-read", { notificationId: id });
      fetchNotifications();
    } catch (err) {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await axiosInstance.post("/notifications-mark-all-read");
      fetchNotifications();
    } catch (err) {
      // ignore
    }
  };

  const removeOne = async (e, id) => {
    e.stopPropagation();
    try {
      await axiosInstance.post("/notifications-delete", { notificationId: id });
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  return (
    <div className="notif-bell-wrap" ref={wrapRef}>
      <button type="button" className="notif-bell-btn" onClick={toggleOpen} aria-label="Notifications" aria-expanded={open}>
        <FaBell />
        {unreadCount > 0 && <span className="notif-bell-count">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <div><span className="notif-title-dot" /><strong>Notifications</strong></div>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead}>Mark all read</button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notif-empty"><FaBell /><strong>You're all caught up</strong><span>New platform updates will appear here.</span></div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item ${n.isRead ? "" : "unread"}`}
                onClick={() => !n.isRead && markOneRead(n._id)}
              >
                <span className="notif-item-icon"><FaBell /></span>
                <div className="notif-item-copy">
                  <p>{n.message}</p>
                  <small><strong>From:</strong> {n.senderName || "Zentora"}</small>
                  <small className="d-block"><strong>To:</strong> {n.recipientName || "You"}</small>
                  {n.projectTitle && <small className="d-block"><strong>Project:</strong> {n.projectTitle}</small>}
                  <small className="d-block">{new Date(n.createdAt).toLocaleString()}</small>
                </div>
                {!n.isRead && <span className="notif-unread-dot" /> }
                <button type="button" className="btn btn-sm btn-link text-danger p-0 ms-2" aria-label="Delete notification" onClick={(e) => removeOne(e, n._id)}><i className="bi bi-trash" /></button>
              </div>
            ))
          )}
          <div className="text-center py-2"><Link to="/notifications" onClick={() => setOpen(false)}>View all</Link></div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
