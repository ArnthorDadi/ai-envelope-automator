import { FirebaseApp } from 'firebase/app'
import {
  Auth,
  onAuthStateChanged,
  signInAnonymously,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import type { UserData } from '@/types'

export interface SignInOptions {
  name: string
}

export interface AuthService {
  onAuthChange(callback: (user: UserData | null) => void): () => void
  signIn(options: SignInOptions): Promise<UserData>
  signOut(): Promise<void>
  getStoredUser(): UserData | null
  setStoredUser(user: UserData | null): void
}

const STORAGE_KEY = 'secret-hitler-user'

export class AuthServiceImpl implements AuthService {
  constructor(
    private app: FirebaseApp,
    private auth: Auth
  ) {}

  onAuthChange(callback: (user: UserData | null) => void): () => void {
    const unsubscribe = onAuthStateChanged(this.auth, (firebaseUser) => {
      if (firebaseUser) {
        const stored = this.getStoredUser()
        if (stored) {
          const updatedUser = { ...stored, uid: firebaseUser.uid }
          this.setStoredUser(updatedUser)
          callback(updatedUser)
        } else {
          const userData: UserData = {
            uid: firebaseUser.uid,
            name: 'Anonymous',
            createdAt: new Date(),
          }
          this.setStoredUser(userData)
          callback(userData)
        }
      } else {
        this.setStoredUser(null)
        callback(null)
      }
    })

    return unsubscribe
  }

  async signIn(options: SignInOptions): Promise<UserData> {
    const result = await signInAnonymously(this.auth)
    const userData: UserData = {
      uid: result.user.uid,
      name: options.name,
      createdAt: new Date(),
    }
    this.setStoredUser(userData)
    return userData
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth)
    this.setStoredUser(null)
  }

  getStoredUser(): UserData | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as UserData
      } catch {
        return null
      }
    }
    return null
  }

  setStoredUser(user: UserData | null): void {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}
