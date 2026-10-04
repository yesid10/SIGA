import { Navigate, Outlet } from 'react-router-dom'
import type { Usuario } from '../services/auth'

type ProfileGuardProps = { user: Usuario | null; enabled: boolean }

export function ProfileGuard({ user, enabled }: ProfileGuardProps) {
  if (!user) return <Navigate to="/login" replace />
  return enabled ? <Outlet /> : <Navigate to="/dashboard" replace />
}
