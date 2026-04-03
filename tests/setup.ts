import { vi } from 'vitest'

const mockUser = {
  uid: 'test-uid-123',
}

const mockAuth = {
  currentUser: null,
  onAuthStateChanged: vi.fn((callback) => {
    callback(null)
    return () => {}
  }),
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
}

const mockDoc = vi.fn()
const mockGetDoc = vi.fn()
const mockSetDoc = vi.fn()
const mockServerTimestamp = vi.fn(() => new Date())

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: mockAuth.onAuthStateChanged,
  signInAnonymously: mockAuth.signInAnonymously,
  signOut: mockAuth.signOut,
  getAuth: vi.fn(() => mockAuth),
  Auth: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: mockDoc,
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  serverTimestamp: mockServerTimestamp,
  getFirestore: vi.fn(),
}))

vi.mock('@/lib/firebase', () => ({
  auth: mockAuth,
  db: {},
}))

export { mockAuth, mockUser, mockDoc, mockGetDoc, mockSetDoc }
