# Project: Secret Hitler Digital Roles

## Goal

A real-time multiplayer web app that replaces physical role envelopes in Secret Hitler, enabling players to create rooms, join via room codes, and securely distribute hidden roles.

## Core Features

1. **Room System**
   - Create a room (generates unique room code via Firestore document ID)
   - Join via room code or deep link (full URL)
   - Real-time lobby with player list
   - Host controls game start
   - Host can reset game for replay rounds

2. **Role Assignment**
   - Client-side role distribution (MVP), protected by Firestore rules
   - 5-10 player support
   - Roles: Liberal, Fascist, Hitler
   - Full re-shuffle on each game start/reset (roles can repeat)

3. **Visibility System**
   - Liberals see no additional info (only know own role)
   - Fascists see other fascists and Hitler
   - Hitler sees fascists only when 5-6 players
   - No role exposure to unauthorized players
   - Role card auto-hides after 7 seconds (privacy)
   - Tap "View Role" anytime to see again

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, TypeScript
- **Backend**: Firebase Firestore (realtime listeners)
- **State**: Local React state only (no global state managers)
- **Auth**: Anonymous Firebase auth (player ID generation)

## Architecture

```
┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Firestore  │
│  (Next.js)  │◀────│  (Realtime) │
└─────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       └───────────▶│   Rules    │
                    │  (Security) │
                    └─────────────┘
```

### Data Flow

1. Player creates/joins room → Firestore document created/updated
2. Client subscribes to room document via `onSnapshot`
3. Role assignment happens client-side but protected by Firestore rules
4. Real-time updates propagate to all connected clients instantly
5. On reconnection during game, player re-subscribes and sees their role

## Data Models

### Room Document (`rooms/{roomId}`)

```typescript
interface Room {
  id: string // 6-char code, matches Firestore document ID
  hostId: string // Firebase UID of room creator
  status: 'lobby' | 'started' // Game phase
  playerCount: number // Current player count
  createdAt: Timestamp
}
```

### Player Document (`rooms/{roomId}/players/{playerId}`)

```typescript
interface Player {
  id: string // Firebase UID
  name: string // Display name (max 20 chars, alphanumeric + spaces)
  role: 'liberal' | 'fascist' | 'hitler' | null // null until game starts
  joinedAt: Timestamp
  leftAt?: Timestamp // Set when player leaves (document persists)
}
```

## Game Rules

### Role Distribution

| Players | Liberals | Fascists | Hitler |
| ------- | -------- | -------- | ------ |
| 5       | 3        | 2        | 1      |
| 6       | 4        | 2        | 1      |
| 7       | 4        | 3        | 1      |
| 8       | 5        | 3        | 1      |
| 9       | 5        | 4        | 1      |
| 10      | 6        | 4        | 1      |

### Visibility Rules

| Viewer         | Can See                       |
| -------------- | ----------------------------- |
| Liberal        | Nothing (only knows own role) |
| Fascist        | Other fascists, Hitler        |
| Hitler (5-6p)  | Other fascists                |
| Hitler (7-10p) | Nothing                       |

### Game Reset Rules

- Host can reset room to start a new round
- On reset: All roles are cleared and re-shuffled (full random)
- Hitler can receive Hitler again on re-shuffle (fully random)
- Previous round history is discarded
- Players keep their names and joined status

### Host Transfer Rules

- If host disconnects/leaves during lobby: First player in player list becomes new host
- New host inherits all host privileges (start game, reset room)

## Security Principles

1. **Role Isolation**: Roles stored per-player, not in room document
2. **Firestore Rules**: Enforce visibility at database level
3. **No Client Trust**: Server rules validate all operations
4. **Minimal Exposure**: Each client only receives data they can legally view
5. **Race Condition Prevention**: Use Firestore transactions for player count

### Security Rules Summary

- Anyone can create a room
- Only players in a room can read that room
- Only host can start the game or reset
- Players can only read their own role
- Fascists can read other fascist roles
- Fascists can read Hitler's role
- Hitler visibility depends on game settings (5-6 players)

## Real-time Synchronization

```typescript
// Subscribe to room updates
onSnapshot(roomRef, (snapshot) => {
  const room = snapshot.data()
  // UI updates automatically
})

// Subscribe to player's own role
onSnapshot(playerRef, (snapshot) => {
  const player = snapshot.data()
  // Role reveal handled here
})
```

## Room System Details

### Room Code Generation

- 6-character codes using `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (24 chars, no ambiguous I/O/0/1)
- Stored as Firestore document ID (ensures uniqueness)
- Client-side routing uses room ID in URL path

### Sharing

- Share button copies full URL: `https://app.com/room/ABC123`
- One tap to join (deep link directly to room)

### Room Cleanup

Rooms are cleaned up in these scenarios:

1. Host executes "Quit Game" (delete room)
2. All players leave (room becomes orphaned)
3. Room inactive for 2+ hours (background cleanup)

## Player System Details

### Player Names

- Maximum 20 characters
- Alphanumeric characters and spaces only
- Duplicate names allowed (display shows names, not IDs)

### Reconnection

- Players can reconnect during game by navigating to room URL
- Their role is preserved and re-subscribed
- Visibility rules apply on reconnection

### Leaving

- "Leave Room" sets `leftAt` timestamp on player document
- Document is NOT deleted (preserves history)
- `playerCount` is NOT decremented (avoid race conditions)

## UI/UX Details

### Role Reveal

- Role card appears with animation when game starts
- Auto-hides after exactly 7 seconds (fixed duration)
- Timer pauses while user is interacting
- Tap outside card to dismiss early
- "View Role" button shows card for 7 seconds each time
- After hide: Minimal view shows player list (names only) + actions
- Nothing that reveals role to phone peekers

### Theme

- System preference auto-detected (light/dark mode)

### Loading States

- Simple "Loading room..." text for initial load
- Skeleton screens only if time permits

### Notifications

- Toast system for: "Player joined", "Player left", errors, game started
- No audio notifications

### Languages

- English only for MVP
- Text structured for easy future i18n

## Testing Strategy

- Unit tests for pure functions: `startGame.ts`, `getVisiblePlayers.ts`
- Integration tests with Firebase Emulator when needed
- No audio/video testing needed

## DOs

- Use Firestore `onSnapshot` for all real-time updates
- Store roles individually per player document
- Use Firestore security rules for access control
- Keep sensitive state local (React useState)
- Use anonymous Firebase auth for player identification
- Reference env vars only by name: `process.env.NEXT_PUBLIC_FIREBASE_API_KEY`
- Use Firestore transactions for atomic operations (player count)
- Full random shuffle on every game start/reset

## DON'Ts

- Do NOT read, write, or access `.env` or `.env.local` files — EVER
- Do NOT log or output the contents of environment variables
- Do NOT store roles in the room document
- Do NOT use Redux/MobX for sensitive game state
- Do NOT expose roles in client-side global state
- Do NOT allow non-host to start the game
- Do NOT create an Express/custom backend server
- Do NOT use WebSockets directly (use Firestore listeners)
- Do NOT decrement playerCount on leave (causes race conditions)
- Do NOT add kicking functionality in MVP
- Do NOT add audio notifications

## Environment Variables

Environment variables are referenced only by their names (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`).

- The agent MAY reference variable names in documentation and code patterns
- The agent MUST NOT read, modify, or expose the actual values
- Actual values are injected at build/deploy time by the system

## File Structure

```
/
├── AI_CONTEXT.md           # This file
├── TASKS.md                # Implementation checklist
├── firebase.rules          # Firestore security rules
├── docs/
│   ├── architecture.md     # System design
│   ├── game-logic.md       # Role rules
│   ├── firebase-schema.md  # Data structure
│   ├── firebase-rules.md   # Rules explanation
│   └── ui-flow.md          # User flows
├── examples/
│   ├── createRoom.ts
│   ├── joinRoom.ts
│   ├── subscribeToRoom.ts
│   ├── startGame.ts
│   ├── resetGame.ts
│   ├── leaveRoom.ts
│   └── getVisiblePlayers.ts
└── app/                    # Next.js App Router
```

## Development Priorities

1. **MVP First**: Room creation → Join → Lobby → Role reveal → Reset
2. **Security Second**: Firestore rules must be correct
3. **UX Third**: Mobile-friendly, real-time feedback, toasts
4. **Polish Last**: Animations, dark mode, edge cases
5. **Simple UI First**: The first version should be as simple as possible. Avoid over-engineering the interface. Ship basic functionality, then iterate on visual design.

## Future Enhancements (Phase 7+)

- Full game mechanics (voting, policies, win conditions)
- Firebase Functions for server-side role assignment
- shadcn/ui component library
- Kicking players
- Game history
- Profanity filter for names
- i18n support
