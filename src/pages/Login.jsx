import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useAppStore from '../store/appStore'

export default function Login() {
  const { operator, settings } = useAppStore()
  const { loginAdmin, loginStaff } = useAuthStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState('staff') // 'staff' | 'admin'
  const [operatorId, setOperatorId] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  function handleStaffLogin(e) {
    e.preventDefault()
    if (!operatorId) { setError('Pilih nama kamu terlebih dahulu.'); return }
    const op = operator.find((o) => o.id === operatorId)
    loginStaff(operatorId, op?.nama ?? 'Staff')
    navigate('/input')
  }

  function handleAdminLogin(e) {
    e.preventDefault()
    const ok = loginAdmin(password, settings.adminPassword ?? 'admin123')
    if (ok) {
      navigate('/')
    } else {
      setError('Password salah.')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-white">Harmoni Bordir</div>
          <div className="text-blue-200 text-sm mt-1">Kalkulator Produksi Bordir</div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab */}
          <div className="flex border-b border-gray-100">
            <button
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${tab === 'staff' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => { setTab('staff'); setError('') }}
            >
              <User size={14} className="inline mr-1.5" />
              Masuk sebagai Staff
            </button>
            <button
              className={`flex-1 py-3.5 text-sm font-medium transition-colors ${tab === 'admin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => { setTab('admin'); setError('') }}
            >
              <Lock size={14} className="inline mr-1.5" />
              Masuk sebagai Admin
            </button>
          </div>

          <div className="p-6">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2.5 mb-4">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {tab === 'staff' ? (
              <form onSubmit={handleStaffLogin} className="space-y-4">
                <div>
                  <label className="label">Nama Kamu</label>
                  {operator.length === 0 ? (
                    <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2.5">
                      Belum ada operator. Minta Admin untuk menambahkan nama kamu di Master Data.
                    </p>
                  ) : (
                    <select
                      className="input"
                      value={operatorId}
                      onChange={(e) => { setOperatorId(e.target.value); setError('') }}
                    >
                      <option value="">— pilih nama —</option>
                      {operator.map((o) => (
                        <option key={o.id} value={o.id}>{o.nama}</option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={operator.length === 0}
                >
                  Masuk
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="label">Password Admin</label>
                  <div className="relative">
                    <input
                      className="input pr-10"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError('') }}
                      placeholder="Masukkan password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Default: admin123 (ganti di Master Data)</p>
                </div>
                <button type="submit" className="btn-primary w-full">
                  Masuk sebagai Admin
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
