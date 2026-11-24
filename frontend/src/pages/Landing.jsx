import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Clock, Mail, MapPin, Menu, Phone, X, CalendarDays } from 'lucide-react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import api, { peso, fmtTime } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Logo, Pill, Eyebrow, Sparkle, OrbArt, SceneArt, RingArt } from '../components/PublicBits'

const NAV = [['Home', '#home'], ['Services', '#services'], ['About', '#about'], ['Contact', '#contact']]
const TIMES = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00']
const STEPS = [['Choose a service', 'Pick what you need from the list.'], ['Pick a date and time', 'Only open slots can be selected.'], ['Confirm your details', 'Check your name and phone number.'], ['Get your reference', 'Track approval from your dashboard.']]

function SlotPreview({ to }) {
  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d }), [])
  const [day, setDay] = useState(1)
  const [time, setTime] = useState('10:00')
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      className="w-full max-w-sm rounded-3xl border border-night/10 bg-white/95 p-5 shadow-[0_24px_60px_-20px_rgba(17,17,17,0.35)] backdrop-blur"
    >
      <p className="font-display text-lg font-bold">Pick a time</p>
      <div className="mt-4 grid grid-cols-6 gap-1.5">
        {days.map((d, i) => (
          <button key={i} onClick={() => setDay(i)} aria-pressed={day === i} className={`rounded-xl py-2 text-center transition-colors ${day === i ? 'bg-night text-white' : 'bg-cream hover:bg-night/10'}`}>
            <span className="block text-[11px] opacity-70">{d.toLocaleDateString('en-PH', { weekday: 'short' })}</span>
            <span className="block text-base font-semibold">{d.getDate()}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {TIMES.map((t) => (
          <button key={t} onClick={() => setTime(t)} aria-pressed={time === t} className={`rounded-full border py-2 text-sm font-medium transition-colors ${time === t ? 'border-accent bg-accent text-night' : 'border-night/15 hover:bg-cream'}`}>{fmtTime(t)}</button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-night/10 pt-4">
        <p className="text-sm font-medium leading-tight">{days[day].toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })}<br /><span className="text-night/60">{fmtTime(time)}</span></p>
        <Link to={to} className="inline-flex items-center gap-1.5 rounded-full bg-night px-4 py-2.5 text-sm font-semibold text-white hover:bg-black">Book <ArrowRight size={15} /></Link>
      </div>
      <p className="mt-3 text-xs text-night/50">Sample times. Live availability shows when you book.</p>
    </motion.div>
  )
}

export default function Landing() {
  const { user } = useAuth()
  const [services, setServices] = useState(null)
  const [menu, setMenu] = useState(false)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 })
  const bookTo = user ? (user.role === 'admin' ? '/admin' : '/app/book') : '/login'
  useEffect(() => { api.get('/services', { params: { active: 1 } }).then((r) => setServices(r.data.data ?? r.data)).catch(() => setServices([])) }, [])

  return (
    <div className="overflow-x-clip bg-cream text-night">
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent" />
      <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-9 text-sm font-medium md:flex">
            {NAV.map(([l, h], i) => <a key={l} href={h} className={`border-b-2 py-1 ${i === 0 ? 'border-accent' : 'border-transparent text-night/70 hover:text-night'}`}>{l}</a>)}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to={user ? (user.role === 'admin' ? '/admin' : '/app') : '/login'} className="px-3 text-sm font-semibold hover:text-accent-dark">{user ? 'Dashboard' : 'Login'}</Link>
            <Pill to={bookTo} variant="outline" className="!py-2.5">Book Appointment <ArrowRight size={15} /></Pill>
          </div>
          <button className="md:hidden" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X /> : <Menu />}</button>
        </div>
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden border-t border-night/10 md:hidden"
            >
              <div className="space-y-1 px-5 py-3">
                {NAV.map(([l, h]) => <a key={l} href={h} onClick={() => setMenu(false)} className="block rounded-lg py-2 text-sm font-medium transition-colors hover:bg-white/60">{l}</a>)}
                <div className="flex gap-2 pt-2"><Pill to="/login" variant="outline" className="flex-1 !py-2.5">Login</Pill><Pill to={bookTo} className="flex-1 !py-2.5">Book</Pill></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero */}
      <section id="home" className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 pt-8 md:grid-cols-[1.1fr_1fr] md:pb-24">
        <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="relative z-10">
          <Eyebrow>ONLINE BOOKING</Eyebrow>
          <h1 className="font-display text-[44px] font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Schedule Your Appointment <span className="text-accent">Easily</span><span className="text-night">.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-night/70">Pick an open time, confirm in a minute, and follow your request from pending to approved.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Pill to={bookTo} className="px-7">Book Now <ArrowRight size={16} /></Pill>
            <Pill href="#services" variant="outline" className="px-7"><CalendarDays size={16} />Explore Services</Pill>
          </div>
        </motion.div>
        <div className="relative flex min-h-[420px] items-end justify-center md:min-h-[520px] md:justify-end">
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-6 top-0 h-full w-[115%] max-w-none md:right-[-40px] md:w-[125%]">
            <OrbArt className="h-full w-full" />
          </motion.div>
          <motion.span animate={{ rotate: [0, 18, 0], scale: [1, 1.12, 1] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="absolute left-4 top-6 text-accent">
            <Sparkle size={22} />
          </motion.span>
          <div className="relative z-10 pb-2 md:pb-6"><SlotPreview to={bookTo} /></div>
        </div>
      </section>

      {/* About */}
      <motion.section id="about" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1fr_1.1fr]">
        <div className="relative h-72 overflow-hidden rounded-[28px] md:h-80">
          <SceneArt className="h-full w-full" />
          <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-night px-4 py-2 text-xs font-semibold text-white"><span className="h-2 w-2 rounded-full bg-accent" />About Us</span>
        </div>
        <div>
          <Eyebrow>ABOUT US</Eyebrow>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">We make booking feel <span className="text-accent">effortless</span>.</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-night/70">Every time you see is open, and every request gets a clear answer from our team. You always know where your booking stands. Replace this text with your own story before launch.</p>
          <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-night/10 pt-6">
            {[['24/7', 'Online booking'], ['0', 'Double bookings'], ['1', 'Reference per booking']].map(([v, l]) => (
              <div key={l}><dt className="font-display text-2xl font-bold">{v}</dt><dd className="text-xs text-night/60">{l}</dd></div>
            ))}
          </dl>
        </div>
      </motion.section>

      {/* Services */}
      <motion.section id="services" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-10 md:grid-cols-[0.8fr_1.4fr]">
          <div>
            <Eyebrow>OUR SERVICES</Eyebrow>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">From booking to done, <span className="text-accent">we handle it</span>.</h2>
            <Pill to={bookTo} variant="outline" className="mt-6">Book a service <ArrowRight size={15} /></Pill>
          </div>
          <div>
            {services === null ? <p className="py-10 text-center text-sm text-night/60">Loading services…</p> : services.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-night/20 py-14 text-center"><p className="font-semibold">Services will appear here</p><p className="mt-1 text-sm text-night/60">They load from the booking server once it is connected.</p></div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {services.slice(0, 6).map((s, i) => (
                  <Link to={bookTo} key={s.id} className={`group flex flex-col rounded-[28px] bg-gradient-to-b from-white to-[#E4DFD8] p-5 shadow-[0_18px_40px_-24px_rgba(17,17,17,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-24px_rgba(17,17,17,0.5)] ${i % 3 === 1 ? 'sm:-translate-y-5 sm:hover:-translate-y-6' : ''}`}>
                    {s.image_url && <img src={s.image_url} alt="" className="mb-3 h-28 w-full rounded-2xl object-cover" />}
                    <h3 className="font-display text-lg font-bold leading-tight">{s.name}</h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm text-night/60">{s.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-night/60"><Clock size={13} className="mr-1 inline" />{s.duration} min · <b className="text-night">{peso(s.price)}</b></span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-night text-white transition-all duration-200 group-hover:scale-110 group-hover:bg-accent group-hover:text-night"><ArrowUpRight size={15} /></span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Process */}
      <motion.section initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 md:grid-cols-[0.9fr_1.1fr]">
        <RingArt className="mx-auto w-full max-w-sm" />
        <div>
          <Eyebrow>HOW IT WORKS</Eyebrow>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">A simple process. A big <span className="text-accent">relief</span>.</h2>
          <ol className="mt-7 divide-y divide-night/10 border-y border-night/10">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="group flex items-center gap-4 rounded-xl px-2 py-4 transition-colors hover:bg-cream/70">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-night/20 text-sm font-semibold transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-night">{String(i + 1).padStart(2, '0')}</span>
                <div><p className="font-semibold">{t}</p><p className="text-sm text-night/60">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-6xl px-5 py-10">
        <div className="relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[28px] bg-night px-8 py-10 md:flex-row md:items-center md:px-12">
          <motion.span animate={{ rotate: 360 }} transition={{ duration: 26, repeat: Infinity, ease: 'linear' }} className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-accent opacity-70 md:block">
            <Sparkle size={90} />
          </motion.span>
          <div className="relative">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">Ready for your next <span className="text-accent">slot</span>?</h2>
            <p className="mt-1 text-white/60">Create a free account and book in a few steps.</p>
          </div>
          <Pill to={user ? bookTo : '/register'} className="relative px-7">{user ? 'Book Now' : 'Create account'} <ArrowRight size={16} /></Pill>
        </div>
      </motion.section>

      {/* Contact + footer */}
      <footer id="contact" className="mx-auto max-w-6xl px-5 pb-8 pt-14">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-start">
          <div><Logo /><p className="mt-3 max-w-xs text-sm text-night/60">Online appointment booking for Tangub City and nearby.</p></div>
          <ul className="grid gap-3 text-sm sm:grid-cols-3 md:gap-8">
            {[[MapPin, 'Tangub City, Misamis Occidental'], [Phone, '+63 900 000 0000'], [Mail, 'hello@bookly.example']].map(([Icon, v]) => (
              <li key={v} className="flex items-center gap-2"><Icon size={16} className="text-accent" />{v}</li>
            ))}
          </ul>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-night/10 pt-5 text-sm text-night/60">
          <p>© {new Date().getFullYear()} Bookly. All rights reserved.</p>
          <p>Book <span className="text-accent">·</span> Confirm <span className="text-accent">·</span> Show up</p>
        </div>
      </footer>
    </div>
  )
}
