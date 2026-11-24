import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      window.location.href = import.meta.env.BASE_URL + 'login'
    }
    return Promise.reject(err)
  }
)

export const errMsg = (e) => {
  const d = e.response?.data
  if (d?.errors) return Object.values(d.errors).flat()[0]
  return d?.message || e.message || 'Something went wrong. Please try again.'
}

export const STATUS = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-accent/15 text-accent-dark',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-night/10 text-night/70',
  cancelled: 'bg-night/5 text-night/45',
}

export const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })
export const fmtDate = (d) => d ? new Date(String(d).slice(0, 10) + 'T00:00:00').toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
export const fmtTime = (t) => {
  if (!t) return '—'
  const [h, m] = t.split(':')
  const hh = +h
  return `${hh % 12 || 12}:${m} ${hh >= 12 ? 'PM' : 'AM'}`
}
export const today = () => new Date().toISOString().slice(0, 10)

export function downloadCSV(filename, rows) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = filename
  a.click()
}

export default api
