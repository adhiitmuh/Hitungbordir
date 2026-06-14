import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { role, loading } = useAuthStore()

  if (loading) return (
    <div className="min-h-screen bg-harmoni-green flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-harmoni-beige border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!role) return <Navigate to="/login" replace />
  if (adminOnly && role !== 'admin') return <Navigate to="/input" replace />

  return children
}
