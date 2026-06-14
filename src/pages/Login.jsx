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

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-harmoni-green-dark to-harmoni-green flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img src={logoBeige} alt="harmoni" style={{ width: '130px', display: 'block', margin: '0 auto 4px' }} />
            <div className="text-harmoni-green-tint text-sm mt-1 opacity-80 tracking-widest uppercase">Bordir</div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-4xl mb-3">🚫</div>
            <div className="font-bold text-gray-800 mb-2">Tidak Ada Akses</div>
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
    <div className="min-h-screen bg-gradient-to-br from-harmoni-green-dark to-harmoni-green flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logoBeige} alt="harmoni" style={{ width: '130px', display: 'block', margin: '0 auto 4px' }} />
          <div className="text-harmoni-green-tint text-sm mt-1 opacity-80 tracking-widest uppercase">Bordir</div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <p className="text-sm text-gray-500 mb-5 text-center">
            Masuk dengan akun portal Harmoni kamu
          </p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2.5 mb-4">
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
                  placeholder="Password portal kamu"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-60"
            >
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href={PORTAL_URL} className="text-xs text-gray-400 hover:text-gray-600">
              Buka Portal Harmoni →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
