import React, { useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import './sweetalert-neumorphism.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from './components/Home'
import Register from './components/Register'
import Pricing from './components/Pricing'
import Login from './components/Login'
import Contact from './components/Contact'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AdminDashboard from './components/admin/AdminDashboard'
import AdminProjects from './components/admin/AdminProjects'
import AdminUsers from './components/admin/AdminUsers'
import AdminClients from './components/admin/AdminClients'
import AdminBids from './components/admin/AdminBids'
import AdminProfile from './components/admin/AdminProfile'
import AdminPlans from './components/admin/AdminPlans'
import ClientDashboard from './components/Client/ClientDashboard'
import ClientPostProjects from './components/Client/ClientPostProjects'
import ClientManageProjects from './components/Client/ClientManageProjects'
import ClientReviewBids from './components/Client/ClientReviewBids'
import ClientProfile from './components/Client/ClientProfile'
import UserDashboard from './components/user/UserDashboard'
import UserProjects from './components/user/UserProjects'
import UserBids from './components/user/UserBids'
import UserProfile from './components/user/UserProfile'
import UserPlans from './components/user/UserPlans'
import RequireAuth from './components/common/RequireAuth'
import NativeBridge from './components/common/NativeBridge'
import GlobalLoader from './components/common/GlobalLoader'
import MobileBottomNav from './components/common/MobileBottomNav'
import Notifications from './components/Notifications'
import AdminEmail from './components/admin/AdminEmail'

const RouteEffects = () => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    if (window.AOS) {
      window.AOS.init({ once: true, offset: 80 })
      window.requestAnimationFrame(() => window.AOS.refreshHard())
    }
  }, [location.pathname])

  return null
}

const App = () => {
  return (
    <>
      <BrowserRouter>
        <RouteEffects />
        <NativeBridge />
        <GlobalLoader />
        <Navbar />
        <Routes>
          {/* common url */}
          < Route path='/' element={<Home />} />
          < Route path='/pricing' element={< Pricing />} />
          < Route path='/contact' element={<Contact />} />
          < Route path='/register' element={<Register />} />
          < Route path='/login' element={<Login />} />

          {/* admin url */}
          <Route path='/admin-dashboard' element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
          <Route path='/admin-project' element={<RequireAuth role="admin"><AdminProjects /></RequireAuth>} />
          <Route path='/admin-users' element={<RequireAuth role="admin"><AdminUsers /></RequireAuth>} />
          <Route path='/admin-clients' element={<RequireAuth role="admin"><AdminClients /></RequireAuth>} />
          <Route path='/admin-bids' element={<RequireAuth role="admin"><AdminBids /></RequireAuth>} />
          <Route path='/admin-profile' element={<RequireAuth role="admin"><AdminProfile /></RequireAuth>} />
          <Route path='/admin-plans' element={<RequireAuth role="admin"><AdminPlans /></RequireAuth>} />
          <Route path='/admin-email' element={<RequireAuth role="admin"><AdminEmail /></RequireAuth>} />

          {/* any logged-in role */}
          <Route path='/notifications' element={<RequireAuth role={['admin','client','user']}><Notifications /></RequireAuth>} />

          {/* client url */}
          <Route path='/client-dashboard' element={<RequireAuth role="client"><ClientDashboard /></RequireAuth>} />
          <Route path='/client-post-project' element={<RequireAuth role="client"><ClientPostProjects /></RequireAuth>} />
          <Route path='/client-manage-project' element={<RequireAuth role="client"><ClientManageProjects /></RequireAuth>} />
          <Route path='/client-review-bids' element={<RequireAuth role="client"><ClientReviewBids /></RequireAuth>} />
          <Route path='/client-profile' element={<RequireAuth role="client"><ClientProfile /></RequireAuth>} />

          {/* users url */}
          <Route path='/user-dashboard' element={<RequireAuth role="user"><UserDashboard /></RequireAuth>} />
          <Route path='/user-project' element={<RequireAuth role="user"><UserProjects /></RequireAuth>} />
          <Route path='/user-bids' element={<RequireAuth role="user"><UserBids /></RequireAuth>} />
          <Route path='/user-profile' element={<RequireAuth role="user"><UserProfile /></RequireAuth>} />
          <Route path='/user-plans' element={<RequireAuth role="user"><UserPlans /></RequireAuth>} />


        </Routes>
          <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        newestOnTop
        closeOnClick
        pauseOnHover
      />
        <Footer />
        <MobileBottomNav />
      </BrowserRouter>
    </>
  )
}
export default App