import React, { useCallback, useEffect, useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../utils/axiosInstance";

const Notifications = () => {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      setItems(res?.data?.result?.notifications || []);
      setUnread(res?.data?.result?.unreadCount || 0);
    } catch { /* interceptor handles 401 */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (url, body = {}) => { try { await axiosInstance.post(url, body); await load(); } catch (e) { Swal.fire({ title: "Error", text: e.response?.data?.message || "Action failed", icon: "error" }); } };
  const remove = async (n) => {
    const ok = await Swal.fire({ title: "Delete notification?", icon: "question", showCancelButton: true, confirmButtonText: "Delete" });
    if (ok.isConfirmed) act("/notifications-delete", { notificationId: n._id });
  };
  const clearRead = async () => {
    const ok = await Swal.fire({ title: "Clear all read notifications?", icon: "warning", showCancelButton: true, confirmButtonText: "Clear" });
    if (ok.isConfirmed) act("/notifications-delete-read");
  };

  return (
    <main className="container py-4 notif-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h4 mb-0"><i className="bi bi-bell me-2" />Notifications {unread > 0 && <span className="badge bg-danger">{unread}</span>}</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-primary" disabled={!unread} onClick={() => act("/notifications-mark-all-read")}>Mark all read</button>
          <button className="btn btn-sm btn-outline-danger" disabled={!items.some((n) => n.isRead)} onClick={clearRead}>Clear read</button>
        </div>
      </div>
      {loading ? <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
        : items.length === 0 ? <div className="text-center text-secondary py-5"><i className="bi bi-bell-slash display-5 d-block mb-2" />You're all caught up</div>
        : items.map((n) => (
          <div key={n._id} className={`card mb-2 border-0 shadow-sm ${n.isRead ? "" : "border-start border-primary border-4"}`}>
            <div className="card-body d-flex gap-3 align-items-start">
              <div className="flex-grow-1" onClick={() => !n.isRead && act("/notifications-mark-read", { notificationId: n._id })} style={{ cursor: n.isRead ? "default" : "pointer" }}>
                <p className={`mb-1 ${n.isRead ? "" : "fw-semibold"}`}>{n.message}</p>
                <small className="text-secondary d-block">{n.senderName || "Zentora"}{n.projectTitle ? ` · ${n.projectTitle}` : ""} · {new Date(n.createdAt).toLocaleString()}</small>
              </div>
              <button className="btn btn-sm btn-link text-danger p-0" aria-label="Delete notification" onClick={() => remove(n)}><i className="bi bi-trash" /></button>
            </div>
          </div>
        ))}
    </main>
  );
};

export default Notifications;
