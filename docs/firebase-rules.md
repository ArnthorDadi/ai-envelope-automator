# Firebase Security Rules

## Overview

Firestore Security Rules protect game integrity by enforcing:

1. Only players in a room can access room data
2. Only the host can start the game or reset
3. Players can only read their own role
4. Fascists can read other fascist roles and Hitler's role
5. Hitler visibility is handled client-side (based on player count)
6. Role assignment is atomic and protected

## Rules Design Principles

### Principle 1: Defense in Depth

Rules are the last line of defense. Even if client code is compromised, rules prevent unauthorized access.

### Principle 2: Minimal Exposure

Each client receives only the data they need. No client gets a full dump of all players and roles.

### Principle 3: Server-Side Validation

Critical operations (game start, role assignment, reset) are validated server-side, not just client-side.

## Security Rules Structure

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Room-level rules
    match /rooms/{roomId} {
      allow read: ...;
      allow create: ...;
      allow update: ...;
      allow delete: ...;

      // Player-level rules (subcollection)
      match /players/{playerId} {
        allow read: ...;
        allow create: ...;
        allow update: ...;
      }
    }
  }
}
```

## Rule Explanations

### Room Read Rule

```javascript
allow read: if isPlayerInRoom(request.auth.uid, roomId);
```

**Why**: Only players who have joined the room should see room data. Prevents strangers from enumerating active rooms.

### Room Create Rule

```javascript
allow create: if request.auth != null
              && request.resource.data.hostId == request.auth.uid
              && request.resource.data.status == 'lobby'
              && request.resource.data.id == roomId;
```

**Why**:

- User must be authenticated (anonymous Firebase auth)
- Creator becomes the host
- Room must start in lobby state
- Room ID in document must match path

### Room Update Rule

```javascript
allow update: if isPlayerInRoom(request.auth.uid, roomId)
              && (
                // Host can change status (start game) or reset
                (isHost(request.auth.uid, roomId)
                  && (resource.data.status == 'lobby' || resource.data.status == 'started')
                  && request.resource.data.status == 'started')
                ||
                // Anyone can update playerCount (join/leave)
                (request.resource.data.keys().hasOnly(['playerCount']))
              );
```

**Why**:

- Only host can modify room status
- Status transitions: lobby → started (stays at started for reset)
- PlayerCount can be updated by anyone (use increment in client)
- Note: No decrement allowed (see schema docs for rationale)

### Room Delete Rule

```javascript
allow delete: if isHost(request.auth.uid, roomId);
```

**Why**: Only host can delete the room (quit game).

### Player Create Rule

```javascript
allow create: if request.auth != null
              && request.resource.data.id == request.auth.uid
              && request.resource.data.role == null
              && roomIsInLobby(roomId);
```

**Why**:

- Player document ID must match their auth UID
- Cannot pre-assign roles (role must be null on join)
- Cannot join a started game

### Player Read Rule (Critical)

```javascript
allow read: if isPlayerInRoom(request.auth.uid, roomId)
           && (
             // Always allow reading own data
             request.auth.uid == playerId
             ||
             // Fascists can see other fascists
             (isFascist(request.auth.uid, roomId) && isFascist(playerId, roomId))
             ||
             // Fascists can see Hitler
             (isFascist(request.auth.uid, roomId) && isHitler(playerId, roomId))
           );
```

**Why**: This is the most complex rule:

- Players can always read their own data (to see their role)
- Fascists can read other fascists' roles
- Fascists can see Hitler's role
- Liberals cannot see anyone's role (except their own)

### Role Assignment Rules

```javascript
allow update: if request.auth.uid == playerId
              && (
                // Player can update their own name
                (request.resource.data.name != resource.data.name
                  && request.resource.data.role == resource.data.role)
                ||
                // Host can assign/clear roles (start game or reset)
                (isHost(request.auth.uid, roomId)
                  && onlyRoleChanged(resource.data, request.resource.data)
                  && isValidRole(request.resource.data.role))
              );
```

**Why**:

- Players can update their own name
- Only host can assign or clear roles
- Only role field can change during role assignment
- Role must be valid (liberal/fascist/hitler/null)
- Clearing roles (setting to null) enables reset

### Visibility: Hitler Seeing Fascists

The Firestore rules do NOT implement Hitler visibility by player count. Instead:

1. **Firestore rules** allow fascists to see Hitler's role
2. **Client-side code** in `getVisiblePlayers.ts` filters based on player count
3. Hitler can read fascist documents when 5-6 players via client logic

This is acceptable because:

- If Hitler is in the game, at least one fascist exists
- The fascist can see Hitler (rules allow this)
- Hitler seeing fascists is a game balance issue, not a security issue

## Helper Functions

These functions are defined in the `firebase.rules` file:

```javascript
function isPlayerInRoom(uid, roomId) {
  return exists(/databases/$(database)/documents/rooms/$(roomId)/players/$(uid));
}

function isHost(uid, roomId) {
  return get(/databases/$(database)/documents/rooms/$(roomId)).data.hostId == uid;
}

function hasRole(uid, roomId, role) {
  return get(/databases/$(database)/documents/rooms/$(roomId)/players/$(uid)).data.role == role;
}

function isFascist(uid, roomId) {
  return hasRole(uid, roomId, 'fascist');
}

function isHitler(uid, roomId) {
  return hasRole(uid, roomId, 'hitler');
}

function roomIsInLobby(roomId) {
  return get(/databases/$(database)/documents/rooms/$(roomId)).data.status == 'lobby';
}

function onlyRoleChanged(oldData, newData) {
  return oldData.name == newData.name
      && oldData.joinedAt == newData.joinedAt
      && oldData.id == newData.id
      && oldData.role != newData.role;
}

function isValidRole(role) {
  return role == null
      || role == 'liberal'
      || role == 'fascist'
      || role == 'hitler';
}
```

## Security Considerations

### Anonymity

- Room IDs are random 6-character codes from a 24-char set (not easily guessable)
- Player UIDs are Firebase-generated (not user-chosen)

### Race Conditions

- `playerCount` uses `increment()` to avoid read-modify-write races
- Host transfer uses transactions to ensure atomicity

### Data Cleanup

Rooms are cleaned up by:

1. Host action (delete room)
2. Client-side checks on join (informational)
3. Future: Cloud Function for periodic cleanup

## Anti-Patterns to Avoid

### DO NOT

```javascript
// ❌ Allow anyone to read room
allow read: if true;

// ❌ Allow any authenticated user to write
allow write: if request.auth != null;

// ❌ Expose all roles in room document
// (roles belong in player documents, not room)

// ❌ Allow clients to set their own role
allow update: if request.auth.uid == playerId;
```

### DO

```javascript
// ✓ Restrict to players only
allow read: if isPlayerInRoom(request.auth.uid, roomId);

// ✓ Validate role assignments server-side
allow update: if isHost(request.auth.uid, roomId);

// ✓ Store roles per-player, not per-room
```

## Testing Rules

Use Firebase Emulator Suite:

```bash
firebase emulators:start
```

### Required Test Scenarios

1. **Non-player cannot read room** - Should be denied
2. **Player can read own role** - Should be allowed
3. **Fascist can see other fascists** - Should be allowed
4. **Fascist can see Hitler** - Should be allowed
5. **Liberal cannot see any roles** - Should only see own
6. **Only host can start game** - Non-host writes should be denied
7. **Roles cannot be changed after game starts** - Via client, not rules
8. **Host can reset game** - By clearing roles
9. **Host can delete room** - Should be allowed

### Manual Test Flow

```typescript
// Test: Non-player access
await expect(readDoc(roomRef)).to.fail() // No player document exists

// Test: Player joins
await setDoc(playerRef, { name: 'Alice', role: null })
await expect(readDoc(roomRef)).to.succeed()

// Test: Role assignment
await updateDoc(playerRef, { role: 'fascist' }) // By host
await expect(readDoc(playerRef)).to.succeed()
```
