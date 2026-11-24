import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck, Hourglass, CircleCheck, ClipboardCheck, TrendingUp, CalendarDays, Sparkles, ArrowRight, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import api, { errMsg, fmtDate, fmtTime } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Badge, Card, Empty, Spinner, StatCard } from './ui'
import MiniCalendar from './MiniCalendar'
import AppointmentModal from './AppointmentModal'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }

const Heading = ({ icon: Icon, children, right }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase tracking-tight">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent-dark"><Icon size={15} /></span>
      {children}
    </h2>
    {right}
  </div>
)

const Mini = ({ items, empty, onSelect, showUser = true }) => !items?.length ? <Empty title={empty} /> : (
  <ul className="divide-y divide-night/10">
    {items.map((a, i) => (
      <motion.li
        key={a.id}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.28, delay: 0.05 * i }}
      >
        <button
          type="button"
          onClick={() => onSelect?.(a)}
          className="group flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-cream/70"
        >
          <div className="min-w-0 transition-transform duration-200 group-hover:translate-x-0.5">
            <p className="truncate text-sm font-medium transition-colors group-hover:text-accent-dark">{showUser ? a.user?.name : a.service?.name}</p>
            <p className="truncate text-xs text-night/50">{showUser ? `${a.service?.name} · ` : ''}{fmtDate(a.appointment_date)}, {fmtTime(a.appointment_time)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge status={a.status} />
            <ChevronRight size={14} className="text-night/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent-dark" />
          </div>
        </button>
      </motion.li>
    ))}
  </ul>
)

/**
 * Shared dashboard body so the admin and customer dashboards keep the same design.
 * The API scopes the numbers automatically: admins see all bookings, customers
 * only see their own.
 */
export default function DashboardOverview() {
  const [d, setD] = useState(null)
  const [view, setView] = useState(null)
  const toast = useToast()
  const { user } = useAuth()

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((r) => setD(r.data))
      .catch((e) => toast.error(errMsg(e)))
  }, [toast])

  if (!d) return <Spinner />

  const t = d.totals || {}
  const isAdmin = user?.role === 'admin'
  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const next = d.upcoming?.[0]
  const today = new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="relative mb-5 overflow-hidden rounded-2xl bg-night p-5 text-white sm:p-6">
        <motion.span
          aria-hidden
          animate={{ y: [0, -12, 0], opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-14 -top-24 h-60 w-60 rounded-full bg-accent/30 blur-3xl"
        />
        <span className="pointer-events-none absolute -bottom-16 right-24 h-32 w-32 rounded-full border border-white/10" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{isAdmin ? 'Admin overview' : today}</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">{greeting}, {isAdmin ? 'Admin' : firstName}.</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/60">
              {isAdmin ? (
                t.pending ? <>
                  <span className="font-semibold text-white">{t.pending} request{t.pending === 1 ? '' : 's'}</span> waiting for review
                  {next && <> · Next: <span className="text-white">{next.service?.name}</span> on {fmtDate(next.appointment_date)}, {fmtTime(next.appointment_time)}</>}
                </> : 'No pending requests right now. Everything is up to date.'
              ) : next ? <>
                Next up: <span className="font-semibold text-white">{next.service?.name}</span> · {fmtDate(next.appointment_date)}, {fmtTime(next.appointment_time)}
              </> : 'No upcoming appointments yet. Pick a time that works for you.'}
            </p>
          </div>
          <Link
            to={isAdmin ? '/admin/appointments' : '/app/book'}
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold text-night transition-all duration-200 hover:bg-accent-dark hover:shadow-lg hover:shadow-accent/25 active:scale-95"
          >
            {isAdmin ? 'Review bookings' : 'Book appointment'}
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>

      <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [CalendarCheck, 'Total Appointments', t.total, 'primary'],
          [Hourglass, 'Pending Appointments', t.pending, 'warning'],
          [CircleCheck, 'Approved Appointments', t.approved, 'success'],
          [ClipboardCheck, 'Completed Appointments', t.completed, 'info'],
        ].map(([icon, label, value, tone]) => (
          <motion.div key={label} variants={item} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
            <StatCard icon={icon} label={label} value={value} tone={tone} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={container} className="mt-6 grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full p-5">
            <Heading icon={TrendingUp} right={<span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-night/45">Last 7 days</span>}>
              Appointment statistics
            </Heading>
            {d.chart?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={d.chart}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F25C19" />
                      <stop offset="100%" stopColor="#FFB08A" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#11111112" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#7A7468' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7A7468' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(242,92,25,0.07)' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(17,17,17,0.12)', fontSize: 12 }} />
                  <Bar dataKey="total" fill="url(#barFill)" radius={[6, 6, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            ) : <Empty title="No data yet" hint="Statistics appear once appointments are booked." />}
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full p-5">
            <Heading icon={CalendarDays}>Appointment calendar</Heading>
            <MiniCalendar marked={d.calendar} counts={d.calendar_counts} />
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="h-full p-5">
            <Heading icon={Sparkles}>Recent appointments</Heading>
            <Mini items={d.recent} empty="No appointments yet" onSelect={setView} showUser={isAdmin} />
          </Card>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <Card className="h-full p-5">
            <Heading icon={ClipboardCheck}>Upcoming appointments</Heading>
            <Mini items={d.upcoming} empty="Nothing upcoming" onSelect={setView} showUser={isAdmin} />
          </Card>
        </motion.div>
      </motion.div>

      <AppointmentModal appt={view} onClose={() => setView(null)} />
    </motion.div>
  )
}
