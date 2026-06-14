import { create } from 'zustand'
import { auth, db } from '../firebase'

const useAuthStore = create((set) => ({
  role:       null,
  operatorId: null,
  nama:       null,
  loading:    true,
  authError:  null,

  init: () => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        set((state) => ({ role: null, operatorId: null, nama: null, loading: false, authError: state.authError }))
        return
      }
      try {
        const snap = await db.collection('users').doc(user.uid).get()
        const data = snap.data()
        const isOwner = data?.role === 'owner'
        if (!snap.exists || !data?.aktif || (!isOwner && !data?.apps?.hitungbordir?.akses)) {
          await auth.signOut()
          set({ role: null, operatorId: null, nama: null, loading: false, authError: 'Akun tidak memiliki akses ke Harmoni Bordir.' })
          return
        }
        const isAdmin = isOwner || data.role === 'admin'
        set({
          role:       isAdmin ? 'admin' : 'staff',
          operatorId: user.uid,
          nama:       data.nama,
          loading:    false,
          authError:  null,
        })
      } catch {
        set({ role: null, operatorId: null, nama: null, loading: false, authError: 'Gagal memverifikasi akun.' })
      }
    })
    return unsub
  },

  login: (email, password) => auth.signInWithEmailAndPassword(email, password),

  logout: () => auth.signOut(),
}))

export default useAuthStore
