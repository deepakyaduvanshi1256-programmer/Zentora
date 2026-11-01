import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosInstance";
import StatusBadge from "../common/StatusBadge";
import ProjectChat from "../common/ProjectChat";
const ClientManageProjects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [view, setView] = useState(location.state?.projectView || "all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectBids, setProjectBids] = useState([]);
  const [editing, setEditing] = useState(null);
  const [chatProject, setChatProject] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.projectView) setView(location.state.projectView);
  }, [location.state]);

  const visibleData =
    view === "working"
      ? data.filter((item) => ["assigned", "in_progress"].includes(item.status))
      : view === "completed"
      ? data.filter((item) => item.status === "completed")
      : data;
  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/client-post-list");
      const projects = res?.data?.result || [];
      setData(projects);
      const bidResponses = await Promise.all(projects.map((project) =>
        axiosInstance.get("/client-project-bids", { params: { projectId: project._id } })
          .then((bidRes) => ({ projectId: project._id, bids: bidRes?.data?.result || [] }))
          .catch(() => ({ projectId: project._id, bids: [] }))
      ));
      setProjectBids(bidResponses);
    } catch (error) {
      console.log(error);
      setData([]);
    }
  };
  const updateStatus = async (projectId, status) => {
    try {
      const res = await axiosInstance.post("/client-update-project-status", {
        projectId,
        status,
      });
      if (res?.data?.success) {
        Swal.fire({
          title: "Project",
          text: res?.data?.message,
          icon: "success",
        });
        fetchData();
      } else
        Swal.fire({
          title: "Project",
          text: res?.data?.message,
          icon: "error",
        });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || "Something went wrong",
        icon: "error",
      });
    }
  };
  const sendProjectMessage = (projectId) => {
    const project = data.find((item) => String(item._id) === String(projectId));
    if (project) setChatProject(project);
  };
  const confirmCancel = async (projectId) => {
    const confirm = await Swal.fire({
      title: "Cancel this project?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it",
    });
    if (confirm.isConfirmed) updateStatus(projectId, "cancelled");
  };
  const saveProject = async (event) => {
    event.preventDefault();
    try {
      const res = await axiosInstance.post("/client-update-project", {
        projectId: editing._id,
        title: editing.title,
        des: editing.des,
        budget: editing.budget,
        duration: editing.duration,
      });
      if (res?.data?.success) {
        Swal.fire({ title: "Project updated", icon: "success" });
        setEditing(null);
        fetchData();
      } else {
        Swal.fire({ title: "Unable to update", text: res?.data?.message, icon: "error" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.message || "Something went wrong", icon: "error" });
    }
  };
  const getBids = (projectId) => projectBids.find((entry) => entry.projectId === projectId)?.bids || [];
  const getAcceptedBid = (project) => getBids(project._id).find((bid) => bid.status === "accepted" || bid._id === project.assignedBidId);
  const renderActions = (item) => {
    switch (item.status) {
      case "open":
        return (
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <span className="client-muted">Waiting for bids</span>
            <button
              type="button"
              className="client-small-btn"
              onClick={(event) => { event.stopPropagation(); setEditing({ ...item }); }}
            >
              <i className="bi bi-pencil-square me-1"></i>Edit
            </button>
          </div>
        );
      case "assigned":
        return (
          <div className="d-flex gap-2 flex-wrap">
            <button className="client-small-btn" onClick={() => sendProjectMessage(item._id)}>Message Developer</button>
            <button
              className="client-danger-btn"
              onClick={() => confirmCancel(item._id)}
            >
              Cancel
            </button>
          </div>
        );
      case "awaiting_review":
        return (
          <div className="d-flex gap-2 flex-wrap">
            <button
              type="button"
              className="client-small-btn"
              onClick={() => navigate("/client-review-bids", { state: { projectId: item._id } })}
            >
              View Submitted Project
            </button>
            {item.deliveryFileUrl && <a className="client-outline-btn" href={item.deliveryFileUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}><i className="bi bi-download me-1"></i>Download Delivery</a>}
          </div>
        );
      case "in_progress":
        return (
          <div className="d-flex gap-2 flex-wrap">
            <span className="client-muted">Await freelancer delivery</span>
            <button className="client-small-btn" onClick={() => sendProjectMessage(item._id)}>Message Developer</button>
            <button
              className="client-danger-btn"
              onClick={() => confirmCancel(item._id)}
            >
              Cancel
            </button>
          </div>
        );
      default:
        return <span className="client-muted">—</span>;
    }
  };
  return (
    <main className="client-shell container-fluid px-3 px-md-4 py-4 py-md-5">
      <section className="container" data-aos="fade-up">
        <div className="client-heading mb-4">
          <span className="client-eyebrow">Project control</span>
          <h1 className="animate__animated animate__fadeInDown">
            Manage Projects
          </h1>
          <p>Track progress and control every project from one place.</p>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-4" aria-label="Project filters">
          {["all", "working", "completed"].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`client-small-btn ${view === filter ? "active" : ""}`}
              onClick={() => setView(filter)}
            >
              {filter === "all" ? "All Projects" : filter === "working" ? "Working Projects" : "Completed Projects"}
            </button>
          ))}
        </div>
        {visibleData.length > 0 ? (
          <div className="client-project-card-grid">
            {visibleData.map((item) => (
              <article
                key={item._id}
                data-aos="fade-up"
                role="button"
                tabIndex={0}
                onClick={() => setSelectedProject(item)}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedProject(item); }}
                className={`client-project-card dashboard-click-card ${location.state?.projectId === item._id ? "border border-info" : ""}`}
              >
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div>
                    <span className="client-card-kicker">Project</span>
                    <h3>{item?.title}</h3>
                  </div>
                  <StatusBadge status={item?.status} />
                </div>
                <p className="client-project-description">
                  {item?.des || "No description provided."}
                </p>
                <div className="client-project-meta">
                  <div>
                    <small>Budget</small>
                    <strong className="client-budget">₹{item?.budget}</strong>
                  </div>
                  <div>
                    <small>Timeline</small>
                    <strong>{item?.duration || "—"}</strong>
                  </div>
                </div>
                <div className="client-project-actions" onClick={(event) => event.stopPropagation()}>
                  {renderActions(item)}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="client-neu-card text-center py-5">
            <i className="bi bi-grid-1x2 client-empty-icon"></i>
            <h3 className="mt-3">
              {view === "all" ? "No Projects Posted Yet" : `No ${view === "working" ? "Working" : "Completed"} Projects`}
            </h3>
            <p className="client-muted">
              {view === "all"
                ? "Create your first project to start receiving bids."
                : "Projects matching this view will appear here."}
            </p>
          </div>
        )}
      </section>

      {selectedProject && (() => {
        const acceptedBid = getAcceptedBid(selectedProject);
        return (
          <div className="client-detail-overlay" role="presentation" onMouseDown={() => setSelectedProject(null)}>
            <div className="client-neu-card client-project-details" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div><span className="client-card-kicker">Project details</span><h2>{selectedProject.title}</h2></div>
                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setSelectedProject(null)}></button>
              </div>
              <StatusBadge status={selectedProject.status} />
              <p className="client-project-description mt-3" style={{ minHeight: 0, WebkitLineClamp: "unset", overflow: "visible" }}>{selectedProject.des || "No description provided."}</p>
              <div className="client-detail-grid">
                <div><small>Project budget</small><strong>₹{selectedProject.budget}</strong></div>
                <div><small>Timeline</small><strong>{selectedProject.duration || "—"}</strong></div>
                <div><small>Working with</small><strong>{selectedProject.developer?.name || (selectedProject.assignedTo ? "Assigned freelancer" : "Not assigned yet")}</strong></div>
                <div><small>Accepted bid</small><strong>{acceptedBid?.amount ? `₹${acceptedBid.amount}` : "—"}</strong></div>
              </div>
              {(selectedProject.deliveryLink || selectedProject.deliveryFileUrl) && (
                <div className="client-detail-person mt-3 flex-wrap">
                  <i className="bi bi-folder-check-fill"></i>
                  <div className="flex-grow-1"><small>Project delivery</small><strong>Submitted files & links</strong></div>
                  {selectedProject.deliveryLink && <a className="client-outline-btn" href={selectedProject.deliveryLink} target="_blank" rel="noreferrer">Open Delivery Link</a>}
                  {selectedProject.deliveryFileUrl && <a className="client-outline-btn" href={selectedProject.deliveryFileUrl} target="_blank" rel="noreferrer"><i className="bi bi-download me-1"></i>{selectedProject.deliveryFileName || "Download Delivery File"}</a>}
                </div>
              )}
              {selectedProject.developer && (
                <div className="client-detail-person mt-3">
                  <i className="bi bi-person-check-fill"></i>
                  <div><small>Assigned freelancer</small><strong>{selectedProject.developer.name}</strong><span>{selectedProject.developer.email}</span></div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {editing && (
        <div className="client-detail-overlay" role="presentation" onMouseDown={() => setEditing(null)}>
          <div className="client-neu-card client-project-details" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <div className="d-flex justify-content-between align-items-start mb-3"><div><span className="client-card-kicker">Edit project</span><h2>Update project details</h2></div><button type="button" className="btn-close btn-close-white" onClick={() => setEditing(null)}></button></div>
            <form onSubmit={saveProject}>
              <div className="mb-3"><label className="form-label">Project title</label><input className="form-control client-dark-input" required value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div className="row g-3"><div className="col-md-6"><label className="form-label">Budget (₹)</label><input className="form-control client-dark-input" required value={editing.budget || ""} onChange={(e) => setEditing({ ...editing, budget: e.target.value })} /></div><div className="col-md-6"><label className="form-label">Timeline</label><input className="form-control client-dark-input" required value={editing.duration || ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /></div></div>
              <div className="mt-3 mb-4"><label className="form-label">Description</label><textarea rows="5" className="form-control client-dark-input" required value={editing.des || ""} onChange={(e) => setEditing({ ...editing, des: e.target.value })} /></div>
              <div className="d-flex gap-2"><button className="client-primary-btn" type="submit">Save changes</button><button className="client-danger-btn" type="button" onClick={() => setEditing(null)}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}
      {chatProject && <ProjectChat project={chatProject} onClose={() => setChatProject(null)} />}
    </main>
  );
};
export default ClientManageProjects;
