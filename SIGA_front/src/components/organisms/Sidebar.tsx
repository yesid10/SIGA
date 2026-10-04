import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/inventory', label: 'Inventario' },
  { to: '/donations', label: 'Donaciones' },
  { to: '/requests', label: 'Solicitudes' },
]

export function Sidebar() {
  return (
    <aside className="border-b border-slate-200 bg-white lg:min-h-[calc(100vh-73px)] lg:w-60 lg:border-b-0 lg:border-r">
      <nav className="flex gap-1 overflow-x-auto p-3 lg:grid lg:content-start lg:gap-2 lg:p-5">
        {links.map((link) => (
          <NavLink key={link.to} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-emerald-50 text-emerald-900' : 'text-slate-600 hover:bg-slate-50'}`} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
