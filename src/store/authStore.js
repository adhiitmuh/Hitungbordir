import { create } from 'zustand'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const useAuthStore = create((set) => ({
  role:       null,
  operatorId: null,
  nama:       null,
  loading:    true,
  authError:  null,

  init: () => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set((state) => ({ role: null, operatorId: null, nama: null, loading: false, authError: state.authError }))
        return
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        const data = snap.data()
        const isOwner = data?.role === 'owner'
        if (!snap.exists() || !data?.aktif || (!isOwner && !data?.apps?.hitungbordir?.akses)) {
          await signOut(auth)
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

  login: (email, password) => signInWithEmailAndPassword(auth, email, password),

  logout: () => signOut(auth),
}))

export default useAuthStore
