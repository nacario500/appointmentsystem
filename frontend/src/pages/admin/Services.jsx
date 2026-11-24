import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api, { errMsg, peso } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { Button, Card, Confirm, Empty, Field, inputCls, Modal, PageHeader, SearchBox, Spinner, Table, Td } from '../../components/ui'

const BLANK = { name: '', description: '', duration: 30, price: 0, image_url: '', status: 'active' }

export default function Services() {
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  const [form, setForm] = useState(null)
  const [del, setDel] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    api.get('/services', { params: { search: q || undefined } }).then((r) => setRows(r.data.data ?? r.data)).catch((e) => { setRows([]); toast.error(errMsg(e)) })
  }, [q, toast])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])

  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    try {
      form.id ? await api.put(`/services/${form.id}`, form) : await api.post('/services', form)
      toast.success(form.id ? 'Service updated.' : 'Service added.'); setForm(null); load()
    } catch (err) { toast.error(errMsg(err)) } finally { setBusy(false) }
  }
  const remove = async () => {
    setBusy(true)
    try { await api.delete(`/services/${del.id}`); toast.success('Service deleted.'); setDel(null); load() }
    catch (err) { toast.error(errMsg(err)) } finally { setBusy(false) }
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <PageHeader title="Services" subtitle="Manage what customers can book.">
        <Button icon={Plus} onClick={() => setForm(BLANK)}>Add Service</Button>
      </PageHeader>
      <Card>
        <div className="border-b border-line p-4 sm:max-w-sm"><SearchBox value={q} onChange={setQ} placeholder="Search services" /></div>
        {rows === null ? <Spinner /> : rows.length === 0 ? <Empty title="No services found" hint="Add your first service to start taking bookings." /> : (
          <Table head={['Service', 'Description', 'Duration', 'Price', 'Status', 'Actions']}>
            {rows.map((s) => (
              <tr key={s.id} className="transition-colors duration-150 hover:bg-cream/70">
                <Td className="font-medium">{s.name}</Td>
                <Td className="max-w-xs truncate text-muted">{s.description}</Td>
                <Td>{s.duration} min</Td><Td>{peso(s.price)}</Td>
                <Td><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${s.status === 'active' ? 'bg-accent/15 text-accent-dark' : 'bg-night/5 text-night/45'}`}>{s.status}</span></Td>
                <Td><div className="flex gap-1.5">
                  <Button size="sm" variant="secondary" icon={Pencil} onClick={() => setForm(s)}>Edit</Button>
                  <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setDel(s)} aria-label="Delete" title="Delete" />
                </div></Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? 'Edit service' : 'Add service'}>
        {form && (
          <form onSubmit={save} className="space-y-4">
            <Field label="Service name"><input required className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. General Consultation" /></Field>
            <Field label="Description"><textarea rows={3} className={inputCls} value={form.description ?? ''} onChange={set('description')} placeholder="Enter a short description" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Duration (minutes)"><input type="number" min={5} step={5} required className={inputCls} value={form.duration} onChange={set('duration')} placeholder="30" /></Field>
              <Field label="Price (₱)"><input type="number" min={0} step="0.01" required className={inputCls} value={form.price} onChange={set('price')} placeholder="0.00" /></Field>
            </div>
            <Field label="Image URL (optional)"><input type="url" className={inputCls} value={form.image_url ?? ''} onChange={set('image_url')} placeholder="https://…" /></Field>
            <Field label="Status"><select className={inputCls} value={form.status} onChange={set('status')}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
            <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="secondary" onClick={() => setForm(null)}>Cancel</Button><Button type="submit" loading={busy}>Save service</Button></div>
          </form>
        )}
      </Modal>
      <Confirm open={!!del} onClose={() => setDel(null)} loading={busy} onConfirm={remove} label="Delete service" title="Delete service?" message={`"${del?.name}" will be removed. Services with existing bookings may be blocked from deletion.`} />
    </>
  )
}
