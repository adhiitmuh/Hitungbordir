import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/storage'

const firebaseConfig = {
  apiKey:            'AIzaSyA9V5Lw40pDeAWeQKijYCkdvnag8AlEe74',
  authDomain:        'harmoni-indonesia.firebaseapp.com',
  projectId:         'harmoni-indonesia',
  storageBucket:     'harmoni-indonesia.firebasestorage.app',
  messagingSenderId: '825719884876',
  appId:             '1:825719884876:web:a8fd78d382e0f98cf6b8e9',
}

const app = firebase.apps.find(a => a.name === 'harmoni-auth') || firebase.initializeApp(firebaseConfig, 'harmoni-auth')

export const auth    = app.auth()
export const db      = app.firestore()
export const storage = app.storage()
