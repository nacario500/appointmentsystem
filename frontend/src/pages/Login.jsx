import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Check, Loader2, Menu, X, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errMsg } from '../lib/api'
import { Logo, Pill, OrbArt } from '../components/PublicBits'

const POINTS = ['See open times before you commit', 'No double bookings, ever', 'Track every request in one place']
const field = 'w-full rounded-2xl border border-night/15 bg-cream/50 px-4 py-3 text-sm text-night placeholder:text-night/40 transition-all duration-200 hover:border-night/30 focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/25'

const list = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }
const point = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.35 } } }

/* Shared by Login and Register */
export function AuthShell({ title, subtitle, children, footer, nav = 'login' }) {
  const [menu, setMenu] = useState(false)
  const isLogin = nav === 'login'
  return (
    <div className="grid min-h-screen bg-cream text-night lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden flex-col overflow-hidden bg-night p-12 text-white lg:flex">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link to="/"><Logo light /></Link>
        </motion.div>
        <motion.div
          aria-hidden
          animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -bottom-32 -right-28 h-[460px] w-[460px]"
        >
          <OrbArt className="h-full w-full" />
        </motion.div>
        <div className="relative z-10 mt-20 max-w-sm">
          <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="font-display text-4xl font-extrabold uppercase leading-[1.02] tracking-tight">
            Your next slot is a few taps <span className="text-accent">away</span>.
          </motion.h2>
          <motion.ul variants={list} initial="hidden" animate="show" className="mt-8 space-y-3">
            {POINTS.map((p) => (
              <motion.li key={p} variants={point} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-night"><Check size={13} /></span>{p}
              </motion.li>
            ))}
          </motion.ul>
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="relative z-10 mt-auto text-sm text-white/50">© {new Date().getFullYear()} Bookly</motion.p>
      </aside>

      <main className="relative flex flex-col overflow-hidden px-4 py-6 sm:px-12">
        <span className="pointer-events-none absolute -right-24 top-12 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <header className="relative z-20 flex h-12 items-center justify-between">
          <Link to="/" className="lg:hidden"><Logo /></Link>
          <nav className="ml-auto hidden items-center gap-8 text-sm font-medium lg:flex">
            <Link to="/" className="border-b-2 border-accent py-1 text-night">Home</Link>
            {isLogin
              ? <Link to="/register" className="border-b-2 border-transparent py-1 text-night/70 transition-colors hover:border-accent/40 hover:text-night">Register</Link>
              : <Link to="/login" className="border-b-2 border-transparent py-1 text-night/70 transition-colors hover:border-accent/40 hover:text-night">Log in</Link>}
          </nav>
          <button type="button" onClick={() => setMenu((v) => !v)} aria-label="Toggle menu" aria-expanded={menu} className="rounded-lg p-2 text-night transition-colors hover:bg-night/5 active:scale-95 lg:hidden">
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.16 }}
                className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-night/15 bg-white p-2 shadow-lg lg:hidden"
              >
                <Link to="/" onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-night transition-colors hover:bg-cream">Home</Link>
                {isLogin
                  ? <Link to="/register" onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-night/70 transition-colors hover:bg-cream hover:text-night">Register</Link>
                  : <Link to="/login" onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-night/70 transition-colors hover:bg-cream hover:text-night">Log in</Link>}
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <div className="relative z-10 flex flex-1 items-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-md"
          >
            <div className="rounded-3xl border border-night/20 bg-white p-7 shadow-[0_28px_70px_-30px_rgba(17,17,17,0.35)] sm:p-10">
              <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mb-8 mt-2 text-night/60">{subtitle}</p>
              {children}
            </div>
            <p className="mt-6 text-center text-sm text-night/60">{footer}</p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export const AuthInput = ({ icon: Icon, right, ...p }) => (
  <div className="group relative">
    {Icon && <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-night/40 transition-colors group-focus-within:text-accent-dark" />}
    <input {...p} className={`${field} ${Icon ? 'pl-11' : ''} ${right ? 'pr-11' : ''}`} />
    {right}
  </div>
)
export const AuthLabel = ({ label, children }) => (<label className="block text-sm"><span className="mb-1.5 block font-semibold">{label}</span>{children}</label>)
export const AuthSubmit = ({ busy, children }) => (
  <Pill type="submit" disabled={busy} className="w-full !py-3.5">{busy && <Loader2 size={16} className="animate-spin" />}{children}</Pill>
)

export default function Login() {
  const { user, login } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const loc = useLocation()
  const [f, setF] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />

  const submit = async (e) => {
    e.preventDefault(); setBusy(true)
    try { const u = await login(f.email, f.password); nav(u.role === 'admin' ? '/admin' : loc.state?.from || '/app', { replace: true }) }
    catch (err) { toast.error(errMsg(err)) } finally { setBusy(false) }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your appointments." footer={<>New here? <Link to="/register" className="font-semibold text-accent-dark hover:underline">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-5">
        <AuthLabel label="Username"><AuthInput icon={Mail} type="text" required autoComplete="username" placeholder="Enter username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></AuthLabel>
        <AuthLabel label="Password"><AuthInput icon={Lock} type={show ? 'text' : 'password'} required autoComplete="current-password" placeholder="Enter password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })}
          right={<button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShow((v) => !v) }} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} tabIndex={-1} className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1.5 text-night/40 transition-colors hover:bg-cream hover:text-night focus:outline-none">{show ? <Eye size={18} /> : <EyeOff size={18} />}</button>} /></AuthLabel>
        <AuthSubmit busy={busy}>Log in</AuthSubmit>
      </form>
      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-night/40"><ShieldCheck size={13} /> Your details stay private and secure.</p>
    </AuthShell>
  )
}
