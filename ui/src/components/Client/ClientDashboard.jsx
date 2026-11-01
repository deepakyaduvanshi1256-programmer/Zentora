import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBriefcase, FaComments, FaHandshake } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    posted: 0,
    bidsReceived: 0,
    completed: 0,
    active: 0,
    completedList: [],
    bidProjects: [],
    assignedProjects: [],
  });
  useEffect(() => {
    fetchCounts();
  }, []);
  const fetchCounts = async () => {
    try {
      const res = await axiosInstance.get("/client-post-list");
      const projects = res?.data?.result || [];
      const completedList = projects.filter((p) => p.status === "completed");
      const active = projects.filter((p) =>
        ["assigned", "in_progress"].includes(p.status),
      ).length;
      const bidResults = await Promise.all(
        projects.map((project) =>
          axiosInstance
            .get("/client-project-bids", { params: { projectId: project._id } })
            .then((response) => ({
              project,
              bids: response?.data?.result || [],
            }))
            .catch(() => ({ project, bids: [] })),
        ),
      );
      const bidProjects = bidResults.filter(({ bids }) => bids.length > 0);
      const bidsReceived = bidResults.reduce((total, { bids }) => total + bids.length, 0);
      const assignedProjects = projects.filter((project) => project.assignedTo);
      setCounts({
        posted: projects.length,
        bidsReceived,
        completed: completedList.length,
        active,
        completedList,
        bidProjects,
        assignedProjects,
      });
    } catch (err) {
      console.log(err);
    }
  };
  const cards = [
    {
      value: counts.posted,
      label: "Posted Projects",
      detail: "All your job listings",
      icon: FaBriefcase,
      accent: "cyan",
    },
    {
      value: counts.bidsReceived,
      label: "Bids Received",
      detail: "Across all projects",
      icon: FaComments,
      accent: "violet",
    },
    {
      value: counts.active,
      label: "Working Projects",
      detail: "Currently in progress",
      icon: FaHandshake,
      accent: "cyan",
    },
    {
      value: counts.completed,
      label: "Completed Projects",
      detail: "Successfully finalized",
      icon: FaHandshake,
      accent: "mint",
    },
  ];
  return (
    <main className="client-shell container-fluid px-3 px-md-4 py-4 py-md-5">
      <section className="container" data-aos="fade-up">
        <div className="client-heading mb-4">
          <span className="client-eyebrow">Zentora command center</span>
          <h1 className="animate__animated animate__fadeInDown">
            Client Dashboard
          </h1>
          <p>Build your next great team and keep every project moving.</p>
        </div>
        <div className="row g-4">
          {cards.map(({ value, label, detail, icon: Icon, accent }, index) => (
            <div
              className="col-12 col-sm-6 col-lg-3"
              key={label}
              data-aos="fade-up"
              data-aos-delay={100 + index * 100}
            >
              <div
                className={`client-neu-card client-stat h-100 ${accent} dashboard-click-card`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (label === "Bids Received") {
                    navigate("/client-review-bids");
                    return;
                  }
                  navigate("/client-manage-project", {
                    state: {
                      projectView:
                        label === "Working Projects"
                          ? "working"
                          : label === "Completed Projects"
                            ? "completed"
                            : "all",
                    },
                  });
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") event.currentTarget.click();
                }}
              >
                <div className="client-stat-icon">
                  <Icon />
                </div>
                <div>
                  <strong>{value}</strong>
                  <h3>{label}</h3>
                  <p>{detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row g-4 mt-1">
          <div className="col-12 col-lg-6">
            <div
              className="client-neu-card h-100 dashboard-click-card"
              data-aos="fade-up"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/client-review-bids")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") navigate("/client-review-bids");
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="client-eyebrow">Live proposals</span>
                  <h3 className="mt-2 mb-0">Who Bid on Your Projects</h3>
                </div>
                <span className="badge rounded-pill text-bg-info">{counts.bidsReceived}</span>
              </div>
              {counts.bidProjects.length > 0 ? (
                counts.bidProjects.map(({ project, bids }) => (
                  <button
                    type="button"
                    className="talent-completed-item text-start w-100 mb-2"
                    key={project._id}
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate("/client-review-bids", { state: { projectId: project._id } });
                    }}
                  >
                    <i className="bi bi-person-lines-fill text-info fs-4"></i>
                    <div className="flex-grow-1">
                      <strong>{project.title}</strong>
                      <small>
                        {bids.map((bid) => bid.developer?.name || "Freelancer").join(", ")}
                      </small>
                    </div>
                    <span>{bids.length} bid{bids.length === 1 ? "" : "s"}</span>
                  </button>
                ))
              ) : (
                <p className="client-muted mb-0">No freelancer bids received yet.</p>
              )}
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div
              className="client-neu-card h-100 dashboard-click-card"
              data-aos="fade-up"
              data-aos-delay="100"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/client-manage-project", { state: { projectView: "working" } })}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") navigate("/client-manage-project", { state: { projectView: "working" } });
              }}
            >
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div>
                  <span className="client-eyebrow">Assigned talent</span>
                  <h3 className="mt-2 mb-0">Who You Assigned</h3>
                </div>
                <span className="badge rounded-pill text-bg-success">{counts.assignedProjects.length}</span>
              </div>
              {counts.assignedProjects.length > 0 ? (
                counts.assignedProjects.map((project) => (
                  <button
                    type="button"
                    className="talent-completed-item text-start w-100 mb-2"
                    key={project._id}
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(project.status === "awaiting_review" ? "/client-review-bids" : "/client-manage-project", { state: { projectView: project.status === "completed" ? "completed" : "working", projectId: project._id } });
                    }}
                  >
                    <i className="bi bi-person-check-fill text-success fs-4"></i>
                    <div className="flex-grow-1">
                      <strong>{project.title}</strong>
                      <small>{project.developer?.name || "Assigned freelancer"}</small>
                    </div>
                    <span>{project.status === "awaiting_review" ? "Delivery submitted — view files" : project.status}</span>
                  </button>
                ))
              ) : (
                <p className="client-muted mb-0">No freelancer has been assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        <div
          className="client-neu-card client-insight mt-4"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <div className="client-insight-icon">
            <i className="bi bi-rocket-takeoff-fill"></i>
          </div>
          <div>
            <h3>Active Hirings</h3>
            <p>
              Open Manage Projects to review full project details and choose the
              right freelancer bid to finalize your next deal.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};
export default ClientDashboard;
