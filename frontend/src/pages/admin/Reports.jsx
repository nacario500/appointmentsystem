import { useCallback, useEffect, useState } from 'react'
import { Download, Printer } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts'
import api, { downloadCSV, errMsg } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { Button, Card, Empty, Field, inputCls, PageHeader, Spinner, Table, Td } from '../../components/ui'

const COLORS = { pending: '#D97706', approved: '#F25C19', rejected: '#DC2626', completed: '#111111', cancelled: '#A8A29E' }
const ago = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }

export default function Reports() {
  const toast = useToast()
  const [period, setPeriod] = useState('daily')
  const [from, setFrom] = useState(ago(30))
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10))
  const [d, setD] = useState(null)

  const load = useCallback(() => {
    setD(null)
    api.get('/reports', { params: { period, from, to } }).then((r) => setD(r.data)).catch((e) => { setD({ rows: [], status_summary: [], top_services: [] }); toast.error(errMsg(e)) })
  }, [period, from, to, toast])
  useEffect(() => { load() }, [load])

  const exportCsv = () => {
    if (!d) return
    const rows = [
      ...d.rows.map((r) => ({ section: `${period} appointments`, label: r.label, total: r.total })),
      ...d.status_summary.map((r) => ({ section: 'status summary', label: r.status, total: r.total })),
      ...d.top_services.map((r) => ({ section: 'most requested services', label: r.name, total: r.total })),
    ]
    if (!rows.length) return toast.error('Nothing to export for this range.')
    downloadCSV(`appointments-report-${from}-to-${to}.csv`, rows)
  }

  return (
    <>
      <PageHeader title="Reports" subtitle="Appointment activity for the selected dates.">
        <Button variant="secondary" icon={Download} onClick={exportCsv}>Export CSV</Button>
        <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
      </PageHeader>
      <Card className="no-print mb-6 grid gap-3 p-4 sm:grid-cols-3">
        <Field label="Report"><select className={inputCls} value={period} onChange={(e) => setPeriod(e.target.value)}><option value="daily">Daily appointments</option><option value="weekly">Weekly appointments</option><option value="monthly">Monthly appointments</option></select></Field>
        <Field label="From"><input type="date" className={inputCls} value={from} max={to} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="To"><input type="date" className={inputCls} value={to} min={from} onChange={(e) => setTo(e.target.value)} /></Field>
      </Card>
      {!d ? <Spinner /> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-5 lg:col-span-2">
            <h2 className="mb-4 font-semibold capitalize">{period} appointments</h2>
            {d.rows.length === 0 ? <Empty title="No appointments in this range" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={d.rows}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#11111114" /><XAxis dataKey="label" tick={{ fontSize: 12, fill: '#7A7468' }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#7A7468' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(17,17,17,0.12)', fontSize: 12 }} /><Bar dataKey="total" fill="#F25C19" radius={[6, 6, 0, 0]} animationDuration={900} /></BarChart>
              </ResponsiveContainer>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 font-semibold">Appointment status summary</h2>
            {d.status_summary.length === 0 ? <Empty title="No data" /> : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart><Pie data={d.status_summary} dataKey="total" nameKey="status" innerRadius={55} outerRadius={85}>{d.status_summary.map((s) => <Cell key={s.status} fill={COLORS[s.status] || '#94A3B8'} />)}</Pie><Tooltip /><Legend /></PieChart>
              </ResponsiveContainer>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="mb-2 font-semibold">Most requested services</h2>
            {d.top_services.length === 0 ? <Empty title="No data" /> : (
              <Table head={['Service', 'Bookings']}>
                {d.top_services.map((s) => <tr key={s.name}><Td className="font-medium">{s.name}</Td><Td>{s.total}</Td></tr>)}
              </Table>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
