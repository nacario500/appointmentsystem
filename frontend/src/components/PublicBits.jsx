import { Link } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'

export const Logo = ({ light }) => (
  <span className={`flex items-center gap-2 font-display text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-night'}`}>
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-night text-accent ring-1 ring-white/10"><CalendarDays size={18} /></span>
    Bookly
  </span>
)

const base = 'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'
const V = {
  accent: 'bg-accent text-night hover:bg-accent-dark',
  outline: 'border border-night/20 text-night hover:bg-night hover:text-white',
  dark: 'bg-night text-white hover:bg-black',
}
export const Pill = ({ to, href, variant = 'accent', className = '', children, ...p }) => {
  const cls = `${base} ${V[variant]} px-6 py-3 ${className}`
  if (to) return <Link to={to} className={cls} {...p}>{children}</Link>
  if (href) return <a href={href} className={cls} {...p}>{children}</a>
  return <button className={cls} {...p}>{children}</button>
}

export const Eyebrow = ({ children, light }) => (
  <p className={`mb-5 flex items-center gap-3 text-xs font-semibold tracking-[0.14em] ${light ? 'text-white/70' : 'text-night/70'}`}>
    <span className="h-0.5 w-9 bg-accent" />{children}
  </p>
)

export const Sparkle = ({ className = '', size = 28 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden fill="currentColor"><path d="M12 0c.7 6.3 5.7 11.3 12 12-6.3.7-11.3 5.7-12 12-.7-6.3-5.7-11.3-12-12C6.3 11.3 11.3 6.3 12 0z" /></svg>
)

/* Abstract orange sun + black ring, drawn in SVG so no photos are needed */
export const OrbArt = ({ className = '' }) => (
  <svg viewBox="0 0 520 520" className={className} aria-hidden>
    <defs>
      <radialGradient id="sun" cx="38%" cy="32%" r="75%"><stop offset="0" stopColor="#FF8A4C" /><stop offset="0.55" stopColor="#F25C19" /><stop offset="1" stopColor="#C73E05" /></radialGradient>
      <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3A3A3A" /><stop offset="0.5" stopColor="#0B0B0B" /><stop offset="1" stopColor="#2B2B2B" /></linearGradient>
    </defs>
    <ellipse cx="260" cy="260" rx="250" ry="78" transform="rotate(-24 260 260)" fill="none" stroke="#F25C19" strokeOpacity=".45" strokeWidth="2" />
    <circle cx="272" cy="240" r="170" fill="url(#sun)" />
    <ellipse cx="260" cy="268" rx="228" ry="66" transform="rotate(-24 260 268)" fill="none" stroke="url(#ring)" strokeWidth="26" />
    <path d="M40 330c70 60 190 90 330 40" fill="none" stroke="#F25C19" strokeWidth="3" strokeLinecap="round" />
    <path d="M90 110c60-40 150-50 230-20" fill="none" stroke="#111" strokeOpacity=".35" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

export const SceneArt = ({ className = '' }) => (
  <svg viewBox="0 0 520 360" className={className} preserveAspectRatio="xMidYMid slice" aria-hidden>
    <defs><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F1EEEA" /><stop offset="1" stopColor="#CFCBC5" /></linearGradient></defs>
    <rect width="520" height="360" fill="url(#wall)" />
    <circle cx="330" cy="150" r="108" fill="#F25C19" />
    <polygon points="0,360 0,120 190,200 330,360" fill="#2A2A2A" />
    <polygon points="0,120 120,60 190,200" fill="#7B7873" />
    <polygon points="190,200 520,250 520,360 330,360" fill="#E3DFD9" />
    <rect x="300" y="196" width="10" height="46" rx="5" fill="#111" /><circle cx="305" cy="188" r="7" fill="#111" />
  </svg>
)

export const RingArt = ({ className = '' }) => (
  <svg viewBox="0 0 420 300" className={className} aria-hidden>
    <defs><linearGradient id="r2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4A4A4A" /><stop offset=".5" stopColor="#0A0A0A" /><stop offset="1" stopColor="#333" /></linearGradient></defs>
    <ellipse cx="200" cy="150" rx="150" ry="100" transform="rotate(-28 200 150)" fill="none" stroke="url(#r2)" strokeWidth="46" />
    <ellipse cx="200" cy="150" rx="190" ry="70" transform="rotate(-18 200 150)" fill="none" stroke="#F25C19" strokeWidth="5" strokeLinecap="round" strokeDasharray="420 120" />
    <ellipse cx="210" cy="150" rx="215" ry="95" transform="rotate(10 210 150)" fill="none" stroke="#111" strokeOpacity=".25" strokeWidth="1.5" />
  </svg>
)
