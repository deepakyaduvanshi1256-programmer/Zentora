import React from "react";

// Renders a small colored pill for a project/bid status string
// e.g. "open" -> orange-ish pending look, "completed" -> green, etc.
const StatusBadge = ({ status }) => {
  if (!status) return null;
  const cls = `status-pill status-${status}`;
  const label = status.replace("_", " ");
  return <span className={cls}>{label}</span>;
};

export default StatusBadge;
