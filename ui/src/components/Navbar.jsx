import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getUser, clearAuth } from '../utils/auth'
import NotificationBell from './common/NotificationBell'

const Navbar = () => {
  const [data , setData] = useState(null)
  const location = useLocation()
 
  useEffect(()=>{
  setData(getUser())
  }, [location.pathname])


  if(data?.type == 'admin'){
    return <AdminMenu />
  } 
  else if(data?.type == 'client'){
    return <ClientMenu />
  }
  else if(data?.type == 'user'){
    return <UserMenu />
  } 
  else{
    return <CommonMenu/>
  }
}

const CommonMenu = () =>{
  return(<>
   <div className="row">
        <div className="col-sm-2"></div>
        <div className="col-sm-8 menu">
          <nav className="navbar navbar-expand-lg ">
            <div className="container-fluid">
              <a className="navbar-brand" href="#">
                Freelancing <b className='text-color1'>24x7</b>
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <Link className="nav-link"  aria-current="page" to="/">
                      Home
                    </Link>
                  </li>
                  {/* <li className="nav-item">
                    <Link className="nav-link"  to="/about">
                      About-us
                    </Link>
                  </li> */}
                  {/* <li className="nav-item">
                    <Link className="nav-link"  to="/services">
                      Services
                    </Link>
                  </li> */}

                  <li className="nav-item">
                    <Link className="nav-link"  to="/pricing">
                      Pricing
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/contact">
                      Contact-us
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/login">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/register">
                      Register
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

        </div>
        <div className="col-sm-2"></div>
      </div>
  </>)
}

const AdminMenu = () =>{
  const navigate = useNavigate()
  const logout = ()=>{
  clearAuth()
  navigate('/')
}
  return(<>
   <div className="row zentora-dashboard-navbar ">
        <div className="col-sm-2"></div>
        <div className="col-sm-8 menu">
          <nav className="navbar navbar-expand-lg ">
            <div className="container-fluid">
              <a className="navbar-brand" href="#">
                Freelancing <b className='text-color1'>24x7</b>
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">

                    <Link className="nav-link"  aria-current="page" to="/admin-dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/admin-project">
                     Project
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/admin-users">
                      Users
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link"  to="/admin-plans">
                      Plans
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/admin-clients">
                     Clients
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/admin-bids">
                   Bids
                    </Link>
                  </li>
                  {/* <li className="nav-item">
                    <Link className="nav-link"  to="/admin-email">
                     Email
                    </Link>
                  </li> */}
                  <li className="nav-item">
                    <Link className="nav-link"  to="/admin-profile">
                     Profile
                    </Link>
                  </li>
                  <li className="nav-item d-flex align-items-center">
                    <NotificationBell />
                  </li>
                   <li className="nav-item">
                    <button className="nav-link" onClick={logout}>
                      Logout
                    </button>
                  </li>
               
                </ul>
              </div>
            </div>
          </nav>

        </div>
        <div className="col-sm-2"></div>
      </div>
  </>)
}

const ClientMenu = () =>{
   const navigate = useNavigate()
  const logout = ()=>{
  clearAuth()
  navigate('/')
}
  return(<>
   <div className="row zentora-dashboard-navbar ">
        <div className="col-sm-2"></div>
        <div className="col-sm-8 menu">
          <nav className="navbar navbar-expand-lg ">
            <div className="container-fluid">
              <a className="navbar-brand" href="#">
                Freelancing <b className='text-color1'>24x7</b>
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">

                    <Link className="nav-link"  aria-current="page" to="/client-dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/client-post-project">
                      Post-Project
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/client-manage-project">
                      Manage-Project
                    </Link>
                  </li>

                  <li className="nav-item">
                    <Link className="nav-link"  to="/client-review-bids">
                      Bids
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link"  to="/client-profile">
                      Profile
                    </Link>
                  </li>
                  <li className="nav-item d-flex align-items-center">
                    <NotificationBell />
                  </li>
                  <li className="nav-item">
                    <button className="nav-link" onClick={logout}>
                      Logout
                    </button>
                  </li>
                  
                 
                </ul>
              </div>
            </div>
            
          </nav>

        </div>
        <div className="col-sm-2"></div>
      </div>
  </>)
}

const UserMenu = () =>{
   const navigate = useNavigate()
  const logout = ()=>{
  clearAuth()
  navigate('/')
}
  return(<>
   <div className="row zentora-dashboard-navbar ">
        <div className="col-sm-2"></div>
        <div className="col-sm-8 menu">
          <nav className="navbar navbar-expand-lg ">
            <div className="container-fluid">
              <a className="navbar-brand" href="#">
                Freelancing <b className='text-color1'>24x7</b>
              </a>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon" />
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item">

                    <Link className="nav-link"  aria-current="page" to="/user-dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/user-project">
                      Project
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/user-bids">
                      Bids
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/user-profile">
                      Profile
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/user-plans">
                      Plans
                    </Link>
                  </li>
                  <li className="nav-item d-flex align-items-center">
                    <NotificationBell />
                  </li>
                  <li className="nav-item">
                  <button className="nav-link" onClick={logout}>
                      Logout
                    </button>
                  </li>
                 
                </ul>
              </div>
            </div>
          </nav>

        </div>
        <div className="col-sm-2"></div>
      </div>
  </>)
}



export default Navbar


