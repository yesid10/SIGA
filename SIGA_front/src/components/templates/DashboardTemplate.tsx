import type { ReactNode } from 'react'
import type { Usuario } from '../../services/auth'
import { Navbar } from '../organisms/Navbar'
import { Sidebar } from '../organisms/Sidebar'

type DashboardTemplateProps = { user: Usuario; onLogout: () => void; children: ReactNode }

export const DashboardTemplate = ({ user, onLogout, children }: DashboardTemplateProps) => {
  return <div className="min-h-screen bg-[#f7f8f3]"><Navbar user={user} onLogout={onLogout} /><div className="lg:flex"><Sidebar /><main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main></div></div>
}
