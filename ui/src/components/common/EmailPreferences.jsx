import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";

const OPTIONS = [
  ["newProjects", "New project announcements"],
  ["bids", "Bid activity (submitted, accepted, rejected)"],
  ["profile", "Profile change confirmations"],
  ["loginAlerts", "New sign-in alerts"],
];

// Per-user email notification switches (stored on the user in MongoDB, enforced by the backend).
const EmailPreferences = () => {
  const [prefs, setPrefs] = useState(null);
  useEffect(() => {
    axiosInstance.get("/profile").then((r) => setPrefs({ newProjects: true, bids: true, profile: true, loginAlerts: true, ...(r?.data?.result?.emailPrefs || {}) })).catch(() => {});
  }, []);
  const toggle = async (key) => {
    const next = !prefs[key];
    setPrefs((p) => ({ ...p, [key]: next }));
    try {
      const res = await axiosInstance.post("/update-profile", { emailPrefs: { [key]: next } });
      if (!res?.data?.success) throw new Error();
      toast.success("Email preference saved");
    } catch { setPrefs((p) => ({ ...p, [key]: !next })); toast.error("Could not save preference"); }
  };
  if (!prefs) return null;
  return (
    <section className="card border-0 rounded-4 shadow-sm mt-4"><div className="card-body p-4">
      <h5 className="fw-bold mb-3"><i className="bi bi-envelope me-2" />Email notifications</h5>
      {OPTIONS.map(([key, label]) => (
        <div className="form-check form-switch mb-2" key={key}>
          <input className="form-check-input" type="checkbox" role="switch" id={`pref-${key}`} checked={prefs[key]} onChange={() => toggle(key)} />
          <label className="form-check-label" htmlFor={`pref-${key}`}>{label}</label>
        </div>
      ))}
      <small className="text-secondary">Important account notices (blocked, restored, deleted) are always sent.</small>
    </div></section>
  );
};

export default EmailPreferences;
