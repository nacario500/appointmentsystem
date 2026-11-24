import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CalendarPlus, Eye, Ban, Copy, Check } from 'lucide-react'
import api, { errMsg, fmtDate, fmtTime } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card, Confirm, Empty, PageHeader, Spinner, Table, Td } from '../../components/ui'
import AppointmentModal from '../../components/AppointmentModal'
import DashboardOverview from '../../components/DashboardOverview'

const FILTERS = ['all', 'pending', 'approved', 'completed', 'cancelled', 'rejected']

export default function CustomerDashboard() {
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState(null)
  const [cancel, setCancel] = useState(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(null)

  const load = useCallback(() => {
    api.get('/appointments')
      .then((r) => setRows(r.data.data ?? r.data))
      .catch((e) => { setRows([]); toast.error(errMsg(e)) })
  }, [toast])

  useEffect(() => { load() }, [load])

  const counts = useMemo(() => (rows || []).reduce((acc, r) => {
    acc.all += 1
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, { all: 0 }), [rows])

  const filtered = useMemo(() => {
    if (!rows) return []
    return filter === 'all' ? rows : rows.filter((r) => r.status === filter)
  }, [rows, filter])

  const doCancel = async () => {
    setBusy(true)
    try {
      await api.patch(`/appointments/${cancel.id}/status`, { status: 'cancelled' })
      toast.success(`Booking ${cancel.reference} cancelled.`)
      setCancel(null)
      load()
    } catch (e) {
      toast.error(errMsg(e))
    } finally {
      setBusy(false)
    }
  }

  const copyRef = async (reference) => {
    try {
      await navigator.clipboard.writeText(reference)
      setCopied(reference)
      toast.success('Booking reference copied.')
      setTimeout(() => setCopied(null), 1800)
    } catch {
      toast.error('Could not copy the reference.')
    }
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Track your bookings.">
        <Link to="/app/book"><Button icon={CalendarPlus}>Book Appointment</Button></Link>
      </PageHeader>

      <DashboardOverview />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-night/10 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-tight">My appointments</h2>
                <p className="mt-0.5 text-xs text-night/45">{rows?.length ?? 0} booking{rows?.length === 1 ? '' : 's'} in total</p>
              </div>
              <div className="flex flex-wrap gap-1 rounded-xl bg-cream p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                      filter === f ? 'bg-white text-night shadow-sm' : 'text-night/45 hover:text-night'
                    }`}
                  >
                    {f}
                    <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${filter === f ? 'bg-accent/15 text-accent-dark' : 'bg-night/5 text-night/40'}`}>
                      {counts[f] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {rows === null ? <Spinner /> : filtered.length === 0 ? (
            <Empty
              title={filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
              hint={filter === 'all' ? 'Book your first appointment to see it here.' : 'Try another status filter.'}
              action={filter === 'all'
                ? <Link to="/app/book"><Button icon={CalendarPlus}>Book appointment</Button></Link>
                : <Button variant="secondary" onClick={() => setFilter('all')}>Show all bookings</Button>}
            />
          ) : (
            <Table head={['Booking Reference', 'Service', 'Date', 'Time', 'Status', 'Actions']}>
              <AnimatePresence initial={false}>
                {filtered.map((a, i) => (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, delay: Math.min(i * 0.025, 0.2) }}
                    className="group transition-colors duration-150 hover:bg-cream/70"
                  >
                    <Td>
                      <button
                        type="button"
                        onClick={() => copyRef(a.reference)}
                        title="Copy booking reference"
                        className="group/ref inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-accent-dark"
                      >
                        {a.reference}
                        {copied === a.reference
                          ? <Check size={13} className="text-accent-dark" />
                          : <Copy size={13} className="opacity-0 transition-opacity duration-150 group-hover/ref:opacity-60" />}
                      </button>
                    </Td>
                    <Td>{a.service?.name}</Td>
                    <Td>{fmtDate(a.appointment_date)}</Td>
                    <Td>{fmtTime(a.appointment_time)}</Td>
                    <Td><Badge status={a.status} /></Td>
                    <Td>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="secondary" icon={Eye} onClick={() => setView(a)}>View</Button>
                        {['pending', 'approved'].includes(a.status) && (
                          <Button size="sm" variant="ghost" icon={Ban} className="!text-danger hover:!bg-red-50" onClick={() => setCancel(a)}>Cancel</Button>
                        )}
                      </div>
                    </Td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </Table>
          )}
        </Card>
      </motion.div>

      <AppointmentModal appt={view} onClose={() => setView(null)} />
      <Confirm open={!!cancel} onClose={() => setCancel(null)} loading={busy} onConfirm={doCancel} label="Cancel booking"
        title="Cancel this booking?" message={`Booking ${cancel?.reference} will be cancelled and the time slot released.`} />
    </>
  )
}
