import React, { useEffect, useState } from "react";
import { FaBan, FaEye, FaUnlockAlt, FaUser, FaBuilding, FaMoneyBillWave, FaClock, FaTrashAlt, FaUndo } from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosInstance";
import StatusBadge from "../common/StatusBadge";

const AdminProjects = () => {
  const [data, setData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState("active");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/admin-project-list");
      setData(res?.data?.result || []);
    } catch (error) {
      console.log(error);
      setData([]);
    }
  };

  const changeProjectStatus = async (project, unblock = false) => {
    const confirm = await Swal.fire({
      title: unblock ? "Unblock this project?" : "Block this project?",
      text: unblock ? "The project will return to its previous status." : "This stops any further bidding on it (use for disputes/flags).",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: unblock ? "Yes, unblock it" : "Yes, block it",
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await axiosInstance.post("/admin-block-project", { projectId: project._id, unblock });
      if (res?.data?.success) {
        Swal.fire({ title: "Project", text: res?.data?.message, icon: "success" });
        fetchData();
        setSelectedProject(null);
      } else {
        Swal.fire({ title: "Project", text: res?.data?.message, icon: "error" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.message || "Something went wrong", icon: "error" });
    }
  };

  const deleteProject = async (project, permanent = false, restore = false) => {
    const result = await Swal.fire({
      title: restore ? "Restore this project?" : permanent ? "Permanently delete this project?" : "Move project to trash?",
      text: restore ? "The project will be available again." : permanent ? "This permanently deletes the project and its bids. This cannot be undone." : "You can restore this project later.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: restore ? "Restore" : permanent ? "Delete permanently" : "Move to trash",
      confirmButtonColor: permanent ? "#dc3545" : undefined,
    });
    if (!result.isConfirmed) return;
    try {
      const res = await axiosInstance.post("/admin-delete-project", { projectId: project._id, permanent, restore });
      if (res?.data?.success) { Swal.fire({ title: "Project", text: res.data.message, icon: "success" }); fetchData(); setSelectedProject(null); }
      else Swal.fire({ title: "Project", text: res?.data?.message, icon: "error" });
    } catch (error) { Swal.fire({ title: "Error", text: error.response?.data?.message || "Something went wrong", icon: "error" }); }
  };

  const visibleData = data.filter(project => view === "deleted" ? project.isDeleted : !project.isDeleted);

  return (
    <main className="admin-shell container-fluid px-3 px-md-4 py-4 py-md-5"><div className="container">
      <div className="heading-section">
        <span className="dash-eyebrow">Zentora Admin</span>
        <h2 className="dash-heading">All Projects</h2>
      </div>

      <div className="d-flex gap-2 mb-3">
        <button className={`client-small-btn ${view === "active" ? "active" : ""}`} type="button" onClick={() => setView("active")}>Active Projects</button>
        <button className={`client-small-btn ${view === "deleted" ? "active" : ""}`} type="button" onClick={() => setView("deleted")}>Trash ({data.filter(project => project.isDeleted).length})</button>
      </div>
      <div className="admin-list-toolbar"><div><span className="admin-list-count">{visibleData.length}</span><span>{view === "deleted" ? "Deleted projects" : "Projects on platform"}</span></div><span className="admin-live-dot">Live workspace</span></div>
      <div className="admin-record-grid">
        {visibleData.length > 0 ? visibleData.map((item) => (
          <article className="admin-record-card" key={item._id}>
            <div className="admin-record-top"><div className="admin-record-icon"><FaEye /></div><StatusBadge status={item?.status} /></div>
            <div className="admin-record-body"><h3>{item?.title || "Untitled project"}</h3><p>{item?.description || item?.des || "No project description available."}</p></div>
            <div className="admin-record-meta"><div><small>Budget</small><strong>₹{item?.budget || 0}</strong></div><div><small>Duration</small><strong>{item?.duration || "—"}</strong></div></div>
            <div className="admin-record-actions">
              <button className="admin-view-btn" type="button" onClick={() => setSelectedProject(item)}><FaEye /> View details</button>
              {item.isDeleted ? (
                <><button className="unblock-btn" type="button" onClick={() => deleteProject(item, false, true)}><FaUndo /> Restore</button><button className="block-btn" type="button" onClick={() => deleteProject(item, true, false)}><FaTrashAlt /> Delete permanently</button></>
              ) : (
                <>{item?.status !== "blocked" ? <button className="block-btn" type="button" onClick={() => changeProjectStatus(item)}><FaBan /> Block</button> : <button className="unblock-btn" type="button" onClick={() => changeProjectStatus(item, true)}><FaUnlockAlt /> Unblock</button>}<button className="block-btn" type="button" onClick={() => deleteProject(item)}><FaTrashAlt /> Trash</button></>
              )}
            </div>
          </article>
        )) : <div className="admin-empty-state"><FaEye /><h4>No projects found</h4><p>Projects posted on the platform will appear here.</p></div>}
      </div>
    </div>

      {selectedProject && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(3, 7, 18, .82)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content dash-card border-0" style={{ background: "#111827" }}>
              <div className="modal-header border-secondary">
                <div>
                  <span className="dash-eyebrow">Project Details</span>
                  <h4 className="dash-heading fs-4 mb-0">{selectedProject.title}</h4>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedProject(null)} aria-label="Close" />
              </div>
              <div className="modal-body p-4">
                <p className="text-light opacity-75 mb-4">{selectedProject.description || selectedProject.des || "No description provided."}</p>
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3"><div className="stat-box h-100"><FaMoneyBillWave /><small>Budget</small><strong>₹{selectedProject.budget || 0}</strong></div></div>
                  <div className="col-6 col-md-3"><div className="stat-box h-100"><FaClock /><small>Duration</small><strong>{selectedProject.duration || "—"}</strong></div></div>
                  <div className="col-6 col-md-3"><div className="stat-box h-100"><small>Status</small><strong><StatusBadge status={selectedProject.status} /></strong></div></div>
                  <div className="col-6 col-md-3"><div className="stat-box h-100"><small>Category</small><strong>{selectedProject.category || "—"}</strong></div></div>
                </div>
                <div className="row g-3">
                  <div className="col-md-6"><div className="dash-card h-100"><FaBuilding className="text-info mb-2" /><h6>Client</h6><strong>{selectedProject.client?.name || "Unknown client"}</strong><div className="small text-light opacity-75 mt-1">{selectedProject.client?.email || "No email"}</div><div className="small text-light opacity-75">{selectedProject.client?.phone || "No phone"}</div></div></div>
                  <div className="col-md-6"><div className="dash-card h-100"><FaUser className="text-warning mb-2" /><h6>Assigned Freelancer</h6><strong>{selectedProject.developer?.name || (selectedProject.assignedTo ? "Assigned developer" : "Not assigned")}</strong><div className="small text-light opacity-75 mt-1">{selectedProject.developer?.email || "No email"}</div><div className="small text-light opacity-75">{selectedProject.developer?.phone || "No phone"}</div></div></div>
                </div>
                {selectedProject.assignedBid && (
                  <div className="dash-card mt-3"><h6>Accepted Bid</h6><div className="d-flex justify-content-between flex-wrap gap-2"><span>₹{selectedProject.assignedBid.amount || selectedProject.assignedBid.bidAmount || 0}</span><span>{selectedProject.assignedBid.deliveryTime || selectedProject.assignedBid.duration || "Duration not specified"}</span><StatusBadge status={selectedProject.assignedBid.status} /></div></div>
                )}
              </div>
              <div className="modal-footer border-secondary">
                {selectedProject.status === "blocked" && <button className="block-btn" type="button" onClick={() => changeProjectStatus(selectedProject, true)}><FaUnlockAlt /> Unblock</button>}
                <button className="btn btn-secondary rounded-pill" type="button" onClick={() => setSelectedProject(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminProjects;
