import { Link } from 'react-router-dom'
import type { Usuario } from '../../services/auth'
import { Button } from '../atoms/Button'

type NavbarProps = { user: Usuario; onLogout: () => void }

export const Navbar = ({ user, onLogout }: NavbarProps) => {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <Link className="flex items-center gap-2 font-extrabold tracking-[.12em] text-emerald-900" to="/dashboard">
          <span className="grid size-9 place-items-center rounded-xl rounded-br-md border-2 border-current text-lg tracking-normal">S</span>SIGA
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:grid"><strong className="text-sm text-slate-800">{user.email}</strong><span className="text-[.68rem] uppercase tracking-widest text-slate-500">{user.rol}</span></div>
          <Button variant="secondary" type="button" onClick={onLogout}>Cerrar sesión</Button>
        </div>
      </div>
    </header>
  )
}
