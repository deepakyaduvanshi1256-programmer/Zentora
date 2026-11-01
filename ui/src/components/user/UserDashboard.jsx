import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaWallet,
  FaGavel,
  FaCoins,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    credit: 0,
    bidsPlaced: 0,
    assignedProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    completedList: [],
    name: "",
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [profileRes, bidsRes, projectsRes] = await Promise.all([
        axiosInstance.get("/profile"),
        axiosInstance.get("/developer-my-bids"),
        axiosInstance.get("/developer-my-projects"),
      ]);
      const profile = profileRes?.data?.result || {};
      const bids = bidsRes?.data?.result || [];
      const projects = projectsRes?.data?.result || [];
      const completedList = projects.filter((p) => p.status === "completed");
      const activeProjects = projects.filter((p) =>
        ["assigned", "in_progress"].includes(p.status),
      ).length;
      setStats({
        credit: profile.credit || 0,
        bidsPlaced: bids.length,
        assignedProjects: projects.length,
        activeProjects,
        completedProjects: completedList.length,
        completedList,
        name: profile.name || "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const cards = [
    {
      value: stats.credit,
      label: "Tokens Left",
      detail: "Wallet balance",
      color: "bg-info-subtle text-info",
      icon: FaCoins,
    },
    {
      value: stats.bidsPlaced,
      label: "Bids Placed",
      detail: "Total across all projects",
      color: "bg-danger-subtle text-danger",
      icon: FaGavel,
    },
    {
      value: stats.activeProjects,
      label: "Working Projects",
      detail: "Currently in progress",
      color: "bg-success-subtle text-success",
      icon: FaSpinner,
    },
    {
      value: stats.completedProjects,
      label: "Completed Projects",
      detail: "Successfully delivered",
      color: "bg-primary-subtle text-primary",
      icon: FaCheckCircle,
    },
  ];

  return (
    <main className="talent-shell container-fluid px-3 px-md-4 py-4 py-md-5">
      <div className="container">
        <section
          className="mb-4 animate__animated animate__fadeInDown"
          data-aos="fade-up"
          data-aos-duration="800"
        >
          <span className="dash-eyebrow">Zentora for Freelancers</span>
          <h2 className="dash-heading mb-2">Talent Dashboard</h2>
          <p className="text-secondary mb-0">
            Welcome back{stats.name ? `, ${stats.name}` : ""}! Your work
            overview is ready.
          </p>
        </section>

        <div className="row g-3">
          {cards.map(({ value, label, detail, color, icon: Icon }) => (
            <div
              className="col-12 col-sm-6 col-lg-3"
              key={label}
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div
                className="card border-0 rounded-4 shadow-sm h-100 dashboard-click-card"
                role={
                  ["Working Projects", "Completed Projects"].includes(label)
                    ? "button"
                    : undefined
                }
                tabIndex={
                  ["Working Projects", "Completed Projects"].includes(label)
                    ? 0
                    : undefined
                }
                onClick={() =>
                  label === "Working Projects"
                    ? navigate("/user-project", {
                        state: { projectView: "working" },
                      })
                    : label === "Completed Projects"
                      ? navigate("/user-project", {
                          state: { projectView: "completed" },
                        })
                      : undefined
                }
                style={{
                  background: "rgba(255,255,255,.82)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,.3)",
                }}
              >
                <div className="card-body d-flex align-items-center gap-3 p-4">
                  <div
                    className={`${color} rounded-circle d-flex align-items-center justify-content-center float-anim flex-shrink-0`}
                    style={{ width: 64, height: 64 }}
                  >
                    <Icon size={26} />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-1">{value}</h3>
                    <div className="fw-semibold">{label}</div>
                    <small className="text-secondary">{detail}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stats.completedList.length > 0 && (
          <div className="talent-neu-section mt-4" data-aos="fade-up">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div>
                <span className="dash-eyebrow">Delivery history</span>
                <h5 className="mb-0 mt-2">Completed Projects</h5>
              </div>
              <span className="talent-list-count">
                {stats.completedList.length}
              </span>
            </div>
            <div className="talent-completed-list">
              {stats.completedList.map((project) => (
                <button
                  type="button"
                  className="talent-completed-item text-start"
                  key={project._id}
                  onClick={() =>
                    navigate("/user-project", {
                      state: {
                        projectView: "completed",
                        projectId: project._id,
                      },
                    })
                  }
                >
                  <FaCheckCircle />
                  <div>
                    <strong>{project.title}</strong>
                    <small>Posted by {project.client?.name || "client"}</small>
                  </div>
                  <span>View</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div
          className="card border-0 rounded-4 shadow-sm mt-4"
          data-aos="fade-up"
          data-aos-delay="100"
          style={{
            background: "rgba(255,255,255,.82)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3">
              <i className="bi bi-lightning-charge-fill fs-3 text-warning float-anim"></i>
              <div>
                <h5 className="fw-bold mb-1">Keep your momentum going</h5>
                <p className="text-secondary mb-0">
                  Use tokens to place bids — <strong>10 tokens = 1 bid</strong>.
                  Buy more from Token Plans when needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserDashboard;
