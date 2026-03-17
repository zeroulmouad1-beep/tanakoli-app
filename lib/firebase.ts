import { initializeApp, getApps } from "firebase/app"
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, CACHE_SIZE_UNLIMITED } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: 'AIzaSyCz62DFbbD89fpYUXdg38nRCohX-yTJ4z8',
  authDomain: 'tanakoli-khenchela.firebaseapp.com',
  projectId: 'tanakoli-khenchela',
  storageBucket: 'tanakoli-khenchela.firebasestorage.app',
  messagingSenderId: '757217321198',
  appId: '1:757217321198:web:1cbdfd808a180b6ff9d3ff'
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
})

export const auth = getAuth(app)
