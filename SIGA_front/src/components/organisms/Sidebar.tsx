import { NavLink } from 'react-router-dom'
import {
  LuLayoutDashboard,
  LuUsers,
  LuBox,
  LuMapPin,
  LuHeartHandshake,
  LuTruck,
  LuBoxes,
  LuClipboardList,
} from 'react-icons/lu'
import type { IconType } from 'react-icons'
import { useAuthStore } from '../../stores/authStore'
import type { Rol } from '../../services/auth'

type NavItem = {
  to: string
  label: string
  roles: Rol[]
  icon: IconType
}

const navItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    roles: ['ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO'],
    icon: LuLayoutDashboard,
  },
  {
    to: '/users',
    label: 'Usuarios y Roles',
    roles: ['ADMINISTRADOR'],
    icon: LuUsers,
  },
  {
    to: '/products',
    label: 'Productos',
    roles: ['ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO'],
    icon: LuBox,
  },
  {
    to: '/locations',
    label: 'Ubicaciones',
    roles: ['ADMINISTRADOR', 'ENCARGADO'],
    icon: LuMapPin,
  },
  {
    to: '/donors',
    label: 'Donantes',
    roles: ['ADMINISTRADOR', 'ENCARGADO'],
    icon: LuHeartHandshake,
  },
  {
    to: '/donations',
    label: 'Donaciones',
    roles: ['ADMINISTRADOR', 'ENCARGADO'],
    icon: LuTruck,
  },
  {
    to: '/inventory',
    label: 'Inventario (Lotes)',
    roles: ['ADMINISTRADOR', 'ENCARGADO'],
    icon: LuBoxes,
  },
  {
    to: '/requests',
    label: 'Solicitudes',
    roles: ['ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO'],
    icon: LuClipboardList,
  },
]

export const Sidebar = () => {
  const user = useAuthStore((state) => state.user)
  const currentRole = user?.rol ?? 'BENEFICIARIO'

  const visibleLinks = navItems.filter((item) => item.roles.includes(currentRole))

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'ADMINISTRADOR':
        return 'Panel Administrativo'
      case 'ENCARGADO':
        return 'Operación Bodega'
      case 'BENEFICIARIO':
        return 'Portal Beneficiario'
      default:
        return 'Navegación'
    }
  }

  return (
    <aside className="border-b border-slate-200 bg-white lg:min-h-[calc(100vh-73px)] lg:w-64 lg:border-b-0 lg:border-r">
      <div className="hidden border-b border-slate-100 px-5 py-3.5 lg:block">
        <span className="text-[0.68rem] font-bold uppercase tracking-widest text-slate-400">
          {getRoleLabel()}
        </span>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-3 lg:grid lg:content-start lg:gap-1.5 lg:p-4">
        {visibleLinks.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="size-4.5 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
