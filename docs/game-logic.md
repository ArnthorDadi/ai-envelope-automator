# Game Logic

## Role Distribution

### Standard Rules (5-10 Players)

| Total Players | Liberals | Fascists | Hitler | Notes |
|--------------|----------|----------|--------|-------|
| 5            | 3        | 2        | 1      | Most common |
| 6            | 4        | 2        | 1      | - |
| 7            | 4        | 3        | 1      | - |
| 8            | 5        | 3        | 1      | - |
| 9            | 5        | 4        | 1      | - |
| 10           | 6        | 4        | 1      | Maximum |

### Role Assignment Algorithm

```typescript
function assignRoles(playerCount: number): Role[] {
  const distribution = ROLE_DISTRIBUTION[playerCount];
  const roles: Role[] = [
    ...Array(distribution.liberals).fill('liberal'),
    ...Array(distribution.fascists - 1).fill('fascist'),
    'hitler'
  ];
  
  // Fisher-Yates shuffle
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  
  return roles;
}
```

### Re-shuffling on Reset

When host resets the game:
1. All roles are cleared (set to `null`)
2. New random shuffle assigns fresh roles
3. **Hitler can receive Hitler again** (fully random, no memory of previous rounds)

## Visibility Rules

### Overview

| Player Type | Sees Own Role | Sees Fellow Liberals | Sees Fascists | Sees Hitler |
|-------------|---------------|----------------------|---------------|-------------|
| Liberal     | ✓             | ✗                    | ✗             | ✗           |
| Fascist     | ✓             | ✗                    | ✓             | ✓           |
| Hitler (5-6p)| ✓            | ✗                    | ✓             | N/A         |
| Hitler (7-10p)| ✓           | ✗                    | ✗             | N/A         |

### Detailed Visibility Rules

#### Liberals

- Know they are liberal
- Do NOT know who other liberals are
- Do NOT know who fascists are
- Do NOT know who Hitler is
- **Rationale**: Maintains game balance; liberals must deduce truth

#### Fascists

- Know they are fascist
- Know who other fascists are
- Know who Hitler is
- Do NOT know who liberals are
- **Rationale**: Enables coordination between fascists

#### Hitler

**5-6 Players:**
- Know they are Hitler
- Know who fascists are
- Do NOT know who liberals are
- **Rationale**: Standard rules; Hitler can coordinate with team

**7-10 Players:**
- Know they are Hitler
- Do NOT know who fascists are
- Do NOT know who liberals are
- **Rationale**: Advanced rules; Hitler must pretend to be liberal

## Game Reset Rules

### When to Reset

Host can reset the game at any time after initial start:
- After a round ends
- For a new game with the same players
- Before everyone leaves

### Reset Behavior

1. All roles are cleared (set to `null`)
2. Room status remains "started"
3. New random roles assigned to all players
4. All clients receive real-time update
5. Each client re-displays role reveal

### What IS Reset

- Player roles (all cleared and re-assigned)
- Previous game history (discarded)

### What IS NOT Reset

- Player list (same players)
- Player names
- Host status
- Room settings

## Host Transfer Rules

### Trigger Conditions

Host transfer occurs when:
1. Host explicitly leaves the room
2. Host disconnects (detected via Firestore listener disconnect)

### Transfer Mechanism

1. Query all players in room
2. Sort by `joinedAt` timestamp
3. First player in list becomes new host
4. Update `hostId` in room document atomically

### Transfer Logic

```typescript
async function transferHost(roomId: string, currentHostId: string) {
  const playersRef = collection(db, 'rooms', roomId, 'players');
  const playersSnap = await getDocs(query(playersRef, orderBy('joinedAt', 'asc')));
  
  if (!playersSnap.empty) {
    const firstPlayer = playersSnap.docs[0];
    await updateDoc(doc(db, 'rooms', roomId), { hostId: firstPlayer.id });
  }
}
```

### New Host Privileges

- Start game (if minimum players)
- Reset game
- (Future: Kick players)

## Edge Cases

### Minimum Players

- Game requires **minimum 5 players** to start
- If room has fewer than 5 players, "Start Game" button is disabled
- Display: "3/5 players needed"

### Maximum Players

- Game supports **maximum 10 players**
- If room is full, "Join" button is disabled
- Display: "Room is full"

### Player Disconnection

- If player disconnects: Document remains, `leftAt` timestamp set
- Player can reconnect by returning to room URL
- On reconnect: Role is preserved, re-subscription displays role
- No role reveal on disconnect (maintains secrecy)

### Host Leaves (During Lobby)

- First player in list becomes new host
- New host can start game when ready

### Host Leaves (During Game)

- Game continues with remaining players
- First player in list becomes new host
- Disconnected player's role remains secret

### Room Abandonment

- If all players leave: Room becomes orphaned
- Cleanup handled by: Host quit action, or future background task
- Rooms inactive for 2+ hours are candidates for cleanup

## State Transitions

```
[lobby] ──────► [started] ◄───── [reset]
   │                 │
   │                 │
   ▼                 ▼
[abandoned]     (game in progress)
(orphaned)
```

### State: Lobby

- Players can join/leave
- Host can start game (if >=5 players)
- No roles visible
- Room code shared among players

### State: Started

- No new players can join
- Roles assigned and visible
- Players can view their role anytime
- Host can reset game
- Room persists until host quits or all leave

## Game Flow (MVP Scope)

For MVP, we implement:

1. **Create Room** → Player becomes host
2. **Join Room** → Player added to list
3. **Lobby** → Real-time player list
4. **Start Game** → Roles distributed (random shuffle)
5. **Role Reveal** → Each player sees their role + authorized allies
6. **View Role** → Can re-view role anytime during game
7. **Reset Game** → Host can start new round (re-shuffle)

### Out of MVP Scope (Phase 7+)

- Policy deck
- Voting system
- Presidential powers
- Win conditions
- Point tracking
- Kicking players
- Game history

## Role Reveal Display

### When to Show

- Immediately when game starts and role is assigned
- Anytime player taps "View My Role" button
- After game reset (new roles assigned)

### Display Timing

| Behavior | Specification |
|----------|---------------|
| Initial display | Role card shows with fade-in animation (500ms) |
| Auto-hide | After exactly 7 seconds |
| Timer pause | Pauses while user is interacting |
| Manual dismiss | Tap outside card to hide early |
| Subsequent views | Each view shows for 7 seconds, then auto-hides |

**Rationale**: Fixed 7-second timeout ensures everyone gets the same viewing time, making it obvious when all players receive their roles. This prevents confusion about game state.

### What Each Role Sees

**Liberal:**
```
┌─────────────────────────┐
│     YOU ARE A LIBERAL   │
│        💙 LIBERAL       │
│                         │
│  Your mission: Enact 5  │
│  liberal policies...    │
│                         │
│      [View Role]        │
└─────────────────────────┘
```

**Fascist (5-6p):**
```
┌─────────────────────────┐
│    YOU ARE A FASCIST    │
│       👤 FASCIST       │
│                         │
│  Your teammates:        │
│  • Bob (Fascist)        │
│  • Charlie (Hitler)     │
│                         │
│      [View Role]        │
└─────────────────────────┘
```

**Hitler (7-10p):**
```
┌─────────────────────────┐
│      YOU ARE HITLER     │
│       🕵️ HITLER        │
│                         │
│  You do NOT know your  │
│  teammates. Act like    │
│  a liberal to survive.  │
│                         │
│      [View Role]        │
└─────────────────────────┘
```

## Visibility Implementation

### Client-Side Role Filtering

```typescript
function getVisiblePlayers(
  player: Player, 
  allPlayers: Player[],
  room: Room
): Player[] {
  if (!player.role || player.role === 'liberal') {
    return [];
  }
  
  if (player.role === 'fascist') {
    return allPlayers.filter(p => 
      p.role === 'fascist' || p.role === 'hitler'
    );
  }
  
  if (player.role === 'hitler') {
    // Hitler sees fascists in 5-6 player games, but not in 7-10 player games
    if (room.playerCount <= 6) {
      return allPlayers.filter(p => p.role === 'fascist');
    }
    return [];
  }
  
  return [];
}
```

## Constants

```typescript
const MIN_PLAYERS = 5;
const MAX_PLAYERS = 10;
const HITLER_SEES_FASCISTS_THRESHOLD = 6;

const ROLE_DISTRIBUTION = {
  5:  { liberals: 3, fascists: 2 },
  6:  { liberals: 4, fascists: 2 },
  7:  { liberals: 4, fascists: 3 },
  8:  { liberals: 5, fascists: 3 },
  9:  { liberals: 5, fascists: 4 },
  10: { liberals: 6, fascists: 4 },
} as const;

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;

const PLAYER_NAME_MAX_LENGTH = 20;

type Role = 'liberal' | 'fascist' | 'hitler';
```
