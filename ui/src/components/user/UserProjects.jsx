import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosInstance";
import StatusBadge from "../common/StatusBadge";
import ProjectChat from "../common/ProjectChat";

const UserProjects = () => {
  const location = useLocation();
  const [tab, setTab] = useState("open");
  const [workView, setWorkView] = useState(
    location.state?.projectView || "working",
  );
  const [openProjects, setOpenProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [bidProject, setBidProject] = useState(null);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [chatProject, setChatProject] = useState(null);
  const bidFormRef = useRef(null);
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchOpen();
    fetchMine();
  }, []);
  const fetchOpen = async () => {
    try {
      const res = await axiosInstance.get("/developer-open-projects");
      const liveProjects = (res?.data?.result || []).filter(
        (project) => project.status === "open",
      );
      setOpenProjects(liveProjects);
    } catch (error) {
      console.log(error);
    }
  };
  const fetchMine = async () => {
    try {
      const res = await axiosInstance.get("/developer-my-projects");
      setMyProjects(res?.data?.result || []);
    } catch (error) {
      console.log(error);
    }
  };
  const sendProjectMessage = (project) => setChatProject(project);
  const submitForReview = async (project) => {
    const result = await Swal.fire({
      title: "Submit project for client review?",
      input: "textarea",
      inputLabel: "Completion message",
      inputPlaceholder: "Describe what you completed and any delivery notes...",
      showCancelButton: true,
      confirmButtonText: "Continue",
      inputValidator: (value) =>
        !value?.trim() && "A completion message is required",
    });
    if (!result.isConfirmed) return;
    const delivery = await Swal.fire({
      title: "Attach delivery",
      html: `<input id="deliveryLink" class="swal2-input" type="url" placeholder="File or project link (optional)"><input id="deliveryFile" class="swal2-file" type="file" accept=".zip,.rar,.7z,.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.mp4,.webm">`,
      showCancelButton: true,
      confirmButtonText: "Send delivery",
      preConfirm: () => ({
        link: document.getElementById("deliveryLink")?.value || "",
        file: document.getElementById("deliveryFile")?.files?.[0] || null,
      }),
    });
    if (!delivery.isConfirmed) return;
    try {
      const formData = new FormData();
      formData.append("projectId", project._id);
      formData.append("message", result.value);
      formData.append("deliveryLink", delivery.value.link || "");
      if (delivery.value.file)
        formData.append("deliveryFile", delivery.value.file);
      const res = await axiosInstance.post(
        "/developer-submit-project",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      if (res?.data?.success) {
        Swal.fire({
          title: "Submitted",
          text: res.data.message,
          icon: "success",
        });
        fetchMine();
      } else
        Swal.fire({
          title: "Unable to submit",
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
  const openBidForm = (project) => {
    setBidProject(project);
    reset({ amount: "", duration: "", proposal: "" });
  };
  useEffect(() => {
    if (!bidProject) return;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setBidProject(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    requestAnimationFrame(() => setFocus("amount"));
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [bidProject, setFocus]);
  const submitBid = async (data) => {
    if (submittingBid) return;
    setSubmittingBid(true);
    try {
      const res = await axiosInstance.post("/developer-place-bid", {
        projectId: bidProject._id,
        amount: data.amount,
        duration: data.duration,
        proposal: data.proposal,
      });
      if (res?.data?.success) {
        Swal.fire({ title: "Bid", text: res?.data?.message, icon: "success" });
        setBidProject(null);
        fetchOpen();
      } else
        Swal.fire({ title: "Bid", text: res?.data?.message, icon: "error" });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text:
          error.code === "ECONNABORTED"
            ? "Request took too long. Please check your internet connection and try again."
            : error.response?.data?.message || "Something went wrong",
        icon: "error",
      });
    } finally {
      setSubmittingBid(false);
    }
  };

  const glass = {
    background: "rgba(255,255,255,.82)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,.3)",
  };
  const description = (text) => (
    <>
      <div className="project-description-clamp">{text}</div>
      {text && text.length > 120 && (
        <button
          type="button"
          className="btn btn-link btn-sm p-0 text-decoration-none text-orange"
          title={text}
        >
          Read more
        </button>
      )}
    </>
  );
  const mineCards =
    workView === "completed"
      ? myProjects.filter((project) => project.status === "completed")
      : myProjects.filter((project) =>
          ["assigned", "in_progress"].includes(project.status),
        );
  const cards = tab === "open" ? openProjects : mineCards;

  useEffect(() => {
    if (location.state?.projectView) {
      setTab("mine");
      setWorkView(location.state.projectView);
    }
  }, [location.state]);

  return (
    <main className="talent-shell container-fluid px-3 px-md-4 py-4 py-md-5">
      <div className="container">
        <header className="mb-4" data-aos="fade-up">
          <span className="dash-eyebrow">Zentora for Freelancers</span>
          <h2 className="dash-heading animate__animated animate__fadeInDown">
            Developer Dashboard
          </h2>
          <p className="text-secondary mb-0">
            Find projects and place your bids.
          </p>
        </header>
        <div className="d-flex gap-2 mb-4" role="group">
          <button
            className={`btn rounded-pill ${tab === "open" ? "btn-warning shadow-sm" : "btn-outline-secondary"}`}
            onClick={() => setTab("open")}
          >
            Open Projects
          </button>
          <button
            className={`btn rounded-pill ${tab === "mine" ? "btn-warning shadow-sm" : "btn-outline-secondary"}`}
            onClick={() => setTab("mine")}
          >
            My Assigned Work
          </button>
          {tab === "mine" && (
            <div
              className="d-flex gap-2 ms-lg-2 mt-2 mt-md-0 flex-wrap"
              role="group"
            >
              <button
                type="button"
                className={`btn btn-sm rounded-pill ${workView === "working" ? "btn-warning" : "btn-outline-secondary"}`}
                onClick={() => setWorkView("working")}
              >
                Working
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill ${workView === "completed" ? "btn-warning" : "btn-outline-secondary"}`}
                onClick={() => setWorkView("completed")}
              >
                Completed
              </button>
            </div>
          )}
        </div>

        <div className="talent-list-toolbar">
          <div>
            <span className="talent-list-count">{cards.length}</span>
            <span>
              {tab === "open" ? "Open projects" : "Assigned projects"}
            </span>
          </div>
          <span className="talent-live-dot">Live workspace</span>
        </div>

        {cards.length > 0 ? (
          <div className="talent-project-grid">
            {cards.map((project) => (
              <article
                className="talent-project-card"
                key={project._id}
                data-aos="fade-up"
              >
                <div className="talent-record-top">
                  <div className="talent-record-icon">
                    <i className="bi bi-kanban-fill"></i>
                  </div>
                  {tab === "open" ? (
                    <span className="talent-open-label">Open project</span>
                  ) : (
                    <StatusBadge status={project.status} />
                  )}
                </div>
                <div className="talent-record-body">
                  <span className="talent-card-kicker">
                    {tab === "open" ? "Available work" : "My assignment"}
                  </span>
                  <h3>{project.title}</h3>
                  <p>
                    {tab === "open"
                      ? `Posted by ${project.client?.name || "client"}${project.des ? ` • ${project.des}` : ""}`
                      : project.client
                        ? `Posted by ${project.client.name || "client"}`
                        : "Work assigned to you on the Zentora marketplace."}
                  </p>
                </div>
                <div className="talent-bid-meta">
                  <div>
                    <small>Budget</small>
                    <strong>₹{project.budget || 0}</strong>
                  </div>
                  <div>
                    <small>Duration</small>
                    <strong>{project.duration || "—"}</strong>
                  </div>
                </div>
                {tab !== "open" &&
                  (project.deliveryLink || project.deliveryFileUrl) && (
                    <div className="talent-project-status mt-3">
                      <span>Your delivery</span>
                      {project.deliveryLink && (
                        <a
                          className="talent-card-action d-block mb-2 text-center"
                          href={project.deliveryLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open Delivery Link
                        </a>
                      )}
                      {project.deliveryFileUrl && (
                        <a
                          className="talent-card-action d-block text-center"
                          href={project.deliveryFileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <i className="bi bi-download me-1"></i>
                          {project.deliveryFileName ||
                            "Download Submitted File"}
                        </a>
                      )}
                    </div>
                  )}
                {tab === "open" ? (
                  <button
                    type="button"
                    className="talent-card-action w-100"
                    onClick={() => openBidForm(project)}
                  >
                    <i className="bi bi-send-fill me-2"></i>Place Bid
                  </button>
                ) : project.status === "awaiting_review" ? (
                  <div className="talent-project-status">
                    <span>Current status</span>
                    <strong>Waiting for client approval</strong>
                  </div>
                ) : project.status === "assigned" ? (
                  <>
                    <div className="talent-project-status">
                      <span>Current status</span>
                      <strong>Assigned — coordinate work through chat</strong>
                    </div>
                    <button
                      type="button"
                      className="talent-card-action w-100 mt-3"
                      onClick={() => sendProjectMessage(project)}
                    >
                      <i className="bi bi-chat-dots-fill me-2"></i>Message
                      Client
                    </button>
                  </>
                ) : project.status === "in_progress" ? (
                  <>
                    <div className="talent-project-status">
                      <span>Current status</span>
                      <strong>{project.status}</strong>
                    </div>
                    <button
                      type="button"
                      className="talent-card-action w-100 mt-3"
                      onClick={() => submitForReview(project)}
                    >
                      <i className="bi bi-send-check-fill me-2"></i>Submit Work
                      for Review
                    </button>
                    <button
                      type="button"
                      className="talent-card-action w-100 mt-2"
                      onClick={() => sendProjectMessage(project)}
                    >
                      <i className="bi bi-chat-dots-fill me-2"></i>Message
                      Client
                    </button>
                  </>
                ) : (
                  <div className="talent-project-status">
                    <span>Current status</span>
                    <strong>{project.status || "assigned"}</strong>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="talent-empty-state">
            <i className="bi bi-folder2-open"></i>
            <h4>
              {tab === "open"
                ? "No open projects available"
                : "No assigned projects found"}
            </h4>
            <p>
              {tab === "open"
                ? "Check again when new work is posted."
                : "Accepted projects will appear here."}
            </p>
          </div>
        )}

        {bidProject && (
          <div
            ref={bidFormRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="place-bid-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setBidProject(null);
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1055,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              background: "rgba(15, 23, 42, 0.58)",
              backdropFilter: "blur(5px)",
            }}
          >
            <div className="col-12 col-lg-6" style={{ maxWidth: "680px" }}>
              <div
                className="card border-0 rounded-4 shadow-sm"
                style={{ ...glass, maxHeight: "calc(100vh - 2rem)", overflowY: "auto" }}
              >
                <div className="card-body p-4">
                  <button
                    type="button"
                    className="btn-close float-end"
                    aria-label="Close"
                    onClick={() => setBidProject(null)}
                  ></button>
                  <h5 id="place-bid-title" className="fw-bold pe-4">Place a Bid — {bidProject.title}</h5>
                  <p className="text-secondary small">
                    Placing a bid costs 10 tokens. It is not refunded if the
                    client doesn't select you.
                  </p>
                  <form onSubmit={handleSubmit(submitBid)}>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="form-label">
                          Your Quoted Price (₹)
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          placeholder="Enter your price"
                          {...register("amount", { required: true })}
                        />
                        {errors.amount && (
                          <div className="text-danger small">Required</div>
                        )}
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="form-label">Delivery Duration</label>
                        <input
                          type="text"
                          className="form-control rounded-3"
                          placeholder="e.g. 2 weeks"
                          {...register("duration", { required: true })}
                        />
                        {errors.duration && (
                          <div className="text-danger small">Required</div>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="form-label">Proposal</label>
                        <textarea
                          className="form-control rounded-3"
                          rows="4"
                          placeholder="Write your proposal..."
                          {...register("proposal", { required: true })}
                        />
                        {errors.proposal && (
                          <div className="text-danger small">Required</div>
                        )}
                      </div>
                      <div className="col-12 d-flex gap-2 flex-wrap">
                        <button
                          type="submit"
                          className="btn btn-warning rounded-pill"
                          disabled={submittingBid}
                        >
                          {submittingBid ? "Submitting..." : "Submit Bid"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-pill"
                          onClick={() => {
                            setBidProject(null);
                            reset({ amount: "", duration: "", proposal: "" });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
        {chatProject && <ProjectChat project={chatProject} onClose={() => setChatProject(null)} />}
      </div>
    </main>
  );
};
export default UserProjects;
