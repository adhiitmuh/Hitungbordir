import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

// adminOnly = true  → hanya admin
// adminOnly = false → admin + staff
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { role } = useAuthStore()

  if (!role) return <Navigate to="/login" replace />
  if (adminOnly && role !== 'admin') return <Navigate to="/input" replace />

  return children
}
