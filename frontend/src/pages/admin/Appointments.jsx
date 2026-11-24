import { useCallback, useEffect, useState } from 'react'
import { Eye, Check, X, Ban, CircleCheck } from 'lucide-react'
import api, { errMsg, fmtDate, fmtTime } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card, Confirm, Empty, inputCls, PageHeader, SearchBox, Spinner, Table, Td } from '../../components/ui'
import AppointmentModal from '../../components/AppointmentModal'

const ACTIONS = {
  pending: [['approved', 'Approve', Check, 'secondary'], ['rejected', 'Reject', X, 'secondary'], ['cancelled', 'Cancel', Ban, 'ghost']],
  approved: [['completed', 'Mark as Completed', CircleCheck, 'secondary'], ['cancelled', 'Cancel', Ban, 'ghost']],
}

export default function Appointments() {
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [view, setView] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api.get('/appointments', { params: { search: q || undefined, status: status || undefined, date: date || undefined } })
      .then((r) => setRows(r.data.data ?? r.data)).catch((e) => { setRows([]); toast.error(errMsg(e)) })
  }, [q, status, date, toast])

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])

  const change = async (a, next) => {
    setBusy(true)
    try { await api.patch(`/appointments/${a.id}/status`, { status: next }); toast.success(`Booking ${a.reference} ${next}.`); setConfirm(null); load() }
    catch (e) { toast.error(errMsg(e)) } finally { setBusy(false) }
  }
  const run = (a, [next, label]) => setConfirm({ a, next, label })

  return (
    <>
      <PageHeader title="Appointments" subtitle="Review and manage every booking." />
      <Card>
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-3">
          <SearchBox value={q} onChange={setQ} placeholder="Search by ID, customer or service" />
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {['pending', 'approved', 'rejected', 'completed', 'cancelled'].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by date" />
        </div>
        {rows === null ? <Spinner /> : rows.length === 0 ? <Empty title="No appointments found" hint="Try changing your search or filters." /> : (
          <Table head={['Booking ID', 'Customer Name', 'Service', 'Appointment Date', 'Time', 'Status', 'Actions']}>
            {rows.map((a) => (
              <tr key={a.id} className="transition-colors duration-150 hover:bg-cream/70">
                <Td className="font-medium">{a.reference}</Td>
                <Td>{a.user?.name}</Td><Td>{a.service?.name}</Td>
                <Td>{fmtDate(a.appointment_date)}</Td><Td>{fmtTime(a.appointment_time)}</Td>
                <Td><Badge status={a.status} /></Td>
                <Td>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" icon={Eye} onClick={() => setView(a)} aria-label="View details" title="View details" />
                    {(ACTIONS[a.status] || []).map((act) => (
                      <Button key={act[0]} size="sm" variant={act[3]} icon={act[2]} onClick={() => run(a, act)} title={act[1]}>{act[1] === 'Mark as Completed' ? 'Complete' : act[1]}</Button>
                    ))}
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <AppointmentModal appt={view} onClose={() => setView(null)} />
      <Confirm open={!!confirm} onClose={() => setConfirm(null)} loading={busy} label={confirm?.label}
        title={`${confirm?.label} booking?`} message={`Booking ${confirm?.a.reference} for ${confirm?.a.user?.name} will be marked ${confirm?.next}.`}
        onConfirm={() => change(confirm.a, confirm.next)} />
    </>
  )
}
