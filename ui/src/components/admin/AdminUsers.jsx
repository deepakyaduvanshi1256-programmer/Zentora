import React, { useEffect, useState } from "react";
import { FaBan, FaCheck, FaCoins, FaUser, FaTrashAlt, FaUndo } from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosInstance";

const AdminUsers = () => {

  const [data, setData] = useState([]);
  const [view, setView] = useState("active");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/admin-user-list");
      setData(res?.data?.result || []);
    } catch (error) {
      console.log(error);
      setData([]);
    }
  };

  const toggleBlock = async (item) => {
    try {
      const res = await axiosInstance.post("/admin-toggle-block-user", {
        userId: item._id,
        isBlocked: !item.isBlocked,
      });
      if (res?.data?.success) {
        Swal.fire({ title: "User", text: res?.data?.message, icon: "success" });
        fetchData();
      } else {
        Swal.fire({ title: "User", text: res?.data?.message, icon: "error" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.message || "Something went wrong", icon: "error" });
    }
  };

  const deleteUser = async (user, permanent = false, restore = false) => {
    const result = await Swal.fire({
      title: restore ? "Restore this freelancer?" : permanent ? "Permanently delete this freelancer?" : "Move freelancer to trash?",
      text: restore ? "The freelancer account will become active again." : permanent ? "This permanently deletes the account and cannot be undone." : "You can restore this freelancer later.",
      icon: "warning", showCancelButton: true,
      confirmButtonText: restore ? "Restore" : permanent ? "Delete permanently" : "Move to trash",
      confirmButtonColor: permanent ? "#dc3545" : undefined,
    });
    if (!result.isConfirmed) return;
    try {
      const res = await axiosInstance.post("/admin-delete-user", { userId: user._id, permanent, restore });
      if (res?.data?.success) { Swal.fire({ title: "Freelancer", text: res.data.message, icon: "success" }); fetchData(); }
      else Swal.fire({ title: "Freelancer", text: res?.data?.message, icon: "error" });
    } catch (error) { Swal.fire({ title: "Error", text: error.response?.data?.message || "Something went wrong", icon: "error" }); }
  };
  const visibleData = data.filter(user => view === "deleted" ? user.isDeleted : !user.isDeleted);

  return (
    <main className="admin-shell container-fluid px-3 px-md-4 py-4 py-md-5"><div className="container">

      <div className="heading-section">
        <span className="dash-eyebrow">
          Zentora Admin
        </span>

        <h2 className="dash-heading">
          Manage Freelancers / Users
        </h2>
      </div>


      <div className="d-flex gap-2 mb-3"><button className={`client-small-btn ${view === "active" ? "active" : ""}`} type="button" onClick={() => setView("active")}>Active Freelancers</button><button className={`client-small-btn ${view === "deleted" ? "active" : ""}`} type="button" onClick={() => setView("deleted")}>Trash ({data.filter(user => user.isDeleted).length})</button></div>
      <div className="admin-list-toolbar"><div><span className="admin-list-count">{visibleData.length}</span><span>{view === "deleted" ? "Deleted freelancers" : "Registered freelancers"}</span></div><span className="admin-live-dot">Credit balances live</span></div>
      <div className="admin-record-grid admin-user-grid">
        {visibleData.length > 0 ? visibleData.map((item) => (
          <article className="admin-record-card admin-user-card" key={item._id}>
            <div className="admin-record-top"><div className="admin-record-icon"><FaUser /></div>{!item?.isBlocked ? <span className="active">Active</span> : <span className="inactive">Blocked</span>}</div>
            <div className="admin-record-body"><span className="admin-card-kicker">Freelancer</span><h3>{item?.name || "Unnamed user"}</h3><p>{item?.email}</p></div>
            <div className="admin-credit-box"><FaCoins /><div><small>Available credits</small><strong>{item?.credit || 0}</strong></div></div>
            {item.isDeleted ? <div className="d-flex gap-2"><button className="unblock-btn flex-grow-1 justify-content-center" onClick={() => deleteUser(item, false, true)}><FaUndo /> Restore</button><button className="block-btn flex-grow-1 justify-content-center" onClick={() => deleteUser(item, true, false)}><FaTrashAlt /> Delete permanently</button></div> : <>{!item?.isBlocked ? <button className="block-btn w-100 justify-content-center" onClick={() => toggleBlock(item)}><FaBan /> Block account</button> : <button className="unblock-btn w-100 justify-content-center" onClick={() => toggleBlock(item)}><FaCheck /> Unblock account</button>}<button className="block-btn w-100 justify-content-center mt-2" onClick={() => deleteUser(item)}><FaTrashAlt /> Move to trash</button></>}
          </article>
        )) : <div className="admin-empty-state"><FaUser /><h4>No users found</h4></div>}
      </div>


    </div></main>
  )
}


export default AdminUsers;
