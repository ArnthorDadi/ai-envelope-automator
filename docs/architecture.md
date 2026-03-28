# Architecture

## System Overview

Secret Hitler Digital Roles is a real-time multiplayer web application that replaces physical role envelopes in the board game Secret Hitler. The application enables players to create private rooms, invite others via room codes and deep links, and securely distribute hidden roles without requiring a custom backend server.

## Why Firebase?

Firebase provides three critical capabilities for this application:

### 1. Real-time Synchronization

Firebase Firestore's `onSnapshot` listeners provide WebSocket-based real-time updates out of the box. When any player joins, leaves, or the game starts, all connected clients receive updates within milliseconds without polling or page refreshes.

```
Traditional approach: Client polls server every N seconds
Firebase approach: Server pushes updates to clients instantly
```

### 2. Security Rules

Firestore Security Rules enforce access control at the database level. This means even if a malicious client tries to read another player's role, the rules prevent it. The security layer is independent of client code.

### 3. No Backend Required

Firebase Authentication provides anonymous sign-in (generates unique user IDs), and Firestore provides data storage with real-time capabilities. This eliminates the need for a custom Node.js/Express server while maintaining security.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Create     │  │   Join      │  │   Lobby     │             │
│  │  Room UI    │  │   Room UI   │  │   View      │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                           │                                     │
│                    ┌──────┴──────┐                              │
│                    │  React Hooks │                              │
│                    │  (useState)  │                              │
│                    └──────┬──────┘                              │
│                           │                                     │
│                    ┌──────┴──────┐                              │
│                    │ Firebase v9 │                              │
│                    │   SDK       │                              │
│                    └──────┬──────┘                              │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Firestore                             │    │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │    │
│  │  │   rooms/    │    │  players/   │    │   rules     │  │    │
│  │  │  {roomId}   │    │  {playerId} │    │  security   │  │    │
│  │  └─────────────┘    └─────────────┘    └─────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Firebase Auth                            │    │
│  │              (Anonymous Sign-in)                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Room ID Strategy

Room codes serve as Firestore document IDs, enabling:
- Guaranteed uniqueness (Firestore constraint)
- Simple URL routing: `/room/{roomId}`
- Direct deep linking: `https://app.com/room/ABC123`

### Code Generation

```
Characters: ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (24 chars, no ambiguous I/O/0/1)
Length: 6 characters
Entropy: 24^6 ≈ 192 million combinations
```

### Sharing

Share button copies full URL for one-tap join experience.

## Data Flow

### 1. Room Creation Flow

```
User clicks "Create Room"
        │
        ▼
Firebase Auth generates anonymous UID
        │
        ▼
Generate 6-char room code
        │
        ▼
Client creates rooms/{roomId} document (roomId = code)
        │
        ▼
Client creates rooms/{roomId}/players/{playerId} document
        │
        ▼
Navigate to /room/{roomId}
        │
        ▼
Subscribe to room and player documents (onSnapshot)
```

### 2. Join Room Flow

```
User taps shared URL or enters room code
        │
        ▼
Extract roomId from URL or input
        │
        ▼
Query Firestore for room with matching document ID
        │
        ▼
Validate room exists and status is "lobby"
        │
        ▼
Create rooms/{roomId}/players/{playerId} document
        │
        ▼
Subscribe to room and player documents
        │
        ▼
UI updates with new player list (real-time)
```

### 3. Game Start Flow

```
Host clicks "Start Game"
        │
        ▼
Client calls startGame function
        │
        ▼
Function distributes roles randomly (Fisher-Yates shuffle)
        │
        ▼
Batch update all player documents with roles
        │
        ▼
All clients receive real-time update
        │
        ▼
Each client displays role (filtered by visibility rules)
```

### 4. Game Reset Flow

```
Host clicks "Reset Game"
        │
        ▼
Confirm dialog: "Start a new round?"
        │
        ▼
Function clears all roles (set to null)
        │
        ▼
Re-shuffles and assigns new random roles
        │
        ▼
Room status remains "started"
        │
        ▼
All clients receive real-time update
```

### 5. Reconnection Flow

```
Player navigates to /room/{roomId}
        │
        ▼
Firebase Auth restores anonymous session
        │
        ▼
Subscribe to room document
        │
        ▼
Subscribe to own player document
        │
        ▼
If game started: Display role with visibility rules applied
If lobby: Display player list
```

## Firestore Structure

```
firestore/
├── rooms/
│   └── {roomId}/                    # roomId = 6-char code
│       ├── id: string
│       ├── hostId: string
│       ├── status: "lobby" | "started"
│       ├── playerCount: number       # Denormalized for quick reads
│       ├── settings: { hitlerSeesFascists: boolean }
│       ├── createdAt: timestamp
│       │
│       └── players/
│           └── {playerId}/          # playerId = Firebase UID
│               ├── id: string
│               ├── name: string
│               ├── role: "liberal" | "fascist" | "hitler" | null
│               ├── joinedAt: timestamp
│               └── leftAt: timestamp | null  # Set when player leaves
```

## Atomic Operations

### Player Count Updates

To prevent race conditions when players join simultaneously:

```typescript
// Use increment instead of read-then-write
import { increment } from 'firebase/firestore';

await updateDoc(roomRef, {
  playerCount: increment(1)
});
```

### Transaction for Host Transfer

When host leaves, use transaction to ensure atomic transfer:

```typescript
await runTransaction(db, async (transaction) => {
  const roomDoc = await transaction.get(roomRef);
  if (roomDoc.data().hostId === leavingPlayerId) {
    const players = await getDocs(playersRef);
    const firstPlayer = players.docs[0];
    if (firstPlayer) {
      transaction.update(roomRef, { hostId: firstPlayer.id });
    }
  }
});
```

## Real-time Synchronization Approach

### Pattern: Per-Player Subscriptions

Each client subscribes to:

1. **Room document**: For general game state (status, player count, hostId)
2. **Own player document**: For role assignment
3. **All players**: For lobby display and fascist visibility

```typescript
// Subscribe to room state
const room unsub = onSnapshot(roomRef, (snap) => {
  setRoom(snap.data());
});

// Subscribe to own role (secure)
const player unsub = onSnapshot(playerRef, (snap) => {
  setPlayer(snap.data());
});

// Subscribe to all players for lobby
const players unsub = onSnapshot(playersRef, (snap) => {
  setPlayers(snap.docs.map(d => d.data()));
});
```

### Pattern: Minimal Re-renders

Use targeted subscriptions rather than broad ones:

```typescript
// BAD: Subscribe to entire rooms collection
collectionGroup('rooms').where(...)

// GOOD: Subscribe to specific room
doc(db, 'rooms', roomId)
```

## Security Architecture

### Defense Layers

1. **Firestore Rules**: Primary security layer
2. **Client Validation**: Secondary UX layer
3. **No Global State**: Sensitive data stays in local state

### Rule Categories

| Rule Type | Purpose |
|-----------|---------|
| Room Read | Only players in room can read room data |
| Room Write | Only host can modify room settings/start game |
| Player Read | Players can read own role; fascists can read fellow fascists |
| Player Write | Host assigns roles; players update own name |
| Game Reset | Only host can reset |

## Host Transfer

When the host disconnects or leaves:
1. First player in the players collection becomes new host
2. `hostId` updated atomically via transaction
3. New host gains all host privileges

## Next.js App Router Integration

```
app/
├── page.tsx                 # Landing: Create or Join
├── room/
│   └── [roomId]/
│       ├── page.tsx         # Lobby & Game view
│       └── loading.tsx      # Loading state
├── layout.tsx               # Root layout (Server Component)
└── globals.css              # Tailwind styles
```

### Client Components

All game-related components are Client Components (`'use client'`) because they:
- Use Firebase SDK directly
- Manage real-time subscriptions
- Handle user interactions

### Server Components

The root layout and static pages can be Server Components for:
- SEO (if needed)
- Initial HTML generation
- Environment variable access

### Theme Support

System preference detected via CSS media query:

```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}
```

## Room Cleanup

Rooms are cleaned up in these scenarios:

1. **Host quit**: Host deletes room document
2. **All players leave**: Room becomes orphaned (cleanup via background task)
3. **Inactivity**: Rooms inactive for 2+ hours

> Note: Firebase doesn't support document TTL. Cleanup handled by:
> - Host action (immediate)
> - Client-side check on join (informational)
> - Future: Cloud Function for periodic cleanup

## Environment Variables

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> **Security Note**: These variable names are for reference only. The agent MUST NOT read, write, or expose the actual values in `.env` files. Values are injected at build time.
