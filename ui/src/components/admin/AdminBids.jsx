import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import StatusBadge from "../common/StatusBadge";

const AdminBids = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/admin-bid-list");
      setData(res?.data?.result || []);
    } catch (error) {
      console.log(error);
      setData([]);
    }
  };

  return (
    <main className="admin-shell container-fluid px-3 px-md-4 py-4 py-md-5"><div className="container">
      <div className="heading-section">
        <span className="dash-eyebrow">Zentora Admin</span>
        <h2 className="dash-heading">All Bids</h2>
      </div>

      <div className="admin-list-toolbar"><div><span className="admin-list-count">{data.length}</span><span>Total proposals</span></div><span className="admin-live-dot">Live bids</span></div>
      <div className="admin-record-grid">
        {data.length > 0 ? data.map((item) => (
          <article className="admin-record-card admin-bid-card" key={item._id}>
            <div className="admin-record-top"><div className="admin-record-icon">₹</div><StatusBadge status={item?.status} /></div>
            <div className="admin-record-body"><span className="admin-card-kicker">{item?.developer?.name || "Freelancer"}</span><h3>{item?.project?.title || "Project proposal"}</h3></div>
            <div className="admin-record-meta"><div><small>Bid amount</small><strong>₹{item?.amount || 0}</strong></div><div><small>Duration</small><strong>{item?.duration || "—"}</strong></div></div>
            <div className="admin-token-pill"><span>Tokens used</span><strong>{item?.tokensUsed || 0}</strong></div>
          </article>
        )) : <div className="admin-empty-state"><span>₹</span><h4>No bids found</h4><p>New project proposals will appear here.</p></div>}
      </div>
    </div></main>
  );
};

export default AdminBids;
