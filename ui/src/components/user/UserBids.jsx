import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosInstance";
import StatusBadge from "../common/StatusBadge";

const UserBids = () => {
  const [bids, setBids] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchBids();
    const pollTimer = window.setInterval(() => {
      if (!document.hidden) fetchBids(false);
    }, 15_000);
    const handleFocus = () => {
      if (!document.hidden) fetchBids(false);
    };
    const handleVisibility = () => {
      if (!document.hidden) fetchBids(false);
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(pollTimer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
  const fetchBids = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await axiosInstance.get("/developer-my-bids", { params: { _t: Date.now() } });
      const nextBids = Array.isArray(res?.data?.result) ? res.data.result : [];
      setBids(nextBids);
    } catch (error) {
      console.log(error);
      setBids([]);
    } finally {
      setLoading(false);
    }
  };
  const saveBid = async (event) => {
    event.preventDefault();
    try {
      const res = await axiosInstance.post("/developer-update-bid", {
        bidId: editing._id,
        amount: editing.amount,
        duration: editing.duration,
        proposal: editing.proposal,
      });
      if (res?.data?.success) {
        Swal.fire({ title: "Bid updated", icon: "success" });
        setEditing(null);
        fetchBids();
      } else {
        Swal.fire({
          title: "Unable to update",
          text: res?.data?.message,
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Something went wrong",
        icon: "error",
      });
    }
  };

  return (
    <main className="talent-shell container-fluid px-3 px-md-4 py-4 py-md-5">
      <div className="container">
        <header className="mb-4" data-aos="fade-up">
          <span className="dash-eyebrow">Zentora for Freelancers</span>
          <h2 className="dash-heading animate__animated animate__fadeInDown">
            My Bids
          </h2>
          <p className="text-secondary mb-0">
            Review and update pending proposals.
          </p>
        </header>

        <div className="talent-list-toolbar">
          <div>
            <span className="talent-list-count">{bids.length}</span>
            <span>Total proposals</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="talent-live-dot">Auto-refresh every 15 sec</span>
            <button type="button" className="talent-card-action" disabled={loading} onClick={() => fetchBids(false)}>
              <i className="bi bi-arrow-clockwise me-1"></i>{loading ? "Refreshing" : "Refresh now"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="talent-empty-state"><div className="spinner-border text-warning" role="status"></div><h4 className="mt-3">Loading your bids...</h4></div>
        ) : bids.length > 0 ? (
          <div className="talent-record-grid">
            {bids.map((bid) => (
              <article
                className="talent-record-card"
                key={bid._id}
                data-aos="fade-up"
              >
                <div className="talent-record-top">
                  <div className="talent-record-icon">
                    <i className="bi bi-send-fill"></i>
                  </div>
                  <StatusBadge status={bid.status} />
                </div>
                <div className="talent-record-body">
                  <span className="talent-card-kicker">Bid proposal</span>
                  <h3>{bid?.project?.title || "Project removed"}</h3>
                  <p className="text-secondary">
                    {bid.proposal || "No proposal text"}
                  </p>
                </div>
                <div className="talent-bid-meta">
                  <div>
                    <small>My quote</small>
                    <strong>₹{bid.amount || 0}</strong>
                  </div>
                  <div>
                    <small>Duration</small>
                    <strong>{bid.duration || "—"}</strong>
                  </div>
                </div>
                <div className="talent-token-line">
                  <span>
                    <i className="bi bi-lightning-charge-fill me-2"></i>Tokens
                    used
                  </span>
                  <strong>{bid.tokensUsed || 0}</strong>
                </div>
                {bid.status === "pending" && bid.project?.status === "open" && (
                  <button
                    type="button"
                    className="talent-primary-btn w-100 mt-3"
                    onClick={() => setEditing({ ...bid })}
                  >
                    <i className="bi bi-pencil-square me-2"></i>Edit Bid
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="talent-empty-state">
            <i className="bi bi-inbox-fill"></i>
            <h4>You haven't placed any bids yet</h4>
            <p>Browse open projects and submit your first proposal.</p>
          </div>
        )}
      </div>

      {editing && (
        <div
          className="client-detail-overlay"
          role="presentation"
          onMouseDown={() => setEditing(null)}
        >
          <div
            className="client-neu-card client-project-details"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="client-card-kicker">Edit proposal</span>
                <h2>{editing.project?.title}</h2>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close"
                onClick={() => setEditing(null)}
              ></button>
            </div>
            <form onSubmit={saveBid}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Bid amount (₹)</label>
                  <input
                    className="form-control client-dark-input"
                    required
                    value={editing.amount || ""}
                    onChange={(event) =>
                      setEditing({ ...editing, amount: event.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Delivery duration</label>
                  <input
                    className="form-control client-dark-input"
                    required
                    value={editing.duration || ""}
                    onChange={(event) =>
                      setEditing({ ...editing, duration: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="mt-3 mb-4">
                <label className="form-label">Proposal</label>
                <textarea
                  rows="6"
                  className="form-control client-dark-input"
                  required
                  value={editing.proposal || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, proposal: event.target.value })
                  }
                />
              </div>
              <div className="d-flex gap-2">
                <button className="client-primary-btn" type="submit">
                  Save Changes
                </button>
                <button
                  className="client-danger-btn"
                  type="button"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
export default UserBids;
