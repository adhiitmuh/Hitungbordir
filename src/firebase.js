import { initializeApp, getApp } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey:            'AIzaSyA9V5Lw40pDeAWeQKijYCkdvnag8AlEe74',
  authDomain:        'harmoni-indonesia.firebaseapp.com',
  projectId:         'harmoni-indonesia',
  storageBucket:     'harmoni-indonesia.firebasestorage.app',
  messagingSenderId: '825719884876',
  appId:             '1:825719884876:web:a8fd78d382e0f98cf6b8e9',
}

let app
try { app = getApp('harmoni-auth') }
catch { app = initializeApp(firebaseConfig, 'harmoni-auth') }

export const auth    = getAuth(app)
export const db      = getFirestore(app)
export const storage = getStorage(app)

// Paksa pakai localStorage agar sinkron dengan compat SDK yang dipakai portal
setPersistence(auth, browserLocalPersistence).catch(() => {})
