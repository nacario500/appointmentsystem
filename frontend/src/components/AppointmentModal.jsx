import { Modal, Badge } from './ui'
import { fmtDate, fmtTime, peso } from '../lib/api'

const Row = ({ k, v }) => (
  <div className="flex justify-between gap-4 border-b border-line py-2.5 text-sm last:border-0">
    <span className="text-muted">{k}</span><span className="text-right font-medium">{v || '—'}</span>
  </div>
)

export default function AppointmentModal({ appt, onClose }) {
  if (!appt) return null
  return (
    <Modal open onClose={onClose} title={`Booking ${appt.reference}`}>
      <Row k="Status" v={<Badge status={appt.status} />} />
      <Row k="Customer" v={appt.user?.name} />
      <Row k="Email" v={appt.user?.email} />
      <Row k="Phone" v={appt.phone || appt.user?.phone} />
      <Row k="Service" v={appt.service?.name} />
      <Row k="Duration" v={appt.service ? `${appt.service.duration} min` : null} />
      <Row k="Price" v={appt.service ? peso(appt.service.price) : null} />
      <Row k="Date" v={fmtDate(appt.appointment_date)} />
      <Row k="Time" v={fmtTime(appt.appointment_time)} />
      <Row k="Notes" v={appt.notes} />
    </Modal>
  )
}
