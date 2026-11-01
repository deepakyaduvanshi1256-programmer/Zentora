import React, { useEffect, useState } from "react";

// Thin progress bar shown whenever an API request is in flight (driven by axiosInstance events).
const GlobalLoader = () => {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const onActivity = (e) => setActive((n) => Math.max(0, n + e.detail));
    window.addEventListener("api-activity", onActivity);
    return () => window.removeEventListener("api-activity", onActivity);
  }, []);
  if (!active) return null;
  return <div className="global-loader" role="progressbar" aria-label="Loading"><span /></div>;
};

export default GlobalLoader;
