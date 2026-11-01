import React, { useEffect, useState } from 'react'
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import axiosInstance from '../../utils/axiosInstance'
import { updateStoredUser } from '../../utils/auth'

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const pwdForm = useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosInstance.get('/profile');
      const user = res?.data?.result;
      setProfile(user);
      reset({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        location: user?.location || "",
        bio: user?.bio || "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (data) => {
    try {
      const { name, phone, location, bio } = data;
      const res = await axiosInstance.post('/update-profile', { name, phone, location, bio });
      if (res?.data?.success) {
        Swal.fire({ title: "Profile", text: res?.data?.message, icon: "success" });
        updateStoredUser(res?.data?.result);
        setProfile(res?.data?.result);
      } else {
        Swal.fire({ title: "Profile", text: res?.data?.message, icon: "error" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.message || "Something went wrong", icon: "error" });
    }
  };

  const handlePasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      Swal.fire({ title: "Password", text: "New passwords do not match", icon: "error" });
      return;
    }
    try {
      const res = await axiosInstance.post('/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      if (res?.data?.success) {
        Swal.fire({ title: "Password", text: res?.data?.message, icon: "success" });
        pwdForm.reset();
      } else {
        Swal.fire({ title: "Password", text: res?.data?.message, icon: "error" });
      }
    } catch (error) {
      Swal.fire({ title: "Error", text: error.response?.data?.message || "Something went wrong", icon: "error" });
    }
  };

  return (
    <main className="admin-shell container-fluid px-3 px-md-4 py-4 py-md-5"><div className="container">
      <div className="row">
        <div className="col-12">
          <span className="dash-eyebrow">Zentora Admin</span>
          <h2 className="dash-heading">My Profile</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="dash-card">
            <div className="profile-details-card mb-4">
              <form onSubmit={handleSubmit(handleSave)}>
                <h5>Account Details</h5>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control" {...register("name")} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" disabled {...register("email")} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-control" {...register("phone")} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" {...register("location")} />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Bio</label>
                    <textarea className="form-control" rows="3" {...register("bio")} />
                  </div>
                </div>
                <button type="submit" className="btn btn-orange">Save Profile Changes</button>
              </form>
            </div>

            <div className="profile-details-card">
              <form onSubmit={pwdForm.handleSubmit(handlePasswordChange)}>
                <h5 className="profile-section-title">Change Password</h5>
                <div className="row g-3 mb-3">
                  <div className="col-12">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" {...pwdForm.register("currentPassword", { required: true })} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" {...pwdForm.register("newPassword", { required: true, minLength: 6 })} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" {...pwdForm.register("confirmPassword", { required: true })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-outline-secondary">Change Password</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div></main>
  )
}

export default AdminProfile
