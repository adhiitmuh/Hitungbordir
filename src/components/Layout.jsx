import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Calculator, BarChart2,
  Settings, Menu, X, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/input', icon: ClipboardList, label: 'Input Produksi' },
  { to: '/modal', icon: Calculator, label: 'Kalkulasi Modal' },
  { to: '/laporan', icon: BarChart2, label: 'Laporan Operator' },
  { to: '/master', icon: Settings, label: 'Master Data' },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const currentPage = navItems.find((n) => n.to === location.pathname)?.label ?? 'HitungBordir'

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
        <div className="flex items-center justify-between px-5 py-4 border-b border-blue-800">
          <div>
            <div className="font-bold text-lg leading-tight">HitungBordir</div>
            <div className="text-blue-300 text-xs">Kalkulator Produksi</div>
          </div>
          <button className="lg:hidden text-blue-300" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
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
        <div className="px-4 py-3 border-t border-blue-800 text-blue-400 text-xs">
          v0.1.0 · HitungBordir
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
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span className="text-gray-700 font-medium">{currentPage}</span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
