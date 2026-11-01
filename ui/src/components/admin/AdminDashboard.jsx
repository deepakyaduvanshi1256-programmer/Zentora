import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaBuilding, FaBriefcase, FaGavel, FaTasks, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ users: 0, clients: 0, posted: 0, bidding: 0, working: 0, completed: 0, assigned: 0 });
  const [projects, setProjects] = useState([]);

  useEffect(() => { fetchCounts(); }, []);

  const fetchCounts = async () => {
    try {
      const [usersRes, clientsRes, projectsRes, bidsRes] = await Promise.all([
        axiosInstance.get("/admin-user-list"),
        axiosInstance.get("/admin-client-list"),
        axiosInstance.get("/admin-project-list"),
        axiosInstance.get("/admin-bid-list"),
      ]);
      const users = (usersRes?.data?.result || []).filter(user => !user.isDeleted);
      const clients = (clientsRes?.data?.result || []).filter(client => !client.isDeleted);
      const allProjects = (projectsRes?.data?.result || []).filter(project => !project.isDeleted);
      const bids = bidsRes?.data?.result || [];
      const biddingProjectIds = new Set(bids.filter(bid => bid.project?.status === "open" || bid.status === "pending").map(bid => bid.projectId));
      setProjects(allProjects);
      setCounts({
        users: users.length,
        clients: clients.length,
        posted: allProjects.length,
        bidding: allProjects.filter(project => project.status === "open" && biddingProjectIds.has(project._id)).length,
        working: allProjects.filter(project => ["assigned", "in_progress"].includes(project.status)).length,
        completed: allProjects.filter(project => project.status === "completed").length,
        assigned: allProjects.filter(project => Boolean(project.assignedTo)).length,
      });
    } catch (error) { console.log(error); }
  };

  const cards = [
    { label: "Total Freelancers", value: counts.users, detail: "Registered users", icon: FaUserTie, path: "/admin-users", accent: "cyan" },
    { label: "Total Clients", value: counts.clients, detail: "Registered clients", icon: FaBuilding, path: "/admin-clients", accent: "violet" },
    { label: "Posted Projects", value: counts.posted, detail: "Projects on the platform", icon: FaBriefcase, path: "/admin-project", accent: "cyan" },
    { label: "Bidding Projects", value: counts.bidding, detail: "Open projects with bids", icon: FaGavel, path: "/admin-project", accent: "violet" },
    { label: "Assigned Projects", value: counts.assigned, detail: "Client selected a freelancer", icon: FaTasks, path: "/admin-project", accent: "mint" },
    { label: "Working Projects", value: counts.working, detail: "Currently in progress", icon: FaTasks, path: "/admin-project", accent: "cyan" },
    { label: "Completed Projects", value: counts.completed, detail: "Successfully finished", icon: FaCheckCircle, path: "/admin-project", accent: "mint" },
  ];

  return (
    <main className="admin-shell container-fluid px-3 px-md-4 py-4 py-md-5">
      <section className="container">
        <div className="row g-4">
          {cards.map(({ label, value, detail, icon: Icon, path, accent }) => (
            <div className="col-12 col-sm-6 col-lg-4" key={label}>
              <button type="button" className={`admin-neu-stat ${accent} w-100 text-start border-0`} onClick={() => navigate(path)}>
                <span className="admin-stat-icon"><Icon /></span>
                <div className="flex-grow-1"><strong>{value}</strong><h2>{label}</h2><p>{detail}</p></div>
                <FaArrowRight className="admin-stat-arrow" />
              </button>
            </div>
          ))}
        </div>

        <div className="admin-neu-panel mt-4">
          <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
            <div><span className="dash-eyebrow">Platform overview</span><h3 className="text-light mt-2 mb-0">Recent Project Activity</h3></div>
            <button type="button" className="admin-view-btn" onClick={() => navigate("/admin-project")}>View all projects</button>
          </div>
          {projects.slice(0, 5).map(project => (
            <button type="button" className="admin-dashboard-project w-100 text-start" key={project._id} onClick={() => navigate("/admin-project")}>
              <div><strong>{project.title}</strong><small>{project.client?.name || "Unknown client"}</small></div>
              <div className="text-end"><strong>₹{project.assignedBid?.amount || project.budget || 0}</strong><small>{project.developer?.name || (project.status === "open" ? "Awaiting assignment" : "Assigned freelancer")}</small></div>
            </button>
          ))}
          {projects.length === 0 && <p className="text-light opacity-75 mb-0">No projects posted yet.</p>}
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
