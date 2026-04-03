# Firebase Schema

## Overview

Firestore collections and documents structure for Secret Hitler Digital Roles. The schema is designed for:

- Real-time subscriptions
- Security rule enforcement
- Minimal data exposure
- Atomic operations for player count

## Collection Structure

```
rooms/
└── {roomId}/                     # roomId = 6-char code (matches document ID)
    ├── (room document)
    └── players/
        └── {playerId}/          # playerId = Firebase UID
            └── (player document)
```

## Document ID Strategy

### Room ID as Document ID

The 6-character room code serves as the Firestore document ID:

- Guaranteed uniqueness by Firestore
- Enables direct document access: `doc(db, 'rooms', roomId)`
- Simple URL routing: `/room/{roomId}`

### Player ID as Document ID

The Firebase Auth UID serves as the player document ID:

- Guaranteed uniqueness
- Links directly to authenticated user
- Enables secure Firestore rules: `request.auth.uid == playerId`

## Collections

### `rooms` Collection

**Purpose**: Store room metadata and game state.

**Document ID**: 6-character code (e.g., `ABC123`)

**Path**: `/rooms/{roomId}`

### `rooms/{roomId}/players` Subcollection

**Purpose**: Store player information and roles.

**Document ID**: Firebase Auth UID

**Path**: `/rooms/{roomId}/players/{playerId}`

## Room Document

```typescript
interface Room {
  // Identification
  id: string // 6-char code, matches document ID

  // Ownership
  hostId: string // Firebase UID of creator

  // Game State
  status: 'lobby' | 'started' // Current game phase

  // Metadata
  createdAt: Timestamp // Room creation time
  playerCount: number // Denormalized count (use increment, not read-modify-write)
}
```

### Example Room Document

```json
{
  "id": "ABC123",
  "hostId": "firebase-uid-xxxxx",
  "status": "lobby",
  "createdAt": "2024-01-15T10:30:00Z",
  "playerCount": 5
}
```

### Room Document States

**Lobby State:**

```json
{
  "id": "ABC123",
  "hostId": "uid-001",
  "status": "lobby",
  "playerCount": 3
}
```

**Started State:**

```json
{
  "id": "ABC123",
  "hostId": "uid-001",
  "status": "started",
  "playerCount": 5
}
```

## Player Document

```typescript
interface Player {
  // Identification
  id: string // Firebase UID, matches document ID

  // Display
  name: string // Player name (max 20 chars)

  // Role (null until game starts)
  role: 'liberal' | 'fascist' | 'hitler' | null

  // Metadata
  joinedAt: Timestamp // When player joined
  leftAt?: Timestamp // Set when player leaves (optional)
}
```

### Player Document Fields

| Field    | Type        | Description           |
| -------- | ----------- | --------------------- |
| id       | string      | Firebase UID          |
| name     | string      | Display name          |
| role     | string/null | Assigned role         |
| joinedAt | Timestamp   | Join time             |
| leftAt   | Timestamp   | Leave time (optional) |

### Example Player Documents (Before Game Start)

```json
// /rooms/ABC123/players/uid-001
{
  "id": "uid-001",
  "name": "Alice",
  "role": null,
  "joinedAt": "2024-01-15T10:30:00Z"
}

// /rooms/ABC123/players/uid-002
{
  "id": "uid-002",
  "name": "Bob",
  "role": null,
  "joinedAt": "2024-01-15T10:31:00Z"
}
```

### Example Player Documents (After Game Start)

```json
// /rooms/ABC123/players/uid-001
{
  "id": "uid-001",
  "name": "Alice",
  "role": "liberal",
  "joinedAt": "2024-01-15T10:30:00Z"
}

// /rooms/ABC123/players/uid-002
{
  "id": "uid-002",
  "name": "Bob",
  "role": "fascist",
  "joinedAt": "2024-01-15T10:31:00Z"
}

// /rooms/ABC123/players/uid-003
{
  "id": "uid-003",
  "name": "Charlie",
  "role": "fascist",
  "joinedAt": "2024-01-15T10:32:00Z"
}

// /rooms/ABC123/players/uid-004
{
  "id": "uid-004",
  "name": "Diana",
  "role": "liberal",
  "joinedAt": "2024-01-15T10:33:00Z"
}

// /rooms/ABC123/players/uid-005
{
  "id": "uid-005",
  "name": "Eve",
  "role": "hitler",
  "joinedAt": "2024-01-15T10:34:00Z"
}
```

### Example: Player After Leaving

```json
// /rooms/ABC123/players/uid-003
{
  "id": "uid-003",
  "name": "Charlie",
  "role": "fascist",
  "joinedAt": "2024-01-15T10:32:00Z",
  "leftAt": "2024-01-15T10:45:00Z"
}
```

> Note: `leftAt` is set but document is NOT deleted. This preserves role information for future reference and avoids race conditions with `playerCount`.

## Atomic Operations

### Player Count Increment

Use Firestore `increment()` to avoid race conditions:

```typescript
import { increment } from 'firebase/firestore'

// When joining
await updateDoc(roomRef, {
  playerCount: increment(1),
})

// When leaving - DO NOT decrement
// leftAt is set but playerCount remains for consistency
```

### Why Not Decrement on Leave?

Decrementing `playerCount` creates race conditions:

1. Player A reads count: 5
2. Player B reads count: 5
3. Player A leaves, writes count: 4
4. Player B leaves, writes count: 4

Result: Count should be 3, but is 4.

**Solution**: Don't decrement. Query player collection to get actual count when needed.

## Firestore Indexes

No composite indexes required for MVP. Default single-field indexes are sufficient.

If future features require queries, add:

```json
// firestore.indexes.json or Firebase Console
{
  "indexes": [
    {
      "collectionGroup": "rooms",
      "queryScope": "COLLECTION",
      "fields": [{ "fieldPath": "status", "order": "ASCENDING" }]
    }
  ]
}
```

## Data Size Considerations

- Room document: < 1 KB
- Player document: < 1 KB
- Total room (10 players): ~10 KB

Firestore free tier: 50K reads, 20K writes, 20K deletes per day

## Future Schema Extensions

When adding game phases (voting, policy, etc.):

```typescript
interface Room {
  // ... existing fields ...

  // Game Phase (future)
  phase?: 'role-reveal' | 'policy-selection' | 'voting' | 'execution'

  // Current President (future)
  presidentId?: string

  // Policy Deck (future)
  policyDeck?: {
    liberals: number
    fascists: number
  }
}
```

Keep extensions minimal for MVP.
