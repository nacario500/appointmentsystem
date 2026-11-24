import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import { Spinner } from './components/ui'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import Appointments from './pages/admin/Appointments'
import Services from './pages/admin/Services'
import Customers from './pages/admin/Customers'
import Schedule from './pages/admin/Schedule'
import Reports from './pages/admin/Reports'
import AccountSettings from './pages/AccountSettings'
import CustomerDashboard from './pages/customer/Dashboard'
import Book from './pages/customer/Book'

function Guard({ role, children }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (role === 'admin' && user.role !== 'admin') return <Navigate to="/app" replace />
  if (role === 'customer' && user.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/admin" element={<Guard role="admin"><Layout role="admin" /></Guard>}>
        <Route index element={<AdminDashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="services" element={<Services />} />
        <Route path="customers" element={<Customers />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      <Route path="/app" element={<Guard role="customer"><Layout role="customer" /></Guard>}>
        <Route index element={<CustomerDashboard />} />
        <Route path="book" element={<Book />} />
        <Route path="settings" element={<AccountSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
