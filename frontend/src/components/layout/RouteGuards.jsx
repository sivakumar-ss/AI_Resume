import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import LoadingScreen from '../ui/LoadingScreen'

function homeFor(user) {
  return user?.role === 'admin' ? '/admin' : '/dashboard'
}

export function ProtectedRoute({ role }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status !== 'authenticated' || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={homeFor(user)} replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { status, user } = useAuth()

  if (status === 'loading') {
    return <LoadingScreen />
  }

  if (status === 'authenticated' && user) {
    return <Navigate to={homeFor(user)} replace />
  }

  return <Outlet />
}
