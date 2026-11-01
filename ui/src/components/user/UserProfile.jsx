import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Swal from 'sweetalert2'
import axiosInstance from '../../utils/axiosInstance'
import { updateStoredUser } from '../../utils/auth'
import EmailPreferences from '../common/EmailPreferences'

const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const { register, handleSubmit, reset } = useForm()
  const pwdForm = useForm()
  useEffect(() => { fetchProfile() }, [])
  const fetchProfile = async () => {
    try { const res = await axiosInstance.get('/profile'); const user = res?.data?.result; setProfile(user); reset({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', location: user?.location || '', headline: user?.headline || '', skill: user?.skill || '', rate: user?.rate || '', bio: user?.bio || '' }) }
    catch (error) { console.log(error) }
  }
  const handleSave = async (data) => {
    try { const { name, phone, location, headline, skill, rate, bio } = data; const res = await axiosInstance.post('/update-profile', { name, phone, location, headline, skill, rate, bio }); if (res?.data?.success) { Swal.fire({ title: 'Profile', text: res?.data?.message, icon: 'success' }); updateStoredUser(res?.data?.result); setProfile(res?.data?.result) } else Swal.fire({ title: 'Profile', text: res?.data?.message, icon: 'error' }) }
    catch (error) { Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Something went wrong', icon: 'error' }) }
  }
  const handlePasswordChange = async (data) => {
    if (data.newPassword !== data.confirmPassword) { Swal.fire({ title: 'Password', text: 'New passwords do not match', icon: 'error' }); return }
    try { const res = await axiosInstance.post('/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword }); if (res?.data?.success) { Swal.fire({ title: 'Password', text: res?.data?.message, icon: 'success' }); pwdForm.reset() } else Swal.fire({ title: 'Password', text: res?.data?.message, icon: 'error' }) }
    catch (error) { Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Something went wrong', icon: 'error' }) }
  }
  const glass = { background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.3)' }
  return (
    <main className="talent-shell container-fluid px-3 px-md-4 py-4 py-md-5"><div className="container">
      <header className="mb-4" data-aos="fade-up"><span className="dash-eyebrow">Zentora for Freelancers</span><h2 className="dash-heading animate__animated animate__fadeInDown">My Profile &amp; Settings</h2>{profile && <p className="text-secondary">Wallet balance: <strong>{profile.credit || 0} tokens</strong></p>}</header>
      <form onSubmit={handleSubmit(handleSave)}>
        <div className="row g-4 mb-4">
          <section className="col-12 col-lg-6" data-aos="fade-up" data-aos-delay="100"><div className="card border-0 rounded-4 shadow-sm h-100" style={glass}><div className="card-body p-4"><h5 className="fw-bold mb-3"><i className="bi bi-person-circle me-2 text-warning"></i>Account Details</h5><div className="row g-3"><div className="col-12 col-md-6"><label className="form-label">Full Name</label><input className="form-control rounded-3" {...register('name')} /></div><div className="col-12 col-md-6"><label className="form-label">Email Address</label><input type="email" className="form-control rounded-3" disabled {...register('email')} /></div><div className="col-12 col-md-6"><label className="form-label">Phone</label><input type="tel" className="form-control rounded-3" {...register('phone')} /></div><div className="col-12 col-md-6"><label className="form-label">Location</label><input className="form-control rounded-3" {...register('location')} /></div></div></div></div></section>
          <section className="col-12 col-lg-6" data-aos="fade-up" data-aos-delay="200"><div className="card border-0 rounded-4 shadow-sm h-100" style={glass}><div className="card-body p-4"><h5 className="fw-bold mb-3"><i className="bi bi-briefcase me-2 text-warning"></i>Professional Details</h5><div className="row g-3"><div className="col-12 col-md-6"><label className="form-label">Headline</label><input className="form-control rounded-3" placeholder="e.g. Full Stack MERN Developer" {...register('headline')} /></div><div className="col-12 col-md-6"><label className="form-label">Primary Skill</label><input className="form-control rounded-3" placeholder="e.g. React, Node.js" {...register('skill')} /></div><div className="col-12 col-md-6"><label className="form-label">Rate (₹/hr or fixed)</label><input className="form-control rounded-3" {...register('rate')} /></div><div className="col-12"><label className="form-label">Bio</label><textarea className="form-control rounded-3" rows="4" {...register('bio')} /></div></div><button type="submit" className="btn btn-warning rounded-pill shadow-sm mt-3"><i className="bi bi-check2-circle me-2"></i>Save Profile Changes</button></div></div></section>
        </div>
      </form>
      <section className="card border-0 rounded-4 shadow-sm" style={glass} data-aos="fade-up" data-aos-delay="100"><div className="card-body p-4 border-top border-warning border-3"><h5 className="fw-bold mb-3"><i className="bi bi-shield-lock me-2 text-warning"></i>Change Password</h5><form onSubmit={pwdForm.handleSubmit(handlePasswordChange)}><div className="row g-3"><div className="col-12"><label className="form-label">Current Password</label><input type="password" className="form-control rounded-3" {...pwdForm.register('currentPassword', { required: true })} /></div><div className="col-12 col-md-6"><label className="form-label">New Password</label><input type="password" className="form-control rounded-3" {...pwdForm.register('newPassword', { required: true, minLength: 6 })} /></div><div className="col-12 col-md-6"><label className="form-label">Confirm New Password</label><input type="password" className="form-control rounded-3" {...pwdForm.register('confirmPassword', { required: true })} /></div><div className="col-12"><button type="submit" className="btn btn-outline-warning rounded-pill"><i className="bi bi-key me-2"></i>Change Password</button></div></div></form></div></section>
    <EmailPreferences /></div></main>
  )
}
export default UserProfile
