import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { LayoutDashboard, CalendarCheck, Briefcase, Users, Clock, BarChart3, Settings, LogOut, Menu, X, CalendarPlus, CalendarDays, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Confirm } from './ui'

const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
  { to: '/admin/services', label: 'Services', icon: Briefcase },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/schedule', label: 'Schedule Management', icon: Clock },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]
const CUSTOMER_NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/book', label: 'Book Appointment', icon: CalendarPlus },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

const initials = (name) => (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function Layout({ role }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const items = role === 'admin' ? ADMIN_NAV : CUSTOMER_NAV

  const doLogout = async () => {
    setLoggingOut(true)
    try { await logout(); nav('/login') } finally { setLoggingOut(false); setConfirmLogout(false) }
  }

  return (
    <div className="min-h-screen bg-cream text-night">
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-night/10 bg-cream/90 px-4 backdrop-blur lg:hidden">
        <Brand />
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="rounded-lg p-2 text-ink transition-colors hover:bg-night/5 active:scale-95"
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-night/40 backdrop-blur-[2px] lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-night/10 bg-white transition-transform duration-300 ease-out lg:translate-x-0 ${open ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`} aria-label="Sidebar">
        <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-accent via-accent/50 to-transparent" />
        <div className="hidden h-16 items-center px-6 lg:flex"><Brand /></div>
        <nav className="mt-16 flex-1 space-y-1 overflow-y-auto px-3 pb-3 lg:mt-0">
          <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-night/35">Menu</p>
          {items.map(({ to, label, icon: Icon, end }) => {
            const active = end ? location.pathname === to : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200"
              >
                {active && (
                  <motion.span
                    layoutId={`nav-active-${role}`}
                    className="absolute inset-0 rounded-xl bg-accent/10 ring-1 ring-inset ring-accent/20"
                    transition={{ type: 'spring', stiffness: 450, damping: 38 }}
                  />
                )}
                <Icon size={18} className={`relative shrink-0 transition-all duration-200 group-hover:scale-110 ${active ? 'text-accent-dark' : 'text-night/40 group-hover:text-night'}`} />
                <span className={`relative ${active ? 'text-accent-dark' : 'text-night/60 group-hover:text-night'}`}>{label}</span>
                {active && <motion.span layoutId={`nav-dot-${role}`} className="relative ml-auto h-1.5 w-1.5 rounded-full bg-accent" transition={{ type: 'spring', stiffness: 450, damping: 38 }} />}
              </NavLink>
            )
          })}
        </nav>

        {role === 'customer' && (
          <Link to="/app/book" className="group mx-3 mb-3 hidden overflow-hidden rounded-2xl bg-night p-4 text-white lg:block">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-night"><CalendarPlus size={16} /></span>
              <ArrowRight size={15} className="text-white/40 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent" />
            </div>
            <p className="mt-3 font-display text-sm font-bold uppercase tracking-tight">Need another slot?</p>
            <p className="mt-0.5 text-xs text-white/50">Book in a few taps.</p>
          </Link>
        )}

        <div className="border-t border-night/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-cream/70 px-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-night font-display text-xs font-bold text-accent">{initials(user?.name)}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-[11px] text-night/45">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setConfirmLogout(true)}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-red-50"
          >
            <LogOut size={18} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="px-4 pb-10 pt-20 lg:ml-64 lg:px-8 lg:pt-8">
        <div className="mx-auto w-full max-w-[1500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Confirm open={confirmLogout} onClose={() => setConfirmLogout(false)} loading={loggingOut} onConfirm={doLogout} label="Log out" title="Log out?" message="Are you sure you want to log out of your account?" />
    </div>
  )
}

export const Brand = () => (
  <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-night">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-night text-accent ring-1 ring-white/10"><CalendarDays size={18} /></span>
    Bookly
  </div>
)
