# Implementation Tasks

Step-by-step implementation plan for Secret Hitler Digital Roles.
Order matters: complete each phase before moving to the next.

---

## Phase 1: Project Setup

### 1.1 Initialize Next.js Project

- [ ] Create Next.js app with TypeScript
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint
  ```
- [ ] Configure path aliases (`@/` → `./`)
- [ ] Set up folder structure (app/, components/, lib/, contexts/)

### 1.2 Configure Firebase

- [ ] Create Firebase project in Firebase Console
- [ ] Enable Firestore in test mode (initially)
- [ ] Enable Anonymous Authentication
- [ ] Install Firebase SDK
  ```bash
  npm install firebase
  ```
- [ ] Create `lib/firebase.ts` with initialization
- [ ] Add environment variables to `.env.local` (template in `.env.example`)

### 1.3 Set Up Authentication

- [ ] Implement anonymous sign-in on app load
- [ ] Create auth context/provider
- [ ] Handle auth state changes
- [ ] Persist auth across page refreshes (Firebase handles this)

### 1.4 Verify Setup

- [ ] Run dev server and confirm app loads
- [ ] Confirm Firebase connection works
- [ ] Confirm anonymous auth generates UID

---

## Phase 2: Room System

### 2.1 Room Creation

- [ ] Create `lib/createRoom.ts` function
- [ ] Generate 6-character room codes (chars: ABCDEFGHJKLMNPQRSTUVWXYZ23456789)
- [ ] Create room document in Firestore (roomId = room code)
- [ ] Add creator as host player
- [ ] Handle creation errors

### 2.2 Room Joining

- [ ] Create `lib/joinRoom.ts` function
- [ ] Validate room code format (uppercase, 6 chars, valid chars)
- [ ] Check room exists and is in lobby state
- [ ] Add player to room (merge: true for reconnection)
- [ ] Handle join errors (not found, full, started)
- [ ] Use atomic increment for playerCount (NOT read-modify-write)

### 2.3 Room Page

- [ ] Create `/room/[roomId]/page.tsx`
- [ ] Read roomId from params
- [ ] Validate user is authenticated
- [ ] Handle room not found error
- [ ] Handle unauthorized access

### 2.4 Room Navigation

- [ ] Update home page with Create/Join UI
- [ ] Redirect to room page after create
- [ ] Redirect to room page after join
- [ ] Handle deep links (`/room/ABC123`) - auto-join flow

---

## Phase 3: Real-time Lobby

### 3.1 Firestore Listeners

- [ ] Create `lib/subscribeToRoom.ts`
- [ ] Implement `onSnapshot` for room document
- [ ] Implement `onSnapshot` for players subcollection
- [ ] Create combined subscription hook
- [ ] Handle disconnection/reconnection

### 3.2 Lobby UI

- [ ] Display room code
- [ ] Show list of players with names
- [ ] Indicate who is the host (⭐ badge)
- [ ] Show player count vs minimum (5)
- [ ] Real-time updates when players join/leave
- [ ] Toast notifications for join/leave

### 3.3 Leave Room

- [ ] Add "Leave Room" button
- [ ] Set `leftAt` timestamp on player document (do NOT delete)
- [ ] DO NOT decrement playerCount (causes race conditions)
- [ ] Handle host leaving (transfer to first player)

### 3.4 Host Transfer

- [ ] Create `lib/transferHost.ts` function
- [ ] Use Firestore transaction for atomic transfer
- [ ] Query players ordered by joinedAt
- [ ] Update room hostId to first player
- [ ] Show toast: "{name} is now the host"

### 3.5 Share Room Code

- [ ] Copy full URL to clipboard (e.g., `https://app.com/room/ABC123`)
- [ ] Share via Web Share API (mobile)
- [ ] Display share button

---

## Phase 4: Game Start

### 4.1 Start Game Button (Host Only)

- [ ] Show "Start Game" button only for host
- [ ] Disable if fewer than 5 players
- [ ] Show "Need X more players" message

### 4.2 Role Assignment Logic

- [ ] Create `lib/startGame.ts`
- [ ] Implement role distribution (5-10 players)
- [ ] Fisher-Yates shuffle for random assignment
- [ ] Batch write all role updates atomically
- [ ] Update room status to 'started'

### 4.3 Start Game Security

- [ ] Verify host in client
- [ ] Add Firestore rules for host-only start
- [ ] Verify player count in client
- [ ] Test that non-hosts cannot start

### 4.4 Game Start Feedback

- [ ] Show loading state while starting
- [ ] Handle start errors gracefully
- [ ] Display role reveal card

---

## Phase 5: Role Visibility

### 5.1 Role Subscription

- [ ] Subscribe to own player document
- [ ] Trigger role reveal when role is assigned
- [ ] Handle role reveal animation (fade in + scale up, 500ms)

### 5.2 Role Display

- [ ] Create role reveal UI component (RoleCard)
- [ ] Show "You are a [ROLE]" message
- [ ] Style based on role (colors, icons)
- [ ] "View Role" button to re-display anytime
- [ ] Implement 7-second auto-hide timer
- [ ] Pause timer on user interaction
- [ ] Fade out animation when hiding (300ms)
- [ ] Tap outside card to dismiss early

### 5.3 Visibility Logic

- [ ] Create `lib/getVisiblePlayers.ts`
- [ ] Implement fascist visibility (sees fascists + Hitler)
- [ ] Implement Hitler visibility (sees fascists only in 5-6 player games)
- [ ] Handle liberal (sees nothing)

### 5.4 Visible Players Display

- [ ] Show allied players for fascists (names + roles)
- [ ] Show allied players for Hitler (5-6p only)
- [ ] Hide from liberals
- [ ] Display player names

### 5.5 Minimal Game View

- [ ] Show player list (names only, no roles) after role card hides
- [ ] Show "View My Role" button
- [ ] Nothing that reveals role to phone peekers
- [ ] Host sees Reset/Quit buttons

### 5.6 Investigation

- [ ] Create `lib/investigate.ts` function
- [ ] Implement investigation logic (game started, not self)
- [ ] Return "fascist" or "liberal" (Hitler as fascist)
- [ ] Create `investigate-button.tsx` component
- [ ] Add investigate button to game view

---

## Phase 6: Game Reset

### 6.1 Reset Button (Host Only)

- [ ] Show "Reset Game" button only for host
- [ ] Show "Quit Game" button only for host
- [ ] Confirmation dialog before reset

### 6.2 Reset Logic

- [ ] Create `lib/resetGame.ts` function
- [ ] Clear all roles (set to null)
- [ ] Re-shuffle and assign new random roles
- [ ] Room status stays 'started'
- [ ] All clients receive real-time update

### 6.3 Quit Game

- [ ] Create `lib/deleteRoom.ts` function
- [ ] Confirmation dialog with warning
- [ ] Delete room document from Firestore
- [ ] Redirect all clients to home page

### 6.4 Reconnection During Game

- [ ] Player can return to room URL anytime
- [ ] Role is preserved in Firestore
- [ ] Re-subscribe displays role with visibility rules

---

## Phase 7: Polish & Production

### 7.1 Firestore Security Rules

- [ ] Write comprehensive `firebase.rules`
- [ ] Test all access patterns
- [ ] Move from test mode to locked mode
- [ ] Verify no unauthorized access possible

### 7.2 Toast Notifications

- [ ] Create Toast component
- [ ] "Player joined" / "Player left"
- [ ] "Game started" / "New round started"
- [ ] Error messages
- [ ] Auto-dismiss after 3s

### 7.3 Error Handling

- [ ] Room not found
- [ ] Room full (10 players)
- [ ] Game already started
- [ ] Room deleted (host quit)
- [ ] Network errors
- [ ] Auth errors

### 7.4 Loading States

- [ ] "Loading room..." text
- [ ] Button loading states
- [ ] Role assignment loading

### 7.5 Theme Support

- [ ] Detect system preference (dark/light)
- [ ] CSS media query for theming
- [ ] Tailwind dark mode configuration

### 7.6 Mobile Optimization

- [ ] Test on mobile browsers (iOS Safari, Chrome Android)
- [ ] Touch-friendly button sizes (min 44px)
- [ ] Safe area insets
- [ ] Viewport handling

### 7.7 Edge Cases

- [ ] Exactly 5 players (minimum)
- [ ] Exactly 10 players (maximum)
- [ ] Host disconnect during game
- [ ] All players except host disconnect

### 7.8 Performance

- [ ] Minimize re-renders (React.memo where needed)
- [ ] Unsubscribe listeners on unmount
- [ ] Optimize Firestore reads

### 7.9 Deployment

- [ ] Set up Firebase project properly
- [ ] Configure hosting
- [ ] Set environment variables in production
- [ ] Test in production

---

## Phase 8: Future Enhancements (Post-MVP)

These are NOT part of MVP scope:

- [ ] Policy deck and voting mechanics
- [ ] Presidential powers
- [ ] Win/lose conditions
- [ ] Game history
- [ ] Player avatars
- [ ] Kicking players
- [ ] shadcn/ui component library
- [ ] i18n support
- [ ] Profanity filter for names

---

## Testing Checklist

Before considering feature complete:

### Room System

- [ ] Create room → get room code
- [ ] Join room with valid code
- [ ] Join room with invalid code → error
- [ ] Join room with full room → error
- [ ] Join room with started game → error
- [ ] Deep link join works

### Real-time

- [ ] See other players joining in real-time
- [ ] Toast notifications appear
- [ ] Multiple browsers → real-time sync works

### Leave/Host Transfer

- [ ] Leave room → `leftAt` set
- [ ] Host leaves → first player becomes host
- [ ] Toast shows host transfer

### Game Start

- [ ] Start game with <5 players → button disabled
- [ ] Start game as non-host → button hidden
- [ ] Start game as host → roles assigned

### Role Visibility

- [ ] Liberal sees own role, nothing else
- [ ] Fascist sees other fascists and Hitler
- [ ] Hitler (5-6p) sees fascists
- [ ] Hitler (7-10p) sees nothing extra

### Reset

- [ ] Host can reset game
- [ ] Roles are re-shuffled
- [ ] Previous roles cleared
- [ ] Toast shows "New round started"

### Quit

- [ ] Host can quit game
- [ ] Room is deleted
- [ ] Other players see "Room deleted" error

### Reconnection

- [ ] Refresh page → state persists
- [ ] Navigate away and back → role preserved
- [ ] Anonymous auth persists across refreshes

---

## File Checklist

```
app/
├── layout.tsx                     # Root layout with providers
├── page.tsx                       # Home (Create/Join)
├── room/
│   └── [roomId]/
│       ├── page.tsx               # Room/Lobby/Game view
│       └── loading.tsx           # Loading state

components/
├── CreateRoomForm.tsx             # Create room form
├── JoinRoomForm.tsx               # Join room form
├── Lobby.tsx                      # Lobby view
├── PlayerList.tsx                 # Player list with host indicator
├── RoleReveal.tsx                 # Role card display
├── ShareButton.tsx                # Copy link / share
├── Toast.tsx                      # Toast notifications
├── ConfirmDialog.tsx              # Confirmation modals
└── Button.tsx                     # Reusable button

lib/
├── firebase.ts                    # Firebase init
├── auth.ts                        # Auth helpers
├── createRoom.ts                  # Create room
├── joinRoom.ts                    # Join room (with atomic increment)
├── leaveRoom.ts                   # Leave room (set leftAt)
├── transferHost.ts                # Host transfer logic
├── startGame.ts                   # Start game + assign roles
├── resetGame.ts                   # Reset game (clear + re-shuffle)
├── deleteRoom.ts                  # Quit game
├── subscribeToRoom.ts             # Firestore listeners
├── getVisiblePlayers.ts           # Visibility filtering
├── utils.ts                       # Room code gen, constants
└── toast.ts                       # Toast utilities

contexts/
├── AuthContext.tsx                # Auth provider
└── ToastContext.tsx               # Toast provider

hooks/
├── useRoom.ts                     # Room subscription hook
├── usePlayers.ts                  # Players subscription hook
├── usePlayer.ts                   # Own player subscription hook
└── useToast.ts                   # Toast hook

firebase.rules                      # Security rules
.env.local                         # Environment variables (NEVER COMMIT)
.env.example                       # Template for env vars
```

---

## Notes for AI Agents

1. **ENV FILES ARE OFF-LIMITS**: Never read, write, or access `.env` or `.env.local` files. Only reference variable names (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`). Never log or output actual values.

2. **Always use Firestore listeners** (`onSnapshot`), never polling

3. **Roles belong in player documents**, never in room documents

4. **Use atomic operations**: Use `increment()` for playerCount, never read-modify-write

5. **Don't decrement playerCount**: Set `leftAt` instead of deleting documents or decrementing count

6. **Roles are per-player**: Each player has their own role field, visibility filtered by client

7. **Validate on server** (Firestore rules) in addition to client

8. **Unsubscribe from listeners** in `useEffect` cleanup

9. **MVP only**: Don't implement voting, policies, or game mechanics beyond role reveal/reset

10. **Test thoroughly**: Security rules must be verified before production

11. **Theme support**: Use Tailwind's `dark:` classes with system preference detection

12. **Toast notifications**: Use context for global toast state
