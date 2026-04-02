# Backend Service Guidelines

These rules apply when creating or modifying backend service classes in `/lib`. The purpose is to abstract external services (Firebase, APIs, third-party libraries) behind a consistent interface, enabling easy swapping of implementations without touching consumer code.

## Architecture

### Directory Structure

```
lib/
├── db.ts           # Main Db class with static service singletons
├── firebase.ts     # Firebase initialization (singleton)
├── {service}.ts   # One file per service (e.g., auth.ts, rooms.ts)
└── utils.ts        # Shared utilities
```

### Pattern: Db Class with Static Services

All backend services are exposed through a single `Db` class with static singleton instances. This ensures services share the same database connection while keeping the API clean for consumers.

```typescript
// lib/db.ts
import { getDatabase } from 'firebase/database';
import { app } from './firebase';

class Db {
  private static db = getDatabase(app);

  static auth = new AuthService(Db.db);
  static rooms = new RoomsService(Db.db);
}

export { Db };
```

### Service Class Structure

Each service class:
- Is a plain class (not a singleton itself)
- Receives required dependencies via constructor
- All public methods return `Promise<T>`
- Public methods throw on error — consumers are responsible for error handling
- Type definitions exist for inputs; outputs are inferred or explicitly typed at the return statement

### Generic Service Template

```typescript
// lib/{service}.ts
import { Database } from 'firebase/database';

export interface {Service}Options {
  // input properties
}

export interface {Service} {
  methodName(options: {Service}Options): Promise</* inferred */>;
}

export class {Service}Impl implements {Service} {
  constructor(private db: Database) {}

  async methodName(options: {Service}Options) {
    // implementation
    return result as /* inferred type */;
  }
}
```

### Usage Pattern

```typescript
import { Db } from '@/lib/db';

// All services accessed via Db.*
const result = await Db.{service}.methodName({ /* options */ });
```

## Rules Summary

| Rule | Description |
|------|-------------|
| Location | Backend services live in `/lib` |
| Entry point | All services accessed via `Db.*` (e.g., `Db.auth`, `Db.rooms`) |
| Db class | Creates and owns the Firebase database instance; passes it to services |
| Return types | All public methods return `Promise<T>` |
| Error handling | Methods throw on failure; consumers handle errors |
| Type inputs | Interfaces for all input types (e.g., `{Service}Options`) |
| Return types | All public methods return `Promise`; output type is inferred or cast with `as` at return |
| Implementation hiding | Consumers never import Firebase modules directly |

## Adding New Services

1. Create `lib/{service}.ts` with `{Service}Options`, `{Service}` interface, and `{Service}Impl` class
2. Add constructor that accepts required dependencies (e.g., `Database`)
3. Add static singleton to `lib/db.ts`: `static {service} = new {Service}Impl(Db.db)`
4. Export from `lib/db.ts`
5. Use via `Db.{service}.methodName()`
