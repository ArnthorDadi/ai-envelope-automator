# UI Flow

## User Journey Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      HOME PAGE                               │
│                   "Create" or "Join"                        │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
          ▼                             ▼
   ┌─────────────┐               ┌─────────────┐
   │ CREATE ROOM │               │  JOIN ROOM   │
   └──────┬──────┘               └──────┬──────┘
          │                             │
          │         ┌───────────────────┘
          │         │
          ▼         ▼
   ┌─────────────────────────────────────┐
   │            LOBBY VIEW                │
   │     (Waiting for players)            │
   │                                      │
   │  - Room code displayed              │
   │  - Player list (names only)         │
   │  - "Start Game" button (host only)  │
   │  - Share deep link UI               │
   └──────────────────┬──────────────────┘
                      │
        (Host clicks with ≥5 players)
                      │
                      ▼
   ┌─────────────────────────────────────┐
   │         GAME VIEW                    │
   │                                      │
   │  - "You are a [ROLE]"              │
   │  - Fascist sees: other fascists     │
   │  - Hitler (5-6p) sees: fascists     │
   │  - Liberal sees: nothing extra      │
   │  - "View My Role" button            │
   │  - "Reset Game" button (host only)  │
   │  - "Quit Game" button (host only)   │
   └─────────────────────────────────────┘
```

## Page: Home (`/`)

### Create Room Flow

1. User clicks "Create Room"
2. System creates Firebase anonymous auth session
3. System generates 6-char room code
4. System creates room document in Firestore
5. System creates player document (host)
6. System navigates to `/room/[roomId]`

### Join Room Flow

1. User taps deep link OR enters room code (6 characters)
2. User enters display name
3. System validates room exists and is in "lobby" state
4. System creates player document
5. System navigates to `/room/[roomId]`

### UI States

```
┌─────────────────────────────────────────┐
│                                          │
│     SECRET HITLER                        │
│     Digital Roles                        │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         CREATE ROOM                │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │    Room Code: [______]             │  │
│  │    Your Name:  [______]            │  │
│  │    ┌────────────────────────────┐ │  │
│  │    │          JOIN ROOM         │ │  │
│  │    └────────────────────────────┘ │  │
│  └────────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

### Name Input Rules

- Maximum 20 characters
- Alphanumeric characters and spaces only
- No profanity filter (MVP)

## Page: Room Lobby (`/room/[roomId]`)

### Who Can See

- All players in the room
- Real-time updates when players join/leave
- Real-time updates when host changes

### Host View

```
┌─────────────────────────────────────────┐
│  Room: ABC123                    [Share]│
│─────────────────────────────────────────│
│                                          │
│  Players (3/5 needed):                   │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Alice (Host) ⭐                │  │
│  ├────────────────────────────────────┤  │
│  │ 👤 Bob                            │  │
│  ├────────────────────────────────────┤  │
│  │ 👤 Charlie                        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Waiting for 2 more players...           │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │      START GAME (disabled)         │  │
│  │      Need 5 players to start       │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │           LEAVE ROOM              │  │
│  └────────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

### Non-Host View

```
┌─────────────────────────────────────────┐
│  Room: ABC123                    [Share]│
│─────────────────────────────────────────│
│                                          │
│  Players (3/5 needed):                   │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Alice (Host) ⭐                │  │
│  ├────────────────────────────────────┤  │
│  │ 👤 Bob                            │  │
│  ├────────────────────────────────────┤  │
│  │ 👤 You                            │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Waiting for 2 more players...           │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │    Waiting for host to start...   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │           LEAVE ROOM              │  │
│  └────────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

### Share Button

Tapping "Share" copies deep link to clipboard:

```
https://yourapp.com/room/ABC123
```

On mobile, also offers Web Share API for native sharing.

### Real-time Updates

- Player list updates instantly when someone joins/leaves
- Toast: "Bob joined the room" / "Charlie left"
- Host badge (⭐) updates if host changes
- "Start Game" button enables when 5+ players

### Host Transfer

If host leaves:

1. Toast: "Alice left. Bob is now the host."
2. First player in list becomes new host
3. New host sees "Start Game" button

## Page: Game View (`/room/[roomId]`)

### Trigger

- Host clicks "Start Game"
- All clients receive real-time update
- Room status changes to "started"

### Role Card

After game starts, role card appears with animation.

**Liberal:**

```
┌─────────────────────────────────────────┐
│                                          │
│           YOU ARE A LIBERAL              │
│                                          │
│        ┌─────────────────┐               │
│        │   💙 LIBERAL    │               │
│        └─────────────────┘               │
│                                          │
│  Your mission: Enact 5 liberal policies  │
│  or find and eliminate Hitler.           │
│                                          │
│           [View Role]                    │
│                                          │
└─────────────────────────────────────────┘
```

**Fascist (sees teammates):**

```
┌─────────────────────────────────────────┐
│          YOU ARE A FASCIST               │
│                                          │
│        ┌─────────────────┐               │
│        │   👤 FASCIST    │               │
│        └─────────────────┘               │
│                                          │
│  Your teammates:                         │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Bob                            │  │
│  ├────────────────────────────────────┤  │
│  │ 👤 Charlie (Hitler)               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Your mission: Enact 6 fascist policies  │
│  or elect Hitler as chancellor.          │
│                                          │
│           [View Role]                    │
│                                          │
└─────────────────────────────────────────┘
```

**Hitler (5-6 players, sees fascists):**

```
┌─────────────────────────────────────────┐
│          YOU ARE HITLER                  │
│                                          │
│        ┌─────────────────┐               │
│        │   🕵️ HITLER    │               │
│        └─────────────────┘               │
│                                          │
│  Your teammates:                         │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Bob (Fascist)                  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Act like a liberal to survive.          │
│                                          │
│           [View Role]                    │
│                                          │
└─────────────────────────────────────────┘
```

**Hitler (7-10 players, sees nothing):**

```
┌─────────────────────────────────────────┐
│          YOU ARE HITLER                  │
│                                          │
│        ┌─────────────────┐               │
│        │   🕵️ HITLER    │               │
│        └─────────────────┘               │
│                                          │
│  You do NOT know who your teammates are. │
│  Act like a liberal to survive.          │
│                                          │
│           [View Role]                    │
│                                          │
└─────────────────────────────────────────┘
```

### Role Reveal Behavior

The role reveal has specific timing and interaction rules for privacy:

| Behavior          | Specification                                                  |
| ----------------- | -------------------------------------------------------------- |
| Initial display   | Role card appears with animation (fade in + scale up)          |
| Auto-hide timeout | 7 seconds (fixed duration)                                     |
| Timer pause       | Pauses while user is interacting with the card                 |
| Manual dismiss    | Tap anywhere outside card to dismiss early                     |
| Subsequent views  | Each "View Role" tap shows card for 7 seconds, then auto-hides |
| Reset behavior    | Role card appears again after reset, same timeout applies      |

**Why fixed 7 seconds**: Everyone gets the same time, so it's obvious when everyone is getting their role.

**Minimal game view (after card hides)**:

```
┌─────────────────────────────────────────┐
│  Room: ABC123           (Started)        │
│─────────────────────────────────────────│
│                                          │
│  Players (5):                            │
│  ┌────────────────────────────────────┐  │
│  │ 👤 Alice (Host)                   │  │
│  ├────────────────────────────────────┤  │
│  │ 👤 Bob                            │  │
│  ├────────────────────────────────────┤  │
│  │ 👤 Charlie                        │  │
│  ├────────────────────────────────────┤  │
│  │ 👤 Diana                          │  │
│  ├────────────────────────────────────┤  │
│  │ 👤 You                            │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         VIEW MY ROLE               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        RESET GAME                  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        QUIT GAME                   │  │
│  └────────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

> **Privacy**: The minimal game view shows only player names (no roles). Nothing that could reveal a player's role to someone peeking at their phone.

### "View Role" Button

Tapping "View Role" re-displays the role card:

- Can view anytime during game
- Shows for 7 seconds, then auto-hides
- Timer pauses while interacting
- Tap outside card to dismiss early

### Host Actions

```
┌─────────────────────────────────────────┐
│  Room: ABC123           (Started)        │
│─────────────────────────────────────────│
│                                          │
│  [Role Card Displayed Here]              │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        RESET GAME                  │  │
│  │   Start a new round?              │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        QUIT GAME                   │  │
│  │   End game and delete room?        │  │
│  └────────────────────────────────────┘  │
│                                          │
└─────────────────────────────────────────┘
```

### Reset Game Flow

1. Host taps "Reset Game"
2. Confirmation dialog: "Start a new round with the same players?"
3. Host confirms
4. All roles cleared
5. New random shuffle assigns roles
6. All clients receive real-time update
7. Role cards re-display with new roles

### Quit Game Flow

1. Host taps "Quit Game"
2. Confirmation dialog: "Delete this room? This cannot be undone."
3. Host confirms
4. Room document deleted from Firestore
5. All clients redirected to home page
6. Error toast: "Room has been deleted"

## Reconnection Flow

If player navigates back to room URL after disconnect:

1. Firebase Auth restores session (same UID)
2. Room subscription established
3. Player document subscription established
4. If game started: Role card displays
5. If lobby: Player list displays

## Error States

### Room Not Found

```
┌─────────────────────────────────────────┐
│                                          │
│     Room "XYZ999" not found.            │
│                                          │
│     [Go Back Home]                       │
│                                          │
└─────────────────────────────────────────┘
```

### Room Full

```
┌─────────────────────────────────────────┐
│                                          │
│     This room is full (10 players).     │
│                                          │
│     [Go Back Home]                       │
│                                          │
└─────────────────────────────────────────┘
```

### Game Already Started

```
┌─────────────────────────────────────────┐
│                                          │
│     This game has already started.       │
│                                          │
│     [Go Back Home]                       │
│                                          │
└─────────────────────────────────────────┘
```

### Room Deleted

```
┌─────────────────────────────────────────┐
│                                          │
│     This room no longer exists.         │
│     The host may have quit.             │
│                                          │
│     [Go Back Home]                       │
│                                          │
└─────────────────────────────────────────┘
```

### Disconnected (During Game)

```
┌─────────────────────────────────────────┐
│                                          │
│     You've been disconnected.           │
│                                          │
│     Your role is preserved.             │
│                                          │
│     [Return to Room]                     │
│     [Go Back Home]                       │
│                                          │
└─────────────────────────────────────────┘
```

## Responsive Design

### Mobile (< 640px)

- Single column layout
- Full-width buttons
- Bottom-fixed action bar
- Touch-friendly targets (min 44px)
- Safe area insets for notched devices

### Desktop (≥ 640px)

- Centered container (max-width: 480px)
- Comfortable spacing
- Hover states on interactive elements

## Theme Support

System preference auto-detected via CSS:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1a1a1a;
    --foreground: #ffffff;
  }
}
```

## Animations

| Element          | Animation           | Duration |
| ---------------- | ------------------- | -------- |
| Player join      | Slide in from right | 300ms    |
| Player leave     | Fade out            | 200ms    |
| Role reveal      | Fade in + scale up  | 500ms    |
| Role auto-hide   | Fade out            | 300ms    |
| Toast            | Slide in from top   | 200ms    |
| Button states    | Opacity/transform   | 150ms    |
| Page transitions | Fade                | 200ms    |

## Toast Notifications

| Event         | Message                  |
| ------------- | ------------------------ |
| Player joined | "{name} joined"          |
| Player left   | "{name} left"            |
| Host changed  | "{name} is now the host" |
| Game started  | "Game started!"          |
| Game reset    | "New round started"      |
| Room deleted  | "Room has been deleted"  |
