import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Calculator, BarChart2,
  Settings, Menu, X, LogOut, ShieldCheck, User
} from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'

const allNavItems = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard',       adminOnly: true },
  { to: '/input',   icon: ClipboardList,   label: 'Input Produksi',  adminOnly: false },
  { to: '/modal',   icon: Calculator,      label: 'Kalkulasi Modal', adminOnly: true },
  { to: '/laporan', icon: BarChart2,       label: 'Laporan Operator',adminOnly: true },
  { to: '/master',  icon: Settings,        label: 'Master Data',     adminOnly: true },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { role, nama, logout } = useAuthStore()

  const isAdmin = role === 'admin'
  const navItems = allNavItems.filter((n) => isAdmin || !n.adminOnly)
  const currentPage = allNavItems.find((n) => n.to === location.pathname)?.label ?? 'HitungBordir'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-blue-900 text-white z-30 flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-800">
          <div>
            <div className="font-bold text-lg leading-tight">HitungBordir</div>
            <div className="text-blue-300 text-xs">Kalkulator Produksi</div>
          </div>
          <button className="lg:hidden text-blue-300" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-blue-800 flex items-center gap-2.5">
          <div className={`p-1.5 rounded-full ${isAdmin ? 'bg-yellow-500/20' : 'bg-blue-700'}`}>
            {isAdmin
              ? <ShieldCheck size={15} className="text-yellow-400" />
              : <User size={15} className="text-blue-300" />}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{nama}</div>
            <div className="text-xs text-blue-400">{isAdmin ? 'Administrator' : 'Staff'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-0.5 px-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${isActive
                  ? 'bg-blue-700 text-white font-medium'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 pt-2 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-300 hover:bg-blue-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Keluar
          </button>
          <div className="text-blue-500 text-xs mt-2 px-3">v0.1.0 · HitungBordir</div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span className="text-gray-700 font-medium text-sm">{currentPage}</span>
          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                <ShieldCheck size={11} />Admin
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
