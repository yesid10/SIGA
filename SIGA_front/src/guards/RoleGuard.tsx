import { Navigate, Outlet } from 'react-router-dom'
import type { Rol, Usuario } from '../services/auth'

type RoleGuardProps = { user: Usuario | null; allowedRoles: Rol[] }

export const RoleGuard = ({ user, allowedRoles }: RoleGuardProps) => {
  if (!user) return <Navigate to="/login" replace />
  return allowedRoles.includes(user.rol) ? <Outlet /> : <Navigate to="/dashboard" replace />
}
