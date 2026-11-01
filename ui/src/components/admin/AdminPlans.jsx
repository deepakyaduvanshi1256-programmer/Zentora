import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import axiosInstance from "../../utils/axiosInstance";

const schema = yup.object({
  name: yup.string().required("Plan name is required"),
  tokens: yup.number().typeError("Tokens must be a number").positive().integer().required("Tokens are required"),
  price: yup.string().required("Price is required"),
  description: yup.string().nullable(),
  status: yup.string().oneOf(["active", "inactive"]),
});

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axiosInstance.get("/admin-plan-list");
      setPlans(res?.data?.result || []);
    } catch (error) {
      console.log(error);
      setPlans([]);
    }
  };

  const handleSave = async (data) => {
    try {
      const payload = editingPlan ? { ...data, planId: editingPlan._id } : data;
      const endpoint = editingPlan ? "/admin-update-plan" : "/admin-create-plan";
      const res = await axiosInstance.post(endpoint, payload);
      if (res?.data?.success) {
        Swal.fire({ title: "Plan", text: res?.data?.message, icon: "success" });
        reset();
        setEditingPlan(null);
        fetchPlans();
      } else {
        Swal.fire({ title: "Plan", text: res?.data?.message, icon: "error" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.message || "Something went wrong", icon: "error" });
    }
  };

  const startEdit = (plan) => {
    setEditingPlan(plan);
    reset({ name: plan.name, tokens: plan.tokens, price: plan.price, description: plan.description || "", status: plan.status || "active" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    reset();
  };

  return (
    <main className="admin-shell container-fluid px-3 px-md-4 py-4 py-md-5"><div className="container">
      <div className="row">
        <div className="col-12">
          <span className="dash-eyebrow">Zentora Admin</span>
          <h2 className="dash-heading">Token Plans</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="dash-card mb-4">
            <h4>{editingPlan ? "Edit Credit Plan" : "Create New Plan"}</h4>
            <form onSubmit={handleSubmit(handleSave)}>
              <div className="row g-3">
                <div className="col-12 col-sm-3">
                  <label className="form-label">Plan Name</label>
                  <input type="text" className="form-control" placeholder="e.g. Starter" {...register("name")} />
                  <div className="text-danger small">{errors.name?.message}</div>
                </div>
                <div className="col-12 col-sm-3">
                  <label className="form-label">Tokens</label>
                  <input type="number" className="form-control" placeholder="e.g. 50" {...register("tokens")} />
                  <div className="text-danger small">{errors.tokens?.message}</div>
                </div>
                <div className="col-12 col-sm-3">
                  <label className="form-label">Price (₹)</label>
                  <input type="text" className="form-control" placeholder="e.g. 499" {...register("price")} />
                  <div className="text-danger small">{errors.price?.message}</div>
                </div>
                <div className="col-12 col-sm-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" {...register("status")} defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option></select>
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <input type="text" className="form-control" placeholder="Short description" {...register("description")} />
                </div>
                <div className="col-12 d-flex flex-wrap gap-2 justify-content-end">
                  {editingPlan && <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancel</button>}
                  <button type="submit" className="btn btn-orange">{editingPlan ? "Update Plan" : "Create Plan"}</button>
                </div>
              </div>
            </form>
          </div>

          <div className="admin-list-toolbar"><div><span className="admin-list-count">{plans.length}</span><span>Credit packages</span></div><span className="admin-live-dot">Marketplace plans</span></div>
          <div className="admin-plan-grid">
            {plans.length > 0 ? plans.map((p) => (
              <article className="admin-plan-card" key={p._id}>
                <div className="admin-plan-top"><span className={p.status === "active" ? "active" : "inactive"}>{p.status === "active" ? "Active" : "Inactive"}</span><span className="plan-credit-icon">C</span></div>
                <h3>{p.name}</h3>
                <p>{p.description || "Flexible credits for projects and bids."}</p>
                <div className="admin-plan-token"><strong>{p.tokens}</strong><span>credits</span></div>
                <div className="admin-plan-price">₹{p.price}<small> / package</small></div>
                <button type="button" className="admin-view-btn mt-3 w-100" onClick={() => startEdit(p)}>Edit Plan</button>
              </article>
            )) : <div className="admin-empty-state"><span>C</span><h4>No plans yet</h4><p>Create a credit package above.</p></div>}
          </div>
        </div>
      </div>
    </div></main>
  );
};

export default AdminPlans;
