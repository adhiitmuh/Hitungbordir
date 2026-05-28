import { create } from 'zustand'

const SESSION_KEY = 'hb_session'

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : { role: null, operatorId: null, nama: null }
  } catch {
    return { role: null, operatorId: null, nama: null }
  }
}

function saveSession(data) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

const useAuthStore = create((set) => ({
  ...loadSession(),

  loginAdmin: (passwordInput, adminPassword) => {
    if (passwordInput === adminPassword) {
      const session = { role: 'admin', operatorId: null, nama: 'Admin' }
      saveSession(session)
      set(session)
      return true
    }
    return false
  },

  loginStaff: (operatorId, nama) => {
    const session = { role: 'staff', operatorId, nama }
    saveSession(session)
    set(session)
  },

  logout: () => {
    clearSession()
    set({ role: null, operatorId: null, nama: null })
  },
}))

export default useAuthStore
