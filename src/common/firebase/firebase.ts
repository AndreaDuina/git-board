import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: 'git-board-b6a6f.firebaseapp.com',
  projectId: 'git-board-b6a6f',
  storageBucket: 'git-board-b6a6f.appspot.com',
  messagingSenderId: '897608444192',
  appId: '1:897608444192:web:7d6f5deee635a75ccacf45'
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
