import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import api, { errMsg } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button, Card, Field, inputCls, PageHeader, PasswordInput, PasswordStrength, SuccessNote } from '../components/ui'

const IconField = ({ icon: Icon, ...props }) => (
  <div className="group relative">
    <Icon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-night/35 transition-colors group-focus-within:text-accent-dark" />
    <input {...props} className={`${inputCls} pl-9`} />
  </div>
)

const initials = (name) => (name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function AccountSettings() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [p, setP] = useState({ name: user.name, email: user.email, phone: user.phone || '' })
  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [b1, setB1] = useState(false), [b2, setB2] = useState(false)
  const [ok1, setOk1] = useState('')
  const [ok2, setOk2] = useState('')

  const saveProfile = async (e) => {
    e.preventDefault(); setB1(true)
    try {
      const { data } = await api.put('/profile', p)
      setUser(data.user ?? data)
      setOk1('Profile saved successfully.')
      toast.success('Profile updated.')
    } catch (err) { toast.error(errMsg(err)) } finally { setB1(false) }
  }

  const savePw = async (e) => {
    e.preventDefault()
    if (pw.password.length < 8) return toast.error('New password must be at least 8 characters.')
    if (pw.password !== pw.password_confirmation) return toast.error('New passwords do not match.')
    setB2(true)
    try {
      await api.put('/password', pw)
      setOk2('Password changed successfully. Use your new password next time you log in.')
      toast.success('Password changed.')
      setPw({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) { toast.error(errMsg(err)) } finally { setB2(false) }
  }

  const matches = pw.password_confirmation && pw.password === pw.password_confirmation

  return (
    <>
      <PageHeader title="Settings" subtitle="Update your account details." />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="grid max-w-4xl gap-6 lg:grid-cols-2"
      >
        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 border-b border-night/10 bg-cream/50 px-5 py-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-night font-display text-lg font-bold text-accent ring-1 ring-white/10">{initials(user?.name)}</span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-bold uppercase tracking-tight">{user?.name}</p>
              <p className="text-xs text-night/50">{user?.role === 'admin' ? 'Administrator account' : 'Customer account'}</p>
            </div>
          </div>
          <form onSubmit={saveProfile} className="space-y-4 p-5">
            <Field label="Full name"><IconField icon={UserRound} required value={p.name} onChange={(e) => { setOk1(''); setP({ ...p, name: e.target.value }) }} placeholder="Enter full name" autoComplete="name" /></Field>
            <Field label="Email"><IconField icon={Mail} type="email" required value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} placeholder="Enter email" autoComplete="email" /></Field>
            <Field label="Phone number"><IconField icon={Phone} value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} placeholder="09XX XXX XXXX" autoComplete="tel" /></Field>
            <Button type="submit" loading={b1}>Save profile</Button>
            <SuccessNote>{ok1}</SuccessNote>
          </form>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-night/10 bg-cream/50 px-5 py-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-dark"><ShieldCheck size={20} /></span>
            <div>
              <p className="font-display text-lg font-bold uppercase tracking-tight">Change password</p>
              <p className="text-xs text-night/50">Use at least 8 characters.</p>
            </div>
          </div>
          <form onSubmit={savePw} className="space-y-4 p-5">
            <Field label="Current password"><PasswordInput required value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} placeholder="Enter current password" autoComplete="current-password" /></Field>
            <Field label="New password (min. 8 characters)">
              <PasswordInput required minLength={8} value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} placeholder="Enter new password" autoComplete="new-password" />
              <PasswordStrength value={pw.password} />
            </Field>
            <Field label="Confirm new password">
              <PasswordInput required value={pw.password_confirmation} onChange={(e) => setPw({ ...pw, password_confirmation: e.target.value })} placeholder="Re-enter new password" autoComplete="new-password" />
              {pw.password_confirmation && (
                <p className={`mt-1.5 text-xs font-medium ${matches ? 'text-accent-dark' : 'text-danger'}`}>
                  {matches ? 'Passwords match.' : 'Passwords do not match yet.'}
                </p>
              )}
            </Field>
            <Button type="submit" loading={b2} icon={Lock}>Change password</Button>
            <SuccessNote>{ok2}</SuccessNote>
          </form>
        </Card>
      </motion.div>
    </>
  )
}
