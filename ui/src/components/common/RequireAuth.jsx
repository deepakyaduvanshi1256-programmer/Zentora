import React from 'react'
import { Navigate } from 'react-router-dom'
import { getUser, isLoggedIn } from '../../utils/auth'

// Wraps a route so it's only reachable by a logged-in user of the right role.
// `role` can be a single role string or an array of allowed roles.
const RequireAuth = ({ role, children }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  const user = getUser()
  const allowed = Array.isArray(role) ? role.includes(user?.type) : user?.type === role
  if (!allowed) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default RequireAuth
