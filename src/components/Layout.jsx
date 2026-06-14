import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Calculator, BarChart2,
  Settings, Menu, X, LogOut, ShieldCheck, User
} from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '../store/authStore'
import logoBeige from '../assets/logo-beige.png'

const allNavItems = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard',        adminOnly: true },
  { to: '/input',   icon: ClipboardList,   label: 'Input Produksi',   adminOnly: false },
  { to: '/modal',   icon: Calculator,      label: 'Kalkulasi Modal',  adminOnly: true },
  { to: '/laporan', icon: BarChart2,       label: 'Laporan Operator', adminOnly: true },
  { to: '/master',  icon: Settings,        label: 'Master Data',      adminOnly: true },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { role, nama, logout } = useAuthStore()

  const isAdmin = role === 'admin'
  const navItems = allNavItems.filter((n) => isAdmin || !n.adminOnly)
  const currentPage = allNavItems.find((n) => n.to === location.pathname)?.label ?? 'Harmoni Bordir'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 z-30 flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
        style={{ backgroundColor: '#034543' }}
      >
        {/* Logo */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between">
            <div>
              <img src={logoBeige} alt="harmoni" style={{ width: '100px', display: 'block', marginBottom: '3px' }} />
              <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,251,213,0.55)' }}>
                Bordir
              </div>
            </div>
            <button className="lg:hidden" style={{ color: 'rgba(255,251,213,0.6)' }} onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-full ${isAdmin ? '' : ''}`}
              style={{ background: isAdmin ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.08)' }}>
              {isAdmin
                ? <ShieldCheck size={15} style={{ color: '#FCD34D' }} />
                : <User size={15} style={{ color: 'rgba(255,251,213,0.7)' }} />}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{nama}</div>
              <div className="text-xs font-medium" style={{ color: 'rgba(255,251,213,0.5)' }}>
                {isAdmin ? 'Administrator' : 'Staff'}
              </div>
            </div>
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
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'text-white'
                  : 'hover:text-white'}`}
              style={({ isActive }) => isActive
                ? { background: 'rgba(255,255,255,0.12)', color: '#fff' }
                : { color: 'rgba(255,251,213,0.55)' }}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:text-white"
            style={{ color: 'rgba(255,251,213,0.5)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={17} />
            Keluar
          </button>
          <div className="text-xs mt-2 px-3" style={{ color: 'rgba(255,251,213,0.25)' }}>
            v0.1.0 · Harmoni Bordir
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10"
          style={{ borderColor: '#EDE9A8' }}>
          <button
            className="lg:hidden"
            style={{ color: '#034543' }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-sm" style={{ color: '#282828' }}>{currentPage}</span>
          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }}>
                <ShieldCheck size={11} />Admin
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto" style={{ background: '#FFFBD5' }}>{children}</main>
      </div>
    </div>
  )
}
