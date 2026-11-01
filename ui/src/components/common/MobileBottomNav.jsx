import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getUser, isLoggedIn } from "../../utils/auth";
import axiosInstance from "../../utils/axiosInstance";

const TABS = {
  user: [
    ["/user-dashboard", "bi-house", "Home"], ["/user-project", "bi-briefcase", "Projects"],
    ["/user-bids", "bi-hammer", "Bids"], ["/notifications", "bi-bell", "Alerts"], ["/user-profile", "bi-person", "Profile"],
  ],
  client: [
    ["/client-dashboard", "bi-house", "Home"], ["/client-manage-project", "bi-folder", "Projects"],
    ["/client-review-bids", "bi-hammer", "Bids"], ["/notifications", "bi-bell", "Alerts"], ["/client-profile", "bi-person", "Profile"],
  ],
  admin: [
  ["/admin-dashboard", "bi-speedometer2", "Home"], ["/admin-project", "bi-briefcase", "Projects"],
  ["/admin-users", "bi-people", "Users"], ["/notifications", "bi-bell", "Alerts"],
],
};

// Fixed bottom tab bar for logged-in users on phones / the Android app (hidden on desktop widths).
const MobileBottomNav = () => {
  const location = useLocation();
  const [user, setUser] = useState(getUser());
  const [unread, setUnread] = useState(0);

  useEffect(() => { setUser(getUser()); }, [location.pathname]);

  useEffect(() => {
    const show = isLoggedIn() && TABS[user?.type];
    document.body.classList.toggle("has-bottom-nav", Boolean(show));
    return () => document.body.classList.remove("has-bottom-nav");
  }, [user, location.pathname]);

  useEffect(() => {
    if (!isLoggedIn()) return undefined;
    let stop = false;
    const load = async () => {
      try { const res = await axiosInstance.get("/notifications"); if (!stop) setUnread(res?.data?.result?.unreadCount || 0); } catch { /* ignore */ }
    };
    load();
    const t = setInterval(load, 30000);
    return () => { stop = true; clearInterval(t); };
  }, [user, location.pathname]);

  const tabs = isLoggedIn() ? TABS[user?.type] : null;
  if (!tabs) return null;
  return (
    <nav className="mobile-bottom-nav" aria-label="Main">
      {tabs.map(([to, icon, label]) => (
        <NavLink key={to} to={to} className={({ isActive }) => `mbn-item ${isActive ? "active" : ""}`}>
          <span className="mbn-icon"><i className={`bi ${icon}`} />{to === "/notifications" && unread > 0 && <b className="mbn-badge">{unread > 99 ? "99+" : unread}</b>}</span>
          <small>{label}</small>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
