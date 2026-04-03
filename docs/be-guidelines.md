# Backend Service Guidelines

These rules apply when creating or modifying backend service classes in `/lib`. The purpose is to abstract external services (Firebase, APIs, third-party libraries) behind a consistent interface, enabling easy swapping of implementations without touching consumer code.

## Architecture

### Directory Structure

```
lib/
├── firebase.ts     # Firebase initialization (exports app only)
├── db.ts           # Db class + singleton export
├── auth.ts         # AuthService interface + AuthServiceImpl
├── rooms.ts        # RoomsService interface + RoomsServiceImpl
└── utils.ts        # Shared utilities
```

### Pattern: Db Class with Service Instances

A single `Db` class initializes Firebase and holds all service instances. The singleton export `db` is used throughout the application.

```typescript
// lib/db.ts
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
```

### Service Class Structure

Each service class:

- Is a plain class implementing a corresponding interface
- Receives required dependencies via constructor
- All public methods return `Promise<T>`
- Public methods throw on error — consumers are responsible for error handling
- Input/output types are defined in interfaces

### Generic Service Template

```typescript
// lib/{service}.ts
import { Database } from 'firebase/database';

export interface {Service}Options {
  // input properties
}

export interface {Service} {
  methodName(options: {Service}Options): Promise<ReturnType>;
}

export class {Service}Impl implements {Service} {
  constructor(private db: Database) {}

  async methodName(options: {Service}Options) {
    // implementation
  }
}
```

### Usage Pattern

```typescript
import { db } from '@/lib/db'

// All services accessed via db.*
const result = await db.rooms.createRoom({ hostId, hostName })
await db.user.signIn({ name })
```

## Rules Summary

| Rule                  | Description                                               |
| --------------------- | --------------------------------------------------------- |
| Location              | Backend services live in `/lib`                           |
| Entry point           | Import `db` from `@/lib/db` (singleton)                   |
| Db class              | Initializes Firebase, creates service instances           |
| Firebase              | Only `app` exported from `firebase.ts`                    |
| Return types          | All public methods return `Promise<T>`                    |
| Error handling        | Methods throw on failure; consumers handle errors         |
| Type inputs           | Interfaces for all input types (e.g., `{Service}Options`) |
| Implementation hiding | Consumers never import Firebase modules directly          |

## Adding New Services

1. Create `lib/{service}.ts` with `{Service}Options`, `{Service}` interface, and `{Service}Impl` class
2. Add constructor that accepts required dependencies (e.g., `Database`)
3. Add property to `Db` class: `readonly {service}: {Service}`
4. Initialize in constructor: `this.{service} = new {Service}Impl(...)`
5. Export from `lib/db.ts`
6. Use via `db.{service}.methodName()`
