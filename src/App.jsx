import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import InputProduksi from './pages/InputProduksi'
import KalkulasiModal from './pages/KalkulasiModal'
import LaporanOperator from './pages/LaporanOperator'
import MasterData from './pages/MasterData'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Semua halaman dalam layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                {/* Admin only */}
                <Route path="/" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
                <Route path="/modal" element={<ProtectedRoute adminOnly><KalkulasiModal /></ProtectedRoute>} />
                <Route path="/laporan" element={<ProtectedRoute adminOnly><LaporanOperator /></ProtectedRoute>} />
                <Route path="/master" element={<ProtectedRoute adminOnly><MasterData /></ProtectedRoute>} />

                {/* Admin + Staff */}
                <Route path="/input" element={<InputProduksi />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/input" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
