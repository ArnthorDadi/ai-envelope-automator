# Project Blueprint

Master guide for implementing Secret Hitler Digital Roles. Read this before starting any feature implementation.

## How to Use This Document

1. Read `plans/prd.json` to understand the full feature list
2. Pick the highest priority feature from prd.json
3. Read the relevant section in this document
4. Implement the feature, noting any discrepancies

## Shared Infrastructure

These components are used across multiple features and should be referenced by each feature that needs them.

| Component                 | Used By                              | Description                    |
| ------------------------- | ------------------------------------ | ------------------------------ |
| `Toast` (F12-UI/F12-FUNC) | F1, F4-UI, F6-FUNC, F13-UI, F15-FUNC | Toast notifications for events |
| `Button`                  | All UI features                      | Reusable button component      |
| `ConfirmDialog`           | F5-UI, F10-FUNC, F20-FUNC            | Confirmation modals            |
| `Navbar`                  | F1, All pages                        | App header with login/logout   |
| `AuthContext`             | All features                         | Firebase auth state            |
| `ToastContext`            | All features                         | Global toast state             |

## Page Routes

| Page              | Route            | Features                                                  |
| ----------------- | ---------------- | --------------------------------------------------------- |
| Home              | `/`              | F1, F2-UI, F2-FUNC, F3-UI, F3-FUNC                        |
| Login             | `/login`         | F1                                                        |
| Room (Lobby/Game) | `/room/[roomId]` | F4-UI through F10-FUNC, F13-UI through F20-FUNC, F26-FUNC |

---

## F1: User Login

**PRD**: F1 in `plans/prd.json`
**Page**: `/login`
**Connected Features**: All features depend on this

### UI State

```
┌─────────────────────────────────────────┐
│  ← Back                                  │
│                                          │
│     Enter your name                       │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Name                               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │            SUBMIT                  │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Navbar States

**Not logged in:**

```
┌─────────────────────────────────────────┐
│  SECRET HITLER              [Login]      │
└─────────────────────────────────────────┘
```

**Logged in:**

```
┌─────────────────────────────────────────┐
│  SECRET HITLER  John [Logout]            │
└─────────────────────────────────────────┘
```

### User Flow

1. User clicks "Login" button in navbar (top right)
2. Navigate to `/login` route
3. Name input field auto-focuses
4. User enters display name (max 20 chars)
5. User clicks "Submit" or presses Enter
6. Show loading state, disable button and input
7. Save name to Firestore `users/{uid}` collection
8. On success: redirect to home page, navbar shows username + logout button
9. On failure: show error toast "Login failed, please try again", re-enable form
10. User can click "Back" to return home without logging in

### Implementation Steps

- Create `components/Navbar.tsx` with:
  - Display app title
  - Show "Login" button when not authenticated
  - Show username + "Logout" button when authenticated
- Create `/app/login/page.tsx` with:
  - Back button that navigates to home
  - Name input with auto-focus on mount
  - Submit button
  - Loading state during submission
- Create `lib/login.ts` function:
  - Save user name to Firestore `users/{uid}` collection
  - Return success/failure
- Handle error toast on failure

### Flows Across

- `/` (trigger) → `/login` (login page)
- `/login` → `/` (on success or back)

### Guidelines

- Navbar must appear on all pages
- Name input limited to 20 characters
- AuthContext manages Firebase authentication state
- User document stored in `users` collection (separate from rooms)
- Toast notification on login failure

### Firestore Schema

```typescript
// users/{uid}
{
  name: string // User's display name
  createdAt: Timestamp
}
```

---

## F2-UI: Create Room Form

**PRD**: F2-UI in `plans/prd.json`
**Page**: `/` (Home)
**Connected Features**: F2-FUNC (creates room), F4-UI (shows lobby)

### UI State

From `docs/ui-flow.md`:

```
┌─────────────────────────────────────────┐
│     SECRET HITLER                        │
│     Digital Roles                        │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         CREATE ROOM                │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### User Flow

1. User clicks "Create Room" button
2. Button shows loading state (disabled)
3. F2-FUNC creates room in Firestore
4. Redirect to `/room/[roomId]`

### Flows Across

- `/` (trigger) → `/room/[roomId]` (destination)

### Implementation Steps

From TASKS.md Phase 2.4:

- Create `components/CreateRoomForm.tsx`
- Display "Create Room" button
- Show loading state during creation
- Disable button during processing
- Redirect to room page after creation

### Guidelines

- The form itself has no input fields - just a button
- Actual room creation logic is in F2-FUNC

---

## F2-FUNC: Room Creation Logic

**PRD**: F2-FUNC in `plans/prd.json`
**Page**: `/` (triggered by F2-UI), `/room/[roomId]` (creates document)
**Connected Features**: F2-UI (trigger), F4-UI (shows result)

### User Flow

1. F2-UI calls create room function
2. Generate 6-character room code
3. Create room document in Firestore
4. Create player document (host) in players subcollection
5. Redirect to `/room/[roomId]`

### Implementation Steps

From TASKS.md Phase 2.1:

- Create `lib/createRoom.ts` function
- Generate 6-character room codes using: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Create room document in Firestore with roomId as document ID
- Add creator as host player in players subcollection
- Set status to 'lobby'
- Set playerCount to 1
- Handle creation errors

### Guidelines

- Room code must be exactly 6 characters
- Room code must use only valid characters (no I, O, 0, 1)
- Room ID becomes the 6-character code

---

## F3-UI: Join Room Form

**PRD**: F3-UI in `plans/prd.json`
**Page**: `/` (Home)
**Connected Features**: F3-FUNC (joins room), F4-UI (shows lobby)

### UI State

From `docs/ui-flow.md`:

```
┌─────────────────────────────────────────┐
│  ┌────────────────────────────────────┐  │
│  │    Room Code: [______]             │  │
│  │    Your Name:  [______]            │  │
│  │    ┌────────────────────────────┐ │  │
│  │    │          JOIN ROOM         │ │  │
│  │    └────────────────────────────┘ │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### User Flow

1. User enters 6-character room code
2. User enters display name (max 20 chars)
3. User clicks "Join Room"
4. Validate inputs
5. Call F3-FUNC to join room
6. Redirect to `/room/[roomId]`

### Implementation Steps

From TASKS.md Phase 2.4:

- Create `components/JoinRoomForm.tsx`
- Display room code input field (uppercase, 6 chars)
- Display player name input field
- Validate name is max 20 characters
- Validate name is alphanumeric + spaces only
- Show error for invalid room code
- Show loading state during join
- Redirect to room page after join

### Flows Across

- `/` (trigger) → `/room/[roomId]` (destination)

### Guidelines

- Room code input should auto-uppercase
- Name input should trim whitespace
- Show inline validation errors

---

## F3-FUNC: Room Joining Logic

**PRD**: F3-FUNC in `plans/prd.json`
**Page**: `/` (triggered by F3-UI), `/room/[roomId]` (result)
**Connected Features**: F3-UI (trigger), F4-UI (shows result)

### User Flow

1. F3-UI calls join room function with room code and name
2. Validate room code format
3. Check room exists and is in lobby state
4. Check room is not full (max 10 players)
5. Add player to room
6. Redirect to `/room/[roomId]`

### Implementation Steps

From TASKS.md Phase 2.2:

- Create `lib/joinRoom.ts` function
- Validate room code format (uppercase, 6 chars, valid chars)
- Check room exists and is in lobby state
- Check room is not full (max 10 players)
- Add player to room with merge: true for reconnection
- Use atomic increment for playerCount

### Guidelines

- Must validate on server (Firestore rules) in addition to client
- Use `increment()` for playerCount, never read-modify-write
- The `merge: true` option allows reconnection with same UID

---

## F4-UI: Lobby Display

**PRD**: F4-UI in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F4-FUNC (real-time data), F4-UX (waiting states), F6-FUNC (host transfer), F13-UI (share button)

### UI State

From `docs/ui-flow.md`:

**Host View:**

```
┌─────────────────────────────────────────┐
│  Room: ABC123                    [Share]│
│─────────────────────────────────────────│
│  Players (3/5 needed):                   │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Alice (Host) ⭐                │  │
│  │ 👤 Bob                            │  │
│  │ 👤 Charlie                        │  │
│  └────────────────────────────────────┘  │
│  Waiting for 2 more players...           │
│  ┌────────────────────────────────────┐  │
│  │      START GAME (disabled)         │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │           LEAVE ROOM              │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Non-Host View:**

```
┌─────────────────────────────────────────┐
│  Room: ABC123                    [Share]│
│─────────────────────────────────────────│
│  Players (3/5 needed):                   │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Alice (Host) ⭐                │  │
│  │ 👤 Bob                            │  │
│  │ 👤 You                            │  │
│  └────────────────────────────────────┘  │
│  Waiting for 2 more players...           │
│  ┌────────────────────────────────────┐  │
│  │    Waiting for host to start...   │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │           LEAVE ROOM              │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### User Flow

1. User lands on `/room/[roomId]`
2. F4-FUNC subscribes to room and players data
3. Lobby displays room code, player list, host indicator
4. Real-time updates when players join/leave
5. Toast notifications for join/leave events

### Implementation Steps

From TASKS.md Phase 3.2:

- Create `components/Lobby.tsx`
- Display room code prominently
- Show list of players with names
- Indicate host with star badge (⭐)
- Show player count (e.g., '3/5 needed')
- Real-time updates when players join/leave
- Display toast notifications for join/leave events

### Guidelines

- Player list should update in real-time
- Host badge (⭐) should update if host changes
- Uses Toast component (F12-UI/F12-FUNC)

---

## F4-FUNC: Real-time Subscription

**PRD**: F4-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F4-UI (displays data), F16-FUNC (reconnection)

### User Flow

1. User lands on `/room/[roomId]`
2. Subscribe to room document
3. Subscribe to players subcollection
4. Handle disconnection/reconnection
5. Unsubscribe on unmount

### Implementation Steps

From TASKS.md Phase 3.1:

- Create `lib/subscribeToRoom.ts`
- Implement `onSnapshot` for room document
- Create `lib/subscribeToPlayers.ts`
- Implement `onSnapshot` for players subcollection
- Create `hooks/useRoom.ts` - combined subscription hook
- Create `hooks/usePlayers.ts` - players subscription hook
- Create `hooks/usePlayer.ts` - own player subscription hook
- Handle disconnection/reconnection
- Unsubscribe listeners on unmount

### Guidelines

- Always use Firestore listeners (`onSnapshot`), never polling
- Unsubscribe in `useEffect` cleanup
- Handle the initial loading state

---

## F4-UX: Lobby Waiting States

**PRD**: F4-UX in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F4-UI, F5-UI (host controls)

### UI State

**Host View:**

- "Need X more players" message
- "Start Game" button (disabled until 5+ players)

**Non-Host View:**

- "Waiting for host to start..." message
- No start button

### User Flow

1. Lobby checks player count
2. Show appropriate waiting message based on role
3. Update in real-time when players join/leave

### Implementation Steps

From TASKS.md Phase 3.2 and 4.1:

- Non-host sees "Waiting for host to start..." message
- Host sees "Start Game" button with player count
- Show player count progress (e.g., '3/5 players')
- Update waiting message in real-time when players join/leave

---

## F5-UI: Host Controls UI

**PRD**: F5-UI in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F5-FUNC (start logic), F10-FUNC (reset), F20-FUNC (quit), F4-UX (waiting states)

### UI State

**Host View (Game Started):**

```
┌─────────────────────────────────────────┐
│  ┌────────────────────────────────────┐  │
│  │        RESET GAME                  │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │        QUIT GAME                   │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### User Flow

1. Check if current user is host
2. Show host-only controls
3. Show confirmation dialogs before destructive actions

### Implementation Steps

From TASKS.md Phase 4.1 and 6.1:

- Show "Start Game" button only for host
- Disable start button if fewer than 5 players
- Show "Need X more players" message
- Show "Reset Game" button only for host
- Show "Quit Game" button only for host
- Display confirmation dialog before reset
- Display warning dialog before quit

### Guidelines

- All three buttons (Start Game, Reset Game, Quit Game) are host-only
- Uses ConfirmDialog component

---

## F5-FUNC: Start Game Logic

**PRD**: F5-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F5-UI (triggers), F7-FUNC (assigns roles), F8-UI (reveals roles)

### User Flow

1. Host clicks "Start Game"
2. Verify caller is host
3. Verify minimum 5 players
4. Update room status to 'started'
5. F7-FUNC assigns roles
6. All clients receive real-time update
7. F8-UI displays role reveal

### Implementation Steps

From TASKS.md Phase 4.2 and 4.3:

- Create `lib/startGame.ts`
- Verify caller is host in client
- Verify minimum 5 players
- Update room status to 'started'
- Add Firestore rules for host-only start
- Verify player count in client
- Test that non-hosts cannot start

### Guidelines

- Must validate on server (Firestore rules) in addition to client
- Room status change triggers F8-UI role reveal on all clients

---

## F6-FUNC: Host Transfer

**PRD**: F6-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F4-FUNC (subscribes), F14-FUNC (triggered by leave)

### User Flow

1. Host leaves room (F14-FUNC)
2. Detect when host leaves room
3. Query players ordered by joinedAt
4. Transfer hostId to first player atomically
5. Display toast: "{name} is now the host"

### Implementation Steps

From TASKS.md Phase 3.4:

- Create `lib/transferHost.ts` function
- Detect when host leaves room
- Query players ordered by joinedAt
- Use Firestore transaction for atomic transfer
- Update room hostId to first player
- Show toast: "{name} is now the host"

### Guidelines

- Use Firestore transaction for atomic host transfer
- First player by `joinedAt` timestamp becomes new host
- Toast notification via F12-FUNC

---

## F7-FUNC: Role Assignment

**PRD**: F7-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F5-FUNC (triggered by start), F8-UI (reveals roles), F9-FUNC (visibility)

### User Flow

1. F5-FUNC calls start game
2. Implement role distribution
3. Fisher-Yates shuffle for random assignment
4. Batch write all role updates atomically
5. All clients receive real-time update
6. F8-UI displays role cards

### Role Distribution

| Players | Liberals | Fascists | Hitler |
| ------- | -------- | -------- | ------ |
| 5       | 3        | 2        | 1      |
| 6       | 4        | 2        | 1      |
| 7       | 4        | 3        | 1      |
| 8       | 5        | 3        | 1      |
| 9       | 5        | 4        | 1      |
| 10      | 6        | 4        | 1      |

### Implementation Steps

From TASKS.md Phase 4.2:

- Create `lib/startGame.ts` (same as F5-FUNC)
- Implement role distribution (5-10 players)
- Fisher-Yates shuffle for random assignment
- Batch write all role updates atomically
- Update room status to 'started'

### Guidelines

- Roles belong in player documents, never in room documents
- Fisher-Yates ensures uniform distribution
- Batch write ensures all clients see consistent state

---

## F8-UI: Role Reveal Card

**PRD**: F8-UI in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F7-FUNC (assigns roles), F9-UI (visible players), F9-FUNC (visibility logic)

### UI State

**Liberal:**

```
┌─────────────────────────────────────────┐
│           YOU ARE A LIBERAL              │
│        ┌─────────────────┐               │
│        │   💙 LIBERAL    │               │
│        └─────────────────┘               │
│  Your mission: Enact 5 liberal policies  │
│  or find and eliminate Hitler.           │
│           [View Role]                    │
└─────────────────────────────────────────┘
```

**Fascist (sees teammates):**

```
┌─────────────────────────────────────────┐
│          YOU ARE A FASCIST               │
│        ┌─────────────────┐               │
│        │   👤 FASCIST    │               │
│        └─────────────────┘               │
│  Your teammates:                         │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Bob                            │  │
│  │ 👤 Charlie (Hitler)               │  │
│  └────────────────────────────────────┘  │
│           [View Role]                    │
└─────────────────────────────────────────┘
```

**Hitler (5-6 players, sees fascists):**

```
┌─────────────────────────────────────────┐
│          YOU ARE HITLER                  │
│        ┌─────────────────┐               │
│        │   🕵️ HITLER    │               │
│        └─────────────────┘               │
│  Your teammates:                         │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Bob (Fascist)                  │  │
│  └────────────────────────────────────┘  │
│  Act like a liberal to survive.          │
│           [View Role]                    │
└─────────────────────────────────────────┘
```

**Hitler (7-10 players, sees nothing):**

```
┌─────────────────────────────────────────┐
│          YOU ARE HITLER                  │
│        ┌─────────────────┐               │
│        │   🕵️ HITLER    │               │
│        └─────────────────┘               │
│  You do NOT know who your teammates are. │
│  Act like a liberal to survive.          │
│           [View Role]                    │
└─────────────────────────────────────────┘
```

### User Flow

1. Game starts (F5-FUNC/F7-FUNC)
2. Subscribe to own player document
3. Role card appears with fade-in animation (500ms)
4. Auto-hide after 7 seconds
5. Player can tap "View Role" anytime to see again

### Role Reveal Behavior

| Behavior           | Specification                                                  |
| ------------------ | -------------------------------------------------------------- |
| Initial display    | Role card appears with animation (fade in + scale up)          |
| Auto-hide timeout  | 7 seconds (fixed duration)                                     |
| Timer pause        | Pauses while user is interacting with the card                 |
| Manual dismiss     | Tap anywhere outside card to dismiss early                     |
| Subsequent views   | Each "View Role" tap shows card for 7 seconds, then auto-hides |
| Fade out animation | 300ms                                                          |

### Implementation Steps

From TASKS.md Phase 5.1 and 5.2:

- Create `components/RoleReveal.tsx`
- Subscribe to own player document
- Trigger role reveal when role is assigned
- Handle role reveal animation (fade in + scale up, 500ms)
- Show "You are a [ROLE]" message
- Style based on role (colors, icons)
- "View Role" button to re-display anytime
- Implement 7-second auto-hide timer
- Pause timer on user interaction
- Fade out animation when hiding (300ms)
- Tap outside card to dismiss early

### Guidelines

- Create `hooks/usePlayer.ts` to subscribe to own player document
- Role card shows teammates based on F9-FUNC visibility logic

---

## F8-PRIVACY: Minimal Game View (Privacy)

**PRD**: F8-PRIVACY in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F8-UI (after role card hides), F9-UI (visible players)

### UI State

After role card auto-hides:

```
┌─────────────────────────────────────────┐
│  Room: ABC123           (Started)        │
│─────────────────────────────────────────│
│  Players (5):                            │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Alice (Host)                   │  │
│  │ 👤 Bob                            │  │
│  │ 👤 Charlie                        │  │
│  │ 👤 Diana                          │  │
│  │ 👤 You                            │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │         VIEW MY ROLE               │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │        RESET GAME                  │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │        QUIT GAME                   │  │
│  └────────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### User Flow

1. Role card auto-hides after 7 seconds
2. Minimal view displays
3. Player names only (no role icons)
4. "View My Role" button visible
5. Host sees Reset/Quit buttons

### Implementation Steps

From TASKS.md Phase 5.5:

- Show player list (names only, no roles) after role card hides
- Show "View My Role" button
- Nothing that reveals role to phone peekers
- Host sees Reset/Quit buttons

### Guidelines

- Privacy is critical: no information visible that could be exploited by phone peekers
- Player list shows names only, no role indicators

---

## F9-UI: Visible Players Display

**PRD**: F9-UI in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F8-UI (role card), F9-FUNC (visibility logic)

### UI State

Shown within role card for fascists/Hitler:

```
│  Your teammates:                         │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Bob                            │  │
│  │ 👤 Charlie (Hitler)               │  │
│  └────────────────────────────────────┘  │
```

### User Flow

1. Role card displays (F8-UI)
2. F9-FUNC determines who user can see
3. Allies displayed within role card
4. Hidden from liberals

### Implementation Steps

From TASKS.md Phase 5.4:

- Show allied players for fascists (names + roles)
- Show allied players for Hitler (5-6p only)
- Hide allied info from liberals
- Display in role card after role card hides

### Guidelines

- Allies shown only within role card, not in minimal game view
- Uses F9-FUNC visibility logic

---

## F9-FUNC: Role Visibility Logic

**PRD**: F9-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F7-FUNC (assigns roles), F8-UI (displays), F9-UI (formats display)

### User Flow

1. Role assigned (F7-FUNC)
2. Client requests own player document
3. F9-FUNC filters visible players based on role
4. F9-UI displays formatted list

### Visibility Rules

| Role           | Sees                              |
| -------------- | --------------------------------- |
| Liberal        | Own role only (empty allies list) |
| Fascist        | Other fascists and Hitler         |
| Hitler (5-6p)  | Fascists only                     |
| Hitler (7-10p) | Nothing extra                     |

### Implementation Steps

From TASKS.md Phase 5.3:

- Create `lib/getVisiblePlayers.ts`
- Implement fascist visibility (sees fascists + Hitler)
- Implement Hitler visibility (sees fascists only in 5-6 player games)
- Handle liberal (sees nothing)

### Guidelines

- Visibility is filtered client-side, not server-side (except Firestore rules)
- F11-FUNC adds server-side validation

---

## F10-FUNC: Game Reset Logic

**PRD**: F10-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F5-UI (trigger), F7-FUNC (reassigns), F8-UI (re-reveals)

### User Flow

1. Host taps "Reset Game"
2. Confirmation dialog (F5-UI)
3. Host confirms
4. All roles cleared (set to null)
5. Re-shuffle and assign new random roles (F7-FUNC)
6. Room status stays 'started'
7. All clients receive real-time update
8. Role cards re-display with new roles

### Implementation Steps

From TASKS.md Phase 6.2:

- Create `lib/resetGame.ts` function
- Clear all roles (set to null)
- Re-shuffle and assign new random roles
- Room status stays 'started'
- All clients receive real-time update

### Guidelines

- Hitler can get Hitler again on reset (it's random)
- Uses same role assignment logic as F7-FUNC

---

## F11-FUNC: Firestore Security Rules

**PRD**: F11-FUNC in `plans/prd.json`
**Page**: Infrastructure (Firestore rules)
**Connected Features**: All features

### Security Rules Summary

| Rule              | Description                             |
| ----------------- | --------------------------------------- |
| Room read         | Only players in room can read that room |
| Room status write | Only host can update room status        |
| Role read         | Players can only read their own role    |
| Fascist role read | Fascists can read other fascist roles   |
| Hitler role read  | Fascists can read Hitler's role         |
| Role write        | Only host can assign/clear roles        |
| Room delete       | Only host can delete room               |

### Implementation Steps

From TASKS.md Phase 7.1:

- Write comprehensive `firebase.rules`
- Test all access patterns
- Move from test mode to locked mode
- Verify no unauthorized access possible

### Guidelines

- Validate on server (Firestore rules) in addition to client
- Test thoroughly: Security rules must be verified before production

---

## F12-UI: Toast Notification Display

**PRD**: F12-UI in `plans/prd.json`
**Page**: Shared (all pages)
**Connected Features**: F12-FUNC (logic), F4-UI, F6-FUNC, F13-UI, F15-FUNC

### Toast Notifications

| Event         | Message                  |
| ------------- | ------------------------ |
| Player joined | "{name} joined"          |
| Player left   | "{name} left"            |
| Host changed  | "{name} is now the host" |
| Game started  | "Game started!"          |
| Game reset    | "New round started"      |
| Room deleted  | "Room has been deleted"  |
| Error         | Error-specific message   |

### UI State

Toast slides in from top, auto-dismisses after 3 seconds.

### Implementation Steps

From TASKS.md Phase 7.2:

- Create `components/Toast.tsx`
- Display '{name} joined' notification
- Display '{name} left' notification
- Display '{name} is now the host' notification
- Display 'Game started!' notification
- Display 'New round started' notification
- Display error messages
- Auto-dismiss after 3 seconds
- Slide in animation from top

---

## F12-FUNC: Toast Logic

**PRD**: F12-FUNC in `plans/prd.json`
**Page**: Shared (all pages)
**Connected Features**: F12-UI (display), All features that need notifications

### User Flow

1. Any feature triggers a toast event
2. addToast function called with message
3. Toast displays
4. Auto-dismiss after 3 seconds

### Implementation Steps

From TASKS.md Phase 7.2:

- Create `contexts/ToastContext.tsx`
- Create `hooks/useToast.ts`
- Expose addToast function globally
- Handle auto-dismiss timer
- Handle manual dismiss

### Guidelines

- Use ToastContext at app level
- Toast component uses portal to render at root

---

## F13-UI: Share Button

**PRD**: F13-UI in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F13-FUNC (logic), F4-UI (lobby display)

### UI State

From `docs/ui-flow.md`:

- Share button in header
- Shows copy-to-clipboard feedback
- Offers Web Share API on mobile

### User Flow

1. User taps "Share" button
2. Copy full URL to clipboard
3. Show feedback (e.g., "Copied!")
4. On mobile, offer native share

### Implementation Steps

From TASKS.md Phase 3.5:

- Create `components/ShareButton.tsx`
- Display share button in lobby/game
- Show copy-to-clipboard feedback
- Offer Web Share API on mobile
- Display full URL: `https://app.com/room/ABC123`

---

## F13-FUNC: Share/Copy Link Logic

**PRD**: F13-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F13-UI (trigger)

### User Flow

1. F13-UI triggers share
2. Copy full URL to clipboard
3. Detect Web Share API support
4. Use native share on mobile if available

### Implementation Steps

From TASKS.md Phase 3.5:

- Copy full URL to clipboard
- Detect Web Share API support
- Use native share on mobile if available

### Guidelines

- URL format: `https://app.com/room/ABC123`
- The room code is case-sensitive in the URL

---

## F14-FUNC: Leave Room

**PRD**: F14-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F4-FUNC (subscribes), F6-FUNC (may trigger host transfer)

### User Flow

1. User taps "Leave Room"
2. Set `leftAt` timestamp on player document (do NOT delete)
3. Do NOT decrement playerCount
4. If host leaving: trigger F6-FUNC host transfer
5. Redirect to home page

### Implementation Steps

From TASKS.md Phase 3.3:

- Create `lib/leaveRoom.ts`
- Set `leftAt` timestamp on player document (do NOT delete)
- Do NOT delete player document
- Do NOT decrement playerCount
- Handle host leaving (trigger host transfer)

### Guidelines

- Never decrement playerCount (causes race conditions)
- Player document remains for audit trail
- Host leaving triggers automatic host transfer

---

## F15-UI: Error States UI

**PRD**: F15-UI in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F15-FUNC (logic), F20-FUNC (triggers room deleted)

### UI States

**Room Not Found:**

```
┌─────────────────────────────────────────┐
│     Room "XYZ999" not found.            │
│     [Go Back Home]                       │
└─────────────────────────────────────────┘
```

**Room Full:**

```
┌─────────────────────────────────────────┐
│     This room is full (10 players).     │
│     [Go Back Home]                       │
└─────────────────────────────────────────┘
```

**Game Already Started:**

```
┌─────────────────────────────────────────┐
│     This game has already started.       │
│     [Go Back Home]                       │
└─────────────────────────────────────────┘
```

**Room Deleted:**

```
┌─────────────────────────────────────────┐
│     This room no longer exists.         │
│     The host may have quit.             │
│     [Go Back Home]                       │
└─────────────────────────────────────────┘
```

### Implementation Steps

From TASKS.md Phase 7.3:

- Display 'Room not found' error page
- Display 'Room is full' error page
- Display 'Game already started' error page
- Display 'Room has been deleted' error page
- Display 'Go Back Home' button on all error pages

---

## F15-FUNC: Error Handling Logic

**PRD**: F15-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F15-UI (display), All features that can error

### User Flow

1. Error occurs (room not found, full, started, deleted, network, auth)
2. F15-FUNC determines error type
3. F15-UI displays appropriate error page
4. User can go back home

### Implementation Steps

From TASKS.md Phase 7.3:

- Handle room not found error
- Handle room full error
- Handle game already started error
- Handle room deleted error
- Handle network errors
- Handle auth errors

### Guidelines

- Each error type triggers correct UI
- Toast notifications for recoverable errors

---

## F16-FUNC: Reconnection During Game

**PRD**: F16-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F4-FUNC (resubscribes), F8-UI (shows role)

### User Flow

1. Player returns to room URL after disconnect
2. Firebase Auth restores session (same UID)
3. Room subscription re-established
4. Player document subscription re-established
5. If game started: Role card displays
6. If lobby: Player list displays

### Implementation Steps

From TASKS.md Phase 6.4:

- Player can return to room URL anytime
- Role is preserved in Firestore
- Re-subscribe displays role with visibility rules

### Guidelines

- Firebase anonymous auth persists across refreshes
- Role data survives reconnection because it's stored in Firestore

---

## F17-UI: Theme Toggle

**PRD**: F17-UI in `plans/prd.json`
**Page**: Shared (header/navigation)
**Connected Features**: F18-UI (mobile), F25-UI (desktop)

### UI State

- Sun icon for light theme
- Moon icon for dark theme
- System icon for auto theme
- Cycles through themes on click

### Implementation Steps

From TASKS.md Phase 7.5:

- Display theme toggle in header/navigation
- Show sun icon for light theme
- Show moon icon for dark theme
- Show system icon for auto theme
- Cycle through themes on click
- Persist theme preference to localStorage
- Apply theme to document root

### Guidelines

- Use CSS media query for system preference detection
- Tailwind dark mode configuration

---

## F18-UI: Mobile Optimization

**PRD**: F18-UI in `plans/prd.json`
**Page**: Shared (all pages)
**Connected Features**: F17-UI (theme), F25-UI (desktop contrast)

### Mobile Guidelines

- Single column layout on mobile
- Full-width buttons
- Touch-friendly targets (min 44px)
- Safe area insets for notched devices

### Implementation Steps

From TASKS.md Phase 7.6:

- Test on mobile browsers (iOS Safari, Chrome Android)
- Touch-friendly button sizes (min 44px)
- Safe area insets
- Viewport handling

---

## F19-UI: Loading States

**PRD**: F19-UI in `plans/prd.json`
**Page**: Shared (all pages)
**Connected Features**: F4-FUNC (initial load), F2-FUNC, F3-FUNC, F5-FUNC

### Loading States

- "Loading room..." text for initial load
- Button loading states during actions
- Role assignment loading state

### Implementation Steps

From TASKS.md Phase 7.4:

- Display "Loading room..." text for initial load
- Show button loading states during actions
- Show role assignment loading state

---

## F20-FUNC: Delete Room (Quit Game)

**PRD**: F20-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F5-UI (trigger), F15-UI (error display)

### User Flow

1. Host taps "Quit Game"
2. Confirmation dialog with warning
3. Host confirms
4. Room document deleted from Firestore
5. All clients redirected to home page
6. Error toast: "Room has been deleted"

### Implementation Steps

From TASKS.md Phase 6.3:

- Create `lib/deleteRoom.ts` function
- Confirmation dialog with warning
- Delete room document from Firestore
- Redirect all clients to home page

### Guidelines

- Only host can delete room
- Other clients see "Room has been deleted" error

---

## F21-FUNC: Background Room Cleanup

**PRD**: F21-FUNC in `plans/prd.json`
**Page**: Infrastructure (background)
**Connected Features**: F2-FUNC, F20-FUNC

### User Flow

1. Room created: `createdAt` timestamp stored
2. Rooms inactive for 2+ hours marked for cleanup
3. Host action deletes room immediately
4. Client-side check on join shows informational message for orphaned rooms

### Implementation Steps

From TASKS.md Phase 1.2:

- Mark rooms inactive for 2+ hours as candidates for cleanup
- Host action deletes room immediately
- Client-side check on join shows informational message for orphaned rooms
- Unit test: createdAt timestamp is stored on room creation

### Guidelines

- This is a soft cleanup, not immediate deletion
- Orphaned rooms can be rejoined if host reconnects

---

## F22-OPT: Performance Optimization

**PRD**: F22-OPT in `plans/prd.json`
**Page**: Shared (components)
**Connected Features**: F4-UI (PlayerList), F8-UI (RoleCard)

### Optimization Targets

- PlayerList component
- RoleCard component
- Firestore listeners

### Implementation Steps

From TASKS.md Phase 7.8:

- React.memo on PlayerList component to minimize re-renders
- React.memo on RoleCard component
- Unsubscribe Firestore listeners in useEffect cleanup
- Optimize Firestore reads by subscribing to specific documents only

### Guidelines

- Only memoize when profiling shows re-renders are a problem
- Listener cleanup is critical to prevent memory leaks

---

## F23-UI: Player List Animations

**PRD**: F23-UI in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F4-UI (player list)

### Animation Specs

| Element       | Animation           | Duration |
| ------------- | ------------------- | -------- |
| Player join   | Slide in from right | 300ms    |
| Player leave  | Fade out            | 200ms    |
| Button states | Opacity/transform   | 150ms    |

### Implementation Steps

From TASKS.md Phase 7.3:

- Player join: slide in from right animation (300ms)
- Player leave: fade out animation (200ms)
- Button state transitions: opacity/transform (150ms)

---

## F24-UI: Page Transitions

**PRD**: F24-UI in `plans/prd.json`
**Page**: Shared (all pages)
**Connected Features**: F2-UI, F3-UI (navigation)

### Animation Specs

- Fade animation between pages (200ms)
- Smooth navigation transitions

### Implementation Steps

From TASKS.md Phase 7.3:

- Fade animation between pages (200ms)
- Smooth navigation transitions

---

## F25-UI: Desktop Layout

**PRD**: F25-UI in `plans/prd.json`
**Page**: Shared (all pages)
**Connected Features**: F17-UI (theme), F18-UI (mobile contrast)

### Desktop Guidelines

- Centered container (max-width: 480px) on desktop
- Comfortable spacing on larger screens
- Hover states on interactive elements

### Implementation Steps

From TASKS.md Phase 7.6:

- Centered container (max-width: 480px) on desktop
- Comfortable spacing on larger screens
- Hover states on interactive elements

---

## F26-FUNC: Mass Disconnect Edge Case

**PRD**: F26-FUNC in `plans/prd.json`
**Page**: `/room/[roomId]`
**Connected Features**: F4-FUNC (subscriptions), F16-FUNC (reconnection)

### User Flow

1. All non-host players disconnect
2. Room persists with host only
3. Host can still start game if others reconnect
4. Handle scenario gracefully without errors

### Implementation Steps

From TASKS.md Phase 7.7:

- Detect when all non-host players disconnect
- Room persists with host only
- Host can still start game if others reconnect
- Handle scenario gracefully without errors

### Guidelines

- Firebase anonymous auth will auto-reconnect
- Room data persists in Firestore

---

## Feature Dependencies Summary

Before implementing, ensure dependencies are complete:

| Feature    | Must Have First                                 |
| ---------- | ----------------------------------------------- |
| F1         | Firebase setup, AuthContext                     |
| F2-UI      | F1, Navbar component                            |
| F2-FUNC    | F1                                              |
| F3-UI      | F1, F2-FUNC, Navbar component                   |
| F3-FUNC    | F1, F2-FUNC                                     |
| F4-UI      | F1, F2-FUNC, F3-FUNC, F4-FUNC, Navbar component |
| F4-FUNC    | F1, F2-FUNC, F3-FUNC                            |
| F4-UX      | F4-UI                                           |
| F5-UI      | F4-UI                                           |
| F5-FUNC    | F4-UI, F4-FUNC                                  |
| F6-FUNC    | F4-FUNC                                         |
| F7-FUNC    | F5-FUNC                                         |
| F8-UI      | F7-FUNC                                         |
| F8-PRIVACY | F8-UI                                           |
| F9-UI      | F8-UI, F9-FUNC                                  |
| F9-FUNC    | F7-FUNC                                         |
| F10-FUNC   | F5-UI, F7-FUNC                                  |
| F11-FUNC   | (can be written anytime, tested at end)         |
| F12-UI     | F12-FUNC                                        |
| F12-FUNC   | (can be written anytime, used by many)          |
| F13-UI     | F4-UI                                           |
| F13-FUNC   | F13-UI                                          |
| F14-FUNC   | F4-FUNC                                         |
| F15-UI     | F4-FUNC                                         |
| F15-FUNC   | F15-UI                                          |
| F16-FUNC   | F4-FUNC                                         |
| F17-UI     | (can be written anytime)                        |
| F18-UI     | (can be written anytime)                        |
| F19-UI     | (can be written anytime)                        |
| F20-FUNC   | F5-UI                                           |
| F22-OPT    | F4-UI, F8-UI                                    |
| F23-UI     | F4-UI                                           |
| F24-UI     | (can be written anytime)                        |
| F25-UI     | (can be written anytime)                        |
| F26-FUNC   | F4-FUNC                                         |
