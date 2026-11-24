import { useCallback, useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import api, { errMsg, fmtDate, fmtTime } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { Badge, Button, Card, Empty, Modal, PageHeader, SearchBox, Spinner, Table, Td } from '../../components/ui'

export default function Customers() {
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const [loadingOne, setLoadingOne] = useState(false)

  const load = useCallback(() => {
    api.get('/customers', { params: { search: q || undefined } }).then((r) => setRows(r.data.data ?? r.data)).catch((e) => { setRows([]); toast.error(errMsg(e)) })
  }, [q, toast])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])

  const open = async (c) => {
    setSel({ ...c, appointments: null }); setLoadingOne(true)
    try { const { data } = await api.get(`/customers/${c.id}`); setSel(data.customer ?? data) }
    catch (e) { toast.error(errMsg(e)); setSel(null) } finally { setLoadingOne(false) }
  }

  return (
    <>
      <PageHeader title="Customers" subtitle="People who have registered to book." />
      <Card>
        <div className="border-b border-line p-4 sm:max-w-sm"><SearchBox value={q} onChange={setQ} placeholder="Search by name, email or phone" /></div>
        {rows === null ? <Spinner /> : rows.length === 0 ? <Empty title="No customers found" /> : (
          <Table head={['Customer Name', 'Email', 'Phone Number', 'Total Appointments', 'Registration Date', 'Actions']}>
            {rows.map((c) => (
              <tr key={c.id} className="transition-colors duration-150 hover:bg-cream/70">
                <Td className="font-medium">{c.name}</Td><Td>{c.email}</Td><Td>{c.phone || '—'}</Td>
                <Td>{c.appointments_count ?? 0}</Td><Td>{fmtDate(c.created_at)}</Td>
                <Td><Button size="sm" variant="secondary" icon={Eye} onClick={() => open(c)}>View</Button></Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.name} wide>
        {sel && (
          <>
            <p className="text-sm text-muted">{sel.email} · {sel.phone || 'No phone'}</p>
            <h3 className="mb-2 mt-5 text-sm font-semibold">Appointment history</h3>
            {loadingOne ? <Spinner /> : !sel.appointments?.length ? <Empty title="No appointments yet" /> : (
              <Table head={['Reference', 'Service', 'Date', 'Time', 'Status']}>
                {sel.appointments.map((a) => (
                  <tr key={a.id}><Td className="font-medium">{a.reference}</Td><Td>{a.service?.name}</Td><Td>{fmtDate(a.appointment_date)}</Td><Td>{fmtTime(a.appointment_time)}</Td><Td><Badge status={a.status} /></Td></tr>
                ))}
              </Table>
            )}
          </>
        )}
      </Modal>
    </>
  )
}
