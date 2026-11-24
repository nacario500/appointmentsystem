import { useCallback, useEffect, useState } from 'react'
import { Save, Plus, Trash2 } from 'lucide-react'
import api, { errMsg, fmtDate } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { Button, Card, Confirm, Empty, Field, inputCls, PageHeader, Spinner } from '../../components/ui'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const hhmm = (t) => (t || '').slice(0, 5)

export default function Schedule() {
  const toast = useToast()
  const [s, setS] = useState(null)
  const [blocked, setBlocked] = useState([])
  const [nb, setNb] = useState({ date: '', reason: '', type: 'blocked' })
  const [delBlocked, setDelBlocked] = useState(null)
  const [busy2, setBusy2] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([api.get('/schedule'), api.get('/blocked-dates')])
      const d = a.data.data ?? a.data
      setS({ ...d, opening_time: hhmm(d.opening_time), closing_time: hhmm(d.closing_time), operating_days: d.operating_days ?? [] })
      setBlocked(b.data.data ?? b.data)
    } catch (e) { toast.error(errMsg(e)) }
  }, [toast])
  useEffect(() => { load() }, [load])

  if (!s) return <Spinner />
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value })
  const toggle = (i) => setS({ ...s, operating_days: s.operating_days.includes(i) ? s.operating_days.filter((d) => d !== i) : [...s.operating_days, i] })

  const save = async (e) => {
    e.preventDefault()
    if (s.opening_time >= s.closing_time) return toast.error('Closing time must be after opening time.')
    setBusy(true)
    try { await api.put('/schedule', s); toast.success('Schedule saved. Time slots are updated.') }
    catch (err) { toast.error(errMsg(err)) } finally { setBusy(false) }
  }
  const addBlocked = async (e) => {
    e.preventDefault()
    try { await api.post('/blocked-dates', nb); toast.success('Date blocked.'); setNb({ date: '', reason: '', type: 'blocked' }); load() }
    catch (err) { toast.error(errMsg(err)) }
  }
  const removeBlocked = async () => {
    if (!delBlocked) return
    setBusy2(true)
    try { await api.delete(`/blocked-dates/${delBlocked.id}`); toast.success('Date unblocked.'); setDelBlocked(null); load() }
    catch (err) { toast.error(errMsg(err)) } finally { setBusy2(false) }
  }

  return (
    <>
      <PageHeader title="Schedule Management" subtitle="Set when customers can book. Available time slots are generated from these settings." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Business hours</h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Operating days</p>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((d, i) => (
                  <button type="button" key={d} onClick={() => toggle(i)} aria-pressed={s.operating_days.includes(i)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${s.operating_days.includes(i) ? 'border-accent bg-accent/10 text-accent-dark shadow-sm' : 'border-night/15 text-night/50 hover:border-accent/30 hover:bg-cream'}`}>{d.slice(0, 3)}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Opening time"><input type="time" required className={inputCls} value={s.opening_time} onChange={set('opening_time')} /></Field>
              <Field label="Closing time"><input type="time" required className={inputCls} value={s.closing_time} onChange={set('closing_time')} /></Field>
              <Field label="Appointment duration (min)"><input type="number" min={5} step={5} required className={inputCls} value={s.slot_duration} onChange={set('slot_duration')} placeholder="30" /></Field>
              <Field label="Max appointments per slot"><input type="number" min={1} required className={inputCls} value={s.max_per_slot} onChange={set('max_per_slot')} placeholder="1" /></Field>
            </div>
            <Button type="submit" icon={Save} loading={busy}>Save schedule</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Blocked dates and holidays</h2>
          <form onSubmit={addBlocked} className="grid gap-3 sm:grid-cols-2">
            <Field label="Date"><input type="date" required className={inputCls} value={nb.date} onChange={(e) => setNb({ ...nb, date: e.target.value })} /></Field>
            <Field label="Type"><select className={inputCls} value={nb.type} onChange={(e) => setNb({ ...nb, type: e.target.value })}><option value="blocked">Blocked date</option><option value="holiday">Holiday</option></select></Field>
            <div className="sm:col-span-2"><Field label="Reason"><input className={inputCls} value={nb.reason} onChange={(e) => setNb({ ...nb, reason: e.target.value })} placeholder="e.g. Staff training" /></Field></div>
            <div><Button type="submit" icon={Plus}>Add date</Button></div>
          </form>
          <div className="mt-5">
            {blocked.length === 0 ? <Empty title="No blocked dates" hint="Add holidays or days you are closed." /> : (
              <ul className="divide-y divide-line">
                {blocked.map((b) => (
                  <li key={b.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div><p className="font-medium">{fmtDate(b.date)} <span className="ml-1 text-xs capitalize text-muted">{b.type}</span></p>{b.reason && <p className="text-xs text-muted">{b.reason}</p>}</div>
                    <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDelBlocked(b)} aria-label="Remove" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
          <Confirm open={!!delBlocked} onClose={() => setDelBlocked(null)} loading={busy2} onConfirm={removeBlocked} label="Unblock date" title="Unblock this date?" message={`"${delBlocked?.date}" will become available for bookings again.`} />
</>
  )
}
