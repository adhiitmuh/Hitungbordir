import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import useAuthStore from '../store/authStore'
import logoBeige from '../assets/logo-beige.png'

const PORTAL_URL = 'https://adhiitmuh.github.io/harmoni-indonesia/'

export default function Login() {
  const { login, authError } = useAuthStore()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      navigate('/')
    } catch (err) {
      const code = err?.code ?? ''
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Email atau password salah.')
      } else if (code === 'auth/too-many-requests') {
        setError('Terlalu banyak percobaan. Coba lagi nanti.')
      } else {
        setError('Gagal masuk. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  const bgStyle = { background: 'linear-gradient(135deg, #022E2D 0%, #034543 60%, #0A5F5C 100%)' }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src={logoBeige} alt="harmoni" style={{ width: '130px', display: 'block', margin: '0 auto 6px' }} />
            <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,251,213,0.5)' }}>
              Bordir
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-red-50">
              <AlertCircle size={26} className="text-red-500" />
            </div>
            <div className="font-bold text-lg mb-2" style={{ color: '#282828' }}>Tidak Ada Akses</div>
            <p className="text-sm text-gray-500 mb-6">{authError}</p>
            <a href={PORTAL_URL} className="btn-primary w-full block text-center">
              Kembali ke Portal →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logoBeige} alt="harmoni" style={{ width: '130px', display: 'block', margin: '0 auto 6px' }} />
          <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,251,213,0.5)' }}>
            Bordir
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-7">
          <h2 className="font-bold text-lg mb-0.5" style={{ color: '#282828' }}>Masuk</h2>
          <p className="text-sm text-gray-400 mb-5">Gunakan akun portal Harmoni kamu</p>

          {error && (
            <div className="flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 mb-4"
              style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-9"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@harmoni.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-9 pr-10"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <a href={PORTAL_URL} className="text-xs font-medium hover:underline" style={{ color: '#034543', opacity: 0.6 }}>
              Buka Portal Harmoni →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
