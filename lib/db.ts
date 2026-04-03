import { FirebaseApp } from 'firebase/app'
import { getDatabase, Database } from 'firebase/database'
import { getAuth, Auth } from 'firebase/auth'
import { app } from './firebase'
import { AuthService, AuthServiceImpl } from './auth'
import { RoomsService, RoomsServiceImpl } from './rooms'

class Db {
  readonly db: Database
  readonly auth: Auth
  readonly rooms: RoomsService
  readonly user: AuthService

  constructor(firebaseApp: FirebaseApp) {
    this.db = getDatabase(firebaseApp)
    this.auth = getAuth(firebaseApp)
    this.rooms = new RoomsServiceImpl(this.db)
    this.user = new AuthServiceImpl(firebaseApp, this.auth)
  }
}

const db = new Db(app)

export { db, Db }
export type { AuthService, RoomsService }
