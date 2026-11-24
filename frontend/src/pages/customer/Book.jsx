import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock, CheckCircle2, CalendarDays, UserRound, Phone, StickyNote, ArrowRight, ArrowLeft, Copy, CheckCheck, Sparkles } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import api, { errMsg, fmtDate, fmtTime, peso, today } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Button, Card, Empty, Field, inputCls, PageHeader, Spinner } from '../../components/ui'

const STEPS = ['Service', 'Date', 'Time', 'Details', 'Review']
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  delay: (i % 7) * 0.07,
  duration: 1.5 + (i % 4) * 0.25,
  rotate: (i * 47) % 360,
  size: 5 + (i % 3) * 3,
  color: ['#F25C19', '#111111', '#FFB08A', '#F6F2EC'][i % 4],
}))

const dayChips = () => Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { iso, label: d.toLocaleDateString('en-PH', { weekday: 'short' }), day: d.getDate(), month: d.toLocaleDateString('en-PH', { month: 'short' }) }
})

const stepVariants = {
  enter: (direction) => ({ opacity: 0, x: direction * 26 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction * -26 }),
}

export default function Book() {
  const { user } = useAuth()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [services, setServices] = useState(null)
  const [service, setService] = useState(null)
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState(null)
  const [time, setTime] = useState('')
  const [info, setInfo] = useState({ name: user.name, phone: user.phone || '', notes: '' })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { api.get('/services', { params: { active: 1 } }).then((r) => setServices(r.data.data ?? r.data)).catch((e) => { setServices([]); toast.error(errMsg(e)) }) }, [toast])

  useEffect(() => {
    if (!service || !date) return
    setSlots(null); setTime('')
    api.get('/availability', { params: { service_id: service.id, date } })
      .then((r) => setSlots(r.data.slots ?? r.data.data ?? [])).catch((e) => { setSlots([]); toast.error(errMsg(e)) })
  }, [service, date, toast])

  const canNext = [!!service, !!date, !!time, info.name.trim() && info.phone.trim(), true][step]

  const go = (next) => {
    if (next === step) return
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const confirm = async () => {
    setBusy(true)
    try {
      const { data } = await api.post('/appointments', { service_id: service.id, appointment_date: date, appointment_time: time, phone: info.phone, notes: info.notes })
      setDone(data.appointment ?? data.data ?? data)
    } catch (e) {
      toast.error(errMsg(e))
      if (e.response?.status === 409 || e.response?.status === 422) {
        go(2); setTime('')
        api.get('/availability', { params: { service_id: service.id, date } }).then((r) => setSlots(r.data.slots ?? []))
      }
    } finally { setBusy(false) }
  }

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(done.reference)
      setCopied(true)
      toast.success('Booking reference copied.')
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error('Could not copy the reference.')
    }
  }

  if (done) return (
    <div className="relative mx-auto mt-4 max-w-lg">
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl" aria-hidden>
        {CONFETTI.map((piece, i) => (
          <motion.span
            key={i}
            initial={{ y: -24, opacity: 0, rotate: 0 }}
            animate={{ y: [0, 310], opacity: [0, 1, 0], rotate: piece.rotate + 220 }}
            transition={{ duration: piece.duration, delay: piece.delay, ease: 'easeOut' }}
            className="absolute top-0 rounded-[2px]"
            style={{ left: piece.left, width: piece.size, height: piece.size * 1.7, backgroundColor: piece.color }}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
        <Card className="relative overflow-hidden p-6 text-center sm:p-9">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-accent/40 to-accent" />
          <div className="relative mx-auto w-fit">
            <motion.span
              initial={{ scale: 0, rotate: -24 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.08 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-night shadow-lg shadow-accent/30"
            >
              <CheckCircle2 size={42} />
            </motion.span>
            <motion.span
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-accent"
            />
          </div>

          <h1 className="mt-5 font-display text-2xl font-extrabold uppercase tracking-tight">Appointment requested</h1>
          <p className="mx-auto mt-1 max-w-xs text-sm text-night/60">Keep your reference number. We will confirm your booking soon.</p>

          <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-left">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-night/45">Reference</p>
              <p className="font-display text-xl font-bold tracking-[0.14em] text-accent-dark">{done.reference}</p>
            </div>
            <button
              type="button"
              onClick={copyReference}
              aria-label="Copy booking reference"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-white text-accent-dark transition-all hover:bg-accent hover:text-night active:scale-95"
            >
              {copied ? <CheckCheck size={18} /> : <Copy size={17} />}
            </button>
          </div>

          <dl className="mt-4 divide-y divide-night/10 overflow-hidden rounded-xl border border-night/10 text-left text-sm">
            {[
              ['Service', service.name],
              ['Date', fmtDate(done.appointment_date || date)],
              ['Time', fmtTime(done.appointment_time || time)],
              ['Name', info.name],
              ['Phone', info.phone],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 px-4 py-2.5">
                <dt className="text-night/50">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Sparkles size={12} /> Pending confirmation
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link to="/app" className="flex-1"><Button variant="secondary" className="w-full">Go to dashboard</Button></Link>
            <Button className="flex-1" onClick={() => window.location.reload()}>Book another</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  )

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Book an appointment" subtitle="Follow the steps below — it only takes a minute." />

      {/* Stepper */}
      <div className="mb-6 rounded-2xl border border-night/15 bg-white px-4 py-5 shadow-card sm:px-6">
        <ol className="flex items-center">
          {STEPS.map((s, i) => (
            <li key={s} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
              <button type="button" onClick={() => i < step && go(i)} disabled={i > step} className="flex items-center gap-2 text-left disabled:cursor-default">
                <motion.span
                  animate={i === step ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-200 ${
                    i < step ? 'border-accent bg-accent text-night'
                    : i === step ? 'border-accent bg-white text-accent-dark ring-4 ring-accent/15'
                    : 'border-night/15 bg-white text-night/40'
                  }`}
                >
                  {i < step ? <Check size={14} /> : i + 1}
                </motion.span>
                <span className={`hidden whitespace-nowrap text-xs font-semibold transition-colors sm:block ${i === step ? 'text-night' : i < step ? 'text-night/70 hover:text-accent-dark' : 'text-night/40'}`}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span className="mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-night/10 sm:mx-3">
                  <motion.span initial={false} animate={{ width: i < step ? '100%' : '0%' }} transition={{ duration: 0.35, ease: 'easeOut' }} className="block h-full rounded-full bg-accent" />
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs font-medium text-night/50 sm:hidden">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>
      </div>

      <Card className="overflow-hidden">
        <div className="h-1 bg-night/5">
          <motion.div initial={false} animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="h-full bg-gradient-to-r from-accent to-accent-dark" />
        </div>

        {step > 0 && service && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-night/10 bg-cream/50 px-5 py-2.5">
            <button type="button" onClick={() => go(0)} className="inline-flex items-center gap-1.5 rounded-full border border-night/10 bg-white px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-accent/40 hover:text-accent-dark">
              <Sparkles size={11} className="text-accent" /> {service.name}
            </button>
            {date && (
              <button type="button" onClick={() => go(1)} className="inline-flex items-center gap-1.5 rounded-full border border-night/10 bg-white px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-accent/40 hover:text-accent-dark">
                <CalendarDays size={11} className="text-accent" /> {fmtDate(date)}
              </button>
            )}
            {time && (
              <button type="button" onClick={() => go(2)} className="inline-flex items-center gap-1.5 rounded-full border border-night/10 bg-white px-2.5 py-1 text-[11px] font-medium transition-colors hover:border-accent/40 hover:text-accent-dark">
                <Clock size={11} className="text-accent" /> {fmtTime(time)}
              </button>
            )}
          </div>
        )}

        <div className="p-5 sm:p-6">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={step}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (services === null ? <Spinner /> : services.length === 0 ? <Empty title="No services available" hint="Please check back later." /> : (
                <div>
                  <h2 className="mb-1 font-display text-xl font-bold uppercase tracking-tight">Choose a service</h2>
                  <p className="mb-4 text-sm text-night/60">Pick what you need — the duration is blocked automatically.</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((s, i) => {
                      const active = service?.id === s.id
                      return (
                        <motion.button
                          key={s.id}
                          type="button"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: 0.04 * i }}
                          whileHover={{ y: -3 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => setService(s)}
                          className={`group relative rounded-2xl border-2 p-4 text-left transition-colors duration-200 ${active ? 'border-accent bg-accent/5 shadow-sm' : 'border-night/10 hover:border-accent/50 hover:bg-cream'}`}
                        >
                          {active && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 24 }} className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-night">
                              <Check size={12} />
                            </motion.span>
                          )}
                          <p className="pr-6 font-semibold">{s.name}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-night/60">{s.description}</p>
                          <p className="mt-4 flex items-center justify-between border-t border-night/10 pt-3 text-sm">
                            <span className="flex items-center gap-1.5 text-night/60"><Clock size={14} />{s.duration} min</span>
                            <span className="font-display font-bold text-accent-dark">{peso(s.price)}</span>
                          </p>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {step === 1 && (
                <div>
                  <h2 className="mb-1 font-display text-xl font-bold uppercase tracking-tight">Pick a date</h2>
                  <p className="mb-4 text-sm text-night/60">Choose any open day. Closed days will show no time slots.</p>
                  <div className="mb-5 grid grid-cols-4 gap-2 sm:flex sm:flex-wrap">
                    {dayChips().map((d) => (
                      <motion.button
                        key={d.iso}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDate(d.iso)}
                        aria-pressed={date === d.iso}
                        className={`flex flex-col items-center rounded-xl border-2 px-2 py-2 transition-colors sm:w-16 ${date === d.iso ? 'border-accent bg-accent/10 text-accent-dark shadow-sm' : 'border-night/10 hover:border-accent/40 hover:bg-cream'}`}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-night/50">{d.label}</span>
                        <span className="font-display text-lg font-bold leading-tight">{d.day}</span>
                        <span className="text-[10px] uppercase text-night/50">{d.month}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="max-w-xs"><Field label="Or choose another date"><input type="date" min={today()} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field></div>
                </div>
              )}

              {step === 2 && (slots === null ? <Spinner label="Checking availability…" /> : slots.length === 0 ? <Empty title="No times on this date" hint="We may be closed or fully booked. Go back and pick another date." action={<Button variant="secondary" icon={ArrowLeft} onClick={() => go(1)}>Pick another date</Button>} /> : (
                <div>
                  <h2 className="mb-1 font-display text-xl font-bold uppercase tracking-tight">Choose a time</h2>
                  <p className="mb-4 text-sm text-night/60">All times are in local time. Unavailable slots are crossed out.</p>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                    {slots.map((s) => {
                      const t = s.time.slice(0, 5)
                      const active = time === t
                      return (
                        <motion.button
                          key={t}
                          type="button"
                          disabled={!s.available}
                          whileHover={s.available ? { y: -2 } : undefined}
                          whileTap={s.available ? { scale: 0.95 } : undefined}
                          onClick={() => setTime(t)}
                          aria-pressed={active}
                          title={s.available ? 'Available' : 'Already booked'}
                          className={`rounded-xl border-2 py-3 text-sm font-semibold transition-colors duration-200 ${active ? 'border-accent bg-accent text-night shadow-md shadow-accent/25' : s.available ? 'border-night/10 hover:border-accent/50 hover:bg-cream' : 'cursor-not-allowed border-night/5 bg-night/5 text-night/25 line-through'}`}
                        >
                          {fmtTime(t)}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}

              {step === 3 && (
                <div>
                  <h2 className="mb-1 font-display text-xl font-bold uppercase tracking-tight">Your details</h2>
                  <p className="mb-4 text-sm text-night/60">We will use these to contact you about your appointment.</p>
                  <div className="grid max-w-xl gap-4">
                    <Field label="Full name">
                      <div className="group relative">
                        <UserRound size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-night/40 transition-colors group-focus-within:text-accent-dark" />
                        <input className={`${inputCls} pl-9`} value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder="Enter full name" autoComplete="name" />
                      </div>
                    </Field>
                    <Field label="Phone number">
                      <div className="group relative">
                        <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-night/40 transition-colors group-focus-within:text-accent-dark" />
                        <input className={`${inputCls} pl-9`} value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} placeholder="09XX XXX XXXX" autoComplete="tel" />
                      </div>
                    </Field>
                    <Field label="Notes (optional)">
                      <div className="group relative">
                        <StickyNote size={16} className="pointer-events-none absolute left-3 top-3 text-night/40 transition-colors group-focus-within:text-accent-dark" />
                        <textarea rows={3} className={`${inputCls} pl-9`} value={info.notes} onChange={(e) => setInfo({ ...info, notes: e.target.value })} placeholder="Enter notes for the appointment (optional)" />
                      </div>
                    </Field>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-bold uppercase tracking-tight">Review your booking</h2>
                    <span className="rounded-full bg-cream px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-night/45">Almost done</span>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-2xl border border-night/15">
                      <div className="flex items-center gap-3 bg-night px-5 py-4 text-white">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-night"><CalendarDays size={20} /></span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{service.name}</p>
                          <p className="text-xs text-white/70">{fmtDate(date)} · {fmtTime(time)}</p>
                        </div>
                        <span className="ml-auto shrink-0 font-display text-lg font-bold text-accent">{peso(service.price)}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-night/10 px-5 py-2.5 text-sm">
                        <span className="text-night/50">Duration</span>
                        <span className="font-medium">{service.duration} min</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-night/10 px-5 py-2.5 text-sm">
                        <span className="text-night/50">Status</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Pending confirmation</span>
                      </div>
                      <button type="button" onClick={() => go(1)} className="flex w-full items-center justify-between border-t border-night/10 px-5 py-2.5 text-xs font-semibold text-night/50 transition-colors hover:bg-cream hover:text-accent-dark">
                        Change date or time <ArrowRight size={13} />
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-night/15">
                      <div className="flex items-center justify-between gap-2 border-b border-night/10 bg-cream/60 px-4 py-2.5">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-night/50">Contact details</p>
                        <button type="button" onClick={() => go(3)} className="text-xs font-semibold text-accent-dark hover:underline">Edit</button>
                      </div>
                      <dl className="divide-y divide-night/10 text-sm">
                        {[['Name', info.name], ['Phone', info.phone], ['Notes', info.notes || '—']].map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-6 px-5 py-3"><dt className="text-night/50">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
                        ))}
                      </dl>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-night/45">You can go back and change anything before confirming.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-night/10 bg-cream/50 px-5 py-4 sm:px-6">
          <Button variant="secondary" icon={ArrowLeft} disabled={step === 0} onClick={() => go(step - 1)}>Back</Button>
          <span className="hidden text-xs font-medium text-night/50 sm:block">Step {step + 1} of {STEPS.length}</span>
          {step < 4
            ? <Button icon={ArrowRight} disabled={!canNext} onClick={() => go(step + 1)}>Continue</Button>
            : <Button loading={busy} icon={Check} onClick={confirm}>Confirm appointment</Button>}
        </div>
      </Card>
    </div>
  )
}
