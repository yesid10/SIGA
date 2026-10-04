import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Usuario } from '../services/auth'

type ProtectedRouteProps = { user: Usuario | null }

export function ProtectedRoute({ user }: ProtectedRouteProps) {
  const location = useLocation()
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />
}
