import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { errMsg } from '../lib/api'
import { PasswordStrength } from '../components/ui'
import { AuthShell, AuthInput, AuthLabel, AuthSubmit } from './Login'

export default function Register() {
  const { user, register } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', password_confirmation: '' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  if (user) return <Navigate to="/app" replace />

  const submit = async (e) => {
    e.preventDefault()
    if (f.password !== f.password_confirmation) return toast.error('Passwords do not match.')
    setBusy(true)
    try { await register(f); toast.success('Account created.'); nav('/app') }
    catch (err) { toast.error(errMsg(err)) } finally { setBusy(false) }
  }

  const eye = (shown, setShown) => (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShown((v) => !v) }}
      aria-label={shown ? 'Hide password' : 'Show password'}
      aria-pressed={shown}
      tabIndex={-1}
      className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1.5 text-night/40 transition-colors hover:bg-cream hover:text-night focus:outline-none"
    >
      {shown ? <Eye size={18} /> : <EyeOff size={18} />}
    </button>
  )

  return (
    <AuthShell
      nav="register"
      title="Create your account"
      subtitle="Book and track appointments in one place."
      footer={<>Already registered? <Link to="/login" className="font-semibold text-accent-dark hover:underline">Log in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthLabel label="Full name"><AuthInput icon={User} required value={f.name} onChange={set('name')} placeholder="Enter full name" autoComplete="name" /></AuthLabel>
        <AuthLabel label="Email"><AuthInput icon={Mail} type="email" required value={f.email} onChange={set('email')} placeholder="Enter email" autoComplete="email" /></AuthLabel>
        <AuthLabel label="Phone number"><AuthInput icon={Phone} required value={f.phone} onChange={set('phone')} placeholder="09XX XXX XXXX" autoComplete="tel" /></AuthLabel>
        <AuthLabel label="Password (min. 8 characters)">
          <AuthInput icon={Lock} type={showPw ? 'text' : 'password'} required minLength={8} value={f.password} onChange={set('password')} placeholder="Enter password" autoComplete="new-password" right={eye(showPw, setShowPw)} />
          <PasswordStrength value={f.password} />
        </AuthLabel>
        <AuthLabel label="Confirm password">
          <AuthInput icon={Lock} type={showConfirm ? 'text' : 'password'} required value={f.password_confirmation} onChange={set('password_confirmation')} placeholder="Re-enter password" autoComplete="new-password" right={eye(showConfirm, setShowConfirm)} />
          {f.password_confirmation && (
            <p className={`mt-1.5 text-xs font-medium ${f.password === f.password_confirmation ? 'text-accent-dark' : 'text-danger'}`}>
              {f.password === f.password_confirmation ? 'Passwords match.' : 'Passwords do not match yet.'}
            </p>
          )}
        </AuthLabel>
        <AuthSubmit busy={busy}>Create account</AuthSubmit>
      </form>
    </AuthShell>
  )
}
