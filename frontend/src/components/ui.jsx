import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Inbox, X, Search, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { STATUS } from '../lib/api'

/* Count numbers up when a card first appears so the dashboard feels alive. */
const CountUp = ({ value }) => {
  const target = Number(value) || 0
  const [display, setDisplay] = useState(0)
  const previous = useRef(0)

  useEffect(() => {
    const from = previous.current
    if (from === target) { setDisplay(target); return }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / 750)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(from + (target - from) * eased))
      if (progress < 1) raf = requestAnimationFrame(tick)
      else previous.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target])

  if (value === undefined || value === null) return <>—</>
  return <>{display.toLocaleString('en-PH')}</>
}

export const Card = ({ className = '', children }) => (
  <div className={`rounded-2xl border border-night/15 bg-white shadow-card transition-shadow duration-300 ${className}`}>{children}</div>
)

/* Fade sections in as they scroll into view (used on the public landing page). */
export const Reveal = ({ children, className = '', delay = 0, y = 24 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-70px' }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

export const PageHeader = ({ title, subtitle, children }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-night">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-night/60">{subtitle}</p>}
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </motion.div>
)

export const StatCard = ({ icon: Icon, label, value, tone = 'primary', hint }) => {
  const tones = {
    primary: 'bg-accent/10 text-accent-dark', warning: 'bg-amber-50 text-warning',
    success: 'bg-accent/15 text-accent-dark', info: 'bg-night/5 text-night/70',
  }
  const glows = {
    primary: 'bg-accent/10', warning: 'bg-amber-200/50', success: 'bg-accent/20', info: 'bg-night/10',
  }
  return (
    <Card className="group relative overflow-hidden p-5">
      <span className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${glows[tone]} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`} />
      <div className="relative flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]} transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110`}>
          <Icon size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-night/45">{label}</p>
          <p className="mt-0.5 font-display text-3xl font-extrabold leading-none tabular-nums"><CountUp value={value} /></p>
          {hint && <p className="mt-1 text-xs text-night/45">{hint}</p>}
        </div>
      </div>
    </Card>
  )
}

const BTN = {
  primary: 'bg-accent text-night shadow-sm shadow-accent/25 hover:bg-accent-dark hover:shadow-md hover:shadow-accent/30',
  secondary: 'border border-night/20 bg-white text-night hover:border-night/35 hover:bg-cream',
  danger: 'bg-danger text-white shadow-sm shadow-danger/20 hover:bg-red-600 hover:shadow-md hover:shadow-danger/25',
  ghost: 'text-night/60 hover:bg-night/5 hover:text-night',
}
export const Button = ({ variant = 'primary', size = 'md', loading, icon: Icon, children, className = '', ...p }) => (
  <button
    {...p}
    disabled={p.disabled || loading}
    className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'} ${BTN[variant]} ${className}`}
  >
    {loading ? <Loader2 size={16} className="animate-spin" /> : Icon && <Icon size={size === 'sm' ? 14 : 16} />}
    {children}
  </button>
)

export const Badge = ({ status }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS[status] || 'bg-slate-100 text-slate-600'}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
)

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-night/50">
    <span className="relative flex h-9 w-9 items-center justify-center">
      <span className="absolute inset-0 rounded-full border-2 border-accent/15" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent" />
      <Loader2 size={14} className="text-accent-dark" />
    </span>
    {label}
  </div>
)

export const Empty = ({ title = 'Nothing here yet', hint, action }) => (
  <div className="flex flex-col items-center px-6 py-14 text-center">
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-night/30"
    >
      <Inbox size={26} />
    </motion.span>
    <p className="mt-3 font-medium">{title}</p>
    {hint && <p className="mt-1 max-w-xs text-sm text-night/50">{hint}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
)

export const Field = ({ label, error, children }) => (
  <label className="block text-sm">
    <span className="mb-1 block font-medium text-ink">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
  </label>
)
export const inputCls = 'w-full rounded-lg border border-night/15 bg-white px-3 py-2 text-sm text-night placeholder:text-night/40 transition-all duration-200 hover:border-night/30 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

export const PasswordStrength = ({ value = '' }) => {
  if (!value) return null
  const checks = [
    value.length >= 8,
    /[a-z]/.test(value) && /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ]
  const score = value ? checks.filter(Boolean).length : 0
  const label = !value ? '' : value.length < 8 ? 'At least 8 characters' : ['', 'Weak', 'Fair', 'Good', 'Strong'][score]
  const barColor = score <= 1 ? 'bg-danger' : score === 2 ? 'bg-warning' : score === 3 ? 'bg-accent' : 'bg-success'
  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < score ? barColor : 'bg-night/10'}`} />
        ))}
      </div>
      {value && <p className={`mt-1 text-xs font-medium ${score <= 1 ? 'text-danger' : score === 2 ? 'text-warning' : 'text-success'}`}>{label}</p>}
    </div>
  )
}

export const PasswordInput = ({ className = '', ...props }) => {
  const [show, setShow] = useState(false)
  return (
    <div className="group relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        className={`${inputCls} pr-11 ${className}`}
      />
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShow((v) => !v) }}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1.5 text-night/40 transition-colors hover:bg-cream hover:text-night focus:outline-none"
      >
        {show ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  )
}

export const SearchBox = ({ value, onChange, placeholder = 'Search…' }) => (
  <div className="group relative">
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-night/35 transition-colors group-focus-within:text-accent-dark" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} pl-9`} />
  </div>
)

export const Modal = ({ open, onClose, title, children, wide }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 z-50 flex items-center justify-center bg-night/50 p-4 backdrop-blur-sm" onMouseDown={onClose} role="dialog" aria-modal="true">
        <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl border border-night/10 bg-white shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`} onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b border-night/10 px-5 py-4">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">{title}</h2>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-night/50 transition-colors hover:bg-cream hover:text-night"><X size={18} /></button>
          </div>
          <div className="p-5">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export const Table = ({ head, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm">
      <thead className="border-b border-night/10 bg-cream text-xs font-semibold uppercase tracking-[0.08em] text-night/50">
        <tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3">{h}</th>)}</tr>
      </thead>
      <tbody className="divide-y divide-night/10">{children}</tbody>
    </table>
  </div>
)
export const Td = ({ className = '', ...p }) => <td className={`whitespace-nowrap px-4 py-3 ${className}`} {...p} />

export const SuccessNote = ({ children }) => children ? (
  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-sm font-medium text-accent-dark">
    <CheckCircle2 size={15} />
    {children}
  </motion.p>
) : null

export const Confirm = ({ open, onClose, onConfirm, title, message, loading, label = 'Confirm' }) => (
  <Modal open={open} onClose={onClose} title={title}>
    <p className="text-sm leading-relaxed text-night/60">{message}</p>
    <div className="mt-5 flex justify-end gap-2">
      <Button variant="secondary" onClick={onClose}>Keep</Button>
      <Button variant="danger" loading={loading} onClick={onConfirm}>{label}</Button>
    </div>
  </Modal>
)
