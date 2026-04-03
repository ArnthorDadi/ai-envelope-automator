# Frontend Component Guidelines

These rules apply when creating or modifying React components in this codebase.

## 1. File Naming Convention

Use kebab-case for all component filenames with the `.tsx` extension.

**Rules:**

- Single word: `navbar.tsx` → `Navbar`
- Two words: `user-profile.tsx` → `UserProfile`
- Three+ words: `create-room-form.tsx` → `CreateRoomForm`

**Examples:**

| Component Name | Filename               |
| -------------- | ---------------------- |
| Navbar         | `navbar.tsx`           |
| UserProfile    | `user-profile.tsx`     |
| CreateRoomForm | `create-room-form.tsx` |

## 2. Decompose Layouts into Logical Sections

Every visual section of a layout MUST be its own component. Split based on the visual structure of the page — if a human
would describe the UI as having distinct areas, each area is a separate component.

**Rule**: A component's JSX return should read like a table of contents of its visual sections, not contain the
implementation details of each section inline.

**Example — Page with two columns:**

```tsx
// CORRECT: Each visual section is its own component
function MemberPage() {
  return (
    <div className={css({ display: 'flex', gap: '6' })}>
      <MemberSidebar />
      <MemberContent />
    </div>
  )
}
```

```tsx
// WRONG: Inline implementation of both sections in one component
function MemberPage() {
  return (
    <div className={css({ display: 'flex', gap: '6' })}>
      <div>
        <Avatar ... />
        <p>{member.name}</p>
        <ul>{member.contacts.map(...)}</ul>
      </div>
      <div>
        <Tabs ...>
          <TabContent>{/* 50 lines of JSX */}</TabContent>
        </Tabs>
      </div>
    </div>
  );
}
```

**Example — Section with sub-sections:**

```tsx
// CORRECT: Nested decomposition follows the same rule
function MemberSidebar() {
  return (
    <div className={css({ display: 'flex', flexDir: 'column', gap: '4' })}>
      <MemberProfile />
      <MemberContactInfo />
    </div>
  )
}
```

**When to stop splitting**: A component that renders a single cohesive piece of UI (one card, one form field, one list)
does NOT need further splitting. Split sections, not atoms.

## 3. Colocate Hooks with the Components That Use Their Data

Place data-fetching hooks and stateful hooks in the **lowest component** that actually needs the data. Never hoist data
fetching to a parent just to pass it down.

**Why**: When a hook's state changes, React re-renders the component that owns the hook AND all of its children. Placing
hooks lower in the tree keeps the re-render boundary small.

**Example — Dashboard with independent data sections:**

```tsx
// CORRECT: Each section fetches its own data
// When activity data updates, only ActivityFeed re-renders
function Dashboard() {
  return (
    <div>
      <StatsSummary />
      <ActivityFeed />
      <UpcomingEvents />
    </div>
  )
}

function StatsSummary() {
  const { data } = useSuspenseQuery(StatsQuery) // owns its own data
  return <div>...</div>
}

function ActivityFeed() {
  const { data } = useSuspenseQuery(ActivityQuery) // owns its own data
  return <div>...</div>
}

function UpcomingEvents() {
  const { data } = useSuspenseQuery(EventsQuery) // owns its own data
  return <div>...</div>
}
```

```tsx
// WRONG: Parent fetches everything, all children re-render on any data change
function Dashboard() {
  const { data: stats } = useSuspenseQuery(StatsQuery)
  const { data: activity } = useSuspenseQuery(ActivityQuery)
  const { data: events } = useSuspenseQuery(EventsQuery)

  return (
    <div>
      <StatsSummary data={stats} />
      <ActivityFeed data={activity} />
      <UpcomingEvents data={events} />
    </div>
  )
}
```

**The same rule applies to local state:**

```tsx
// CORRECT: Search state lives in the component that uses it
function MemberList() {
  return (
    <div>
      <MemberSearchBar /> {/* owns search state + filters the query */}
      <MemberTable /> {/* owns its own query, reads search params from URL */}
    </div>
  )
}

// WRONG: Hoisting state to parent causes both children to re-render on every keystroke
function MemberList() {
  const [search, setSearch] = useState('')
  return (
    <div>
      <MemberSearchBar value={search} onChange={setSearch} />
      <MemberTable search={search} />
    </div>
  )
}
```

**Exception**: When multiple sibling components genuinely need the same data from a single query, fetch in the parent
and pass down — but this should be the exception, not the default.

## 4. Conditional Rendering: Always Use Ternary with `null`

When conditionally rendering UI, ALWAYS use the ternary operator with `null` as the falsy branch. The false branch MUST
be `null` — never another component, never `undefined`, never an empty fragment.

**The only allowed pattern:**

```tsx
{
  condition ? <Component /> : null
}
```

**Example — Showing a badge conditionally:**

```tsx
// CORRECT
{
  isPremium ? <PremiumBadge /> : null
}

// CORRECT — wrapping multiple elements
{
  hasPermission ? (
    <div>
      <EditButton />
      <DeleteButton />
    </div>
  ) : null
}
```

**WRONG — using `&&` operator:**

```tsx
// WRONG: && can render "0" or "false" as text when condition is falsy non-boolean
{
  count && <ItemList />
} // renders "0" when count is 0
{
  name && <Greeting />
} // renders "" when name is empty string
{
  isActive && <ActiveBadge />
} // works but violates the pattern — don't use
```

**Why not `&&`**: The `&&` operator returns the left operand when falsy. For non-boolean values (`0`, `""`, `NaN`), this
renders unwanted text in the DOM. Enforcing ternary-with-null universally eliminates this entire class of bugs without
needing to think about the type of the condition.

**WRONG — rendering alternative UI in the false branch:**

```tsx
// WRONG: Do not use ternary to switch between two components
{
  isLoading ? <Spinner /> : <Content />
}
```

**Why**: Ternary switching between two components makes the JSX harder to scan and hides branching logic inline.
Instead, extract the branching logic:

```tsx
// CORRECT: Use early return or separate the concerns
function MySection() {
  if (isLoading) {
    return <Spinner />
  }

  return <Content />
}

// CORRECT: For truly independent conditional elements, use separate ternaries
{
  isLoading ? <Spinner /> : null
}
{
  isReady ? <Content /> : null
}
```

**Summary of allowed vs. disallowed patterns:**

| Pattern                            | Allowed? |
| ---------------------------------- | -------- |
| `{condition ? <UI /> : null}`      | YES      |
| `{condition && <UI />}`            | NO       |
| `{condition ? <A /> : <B />}`      | NO       |
| `{condition ? <UI /> : undefined}` | NO       |
| `{condition ? <UI /> : <></>}`     | NO       |

## 5. Folder Structure

Group related components into feature-based folders. Each folder should contain components
that belong to the same feature or page.

**Rules:**

- Use lowercase folder names matching the feature/page (e.g., `login/`, `home/`, `auth/`)
- Export components via `index.ts` barrel files for cleaner imports
- Keep shared/reusable components in a `shared/` folder
- Keep layout components (Navbar, Providers, Logo) in a `layout/` folder

**Current structure:**

```
components/
├── auth/           # Auth-related components (UserSection, LogoutButton, AuthPrompt)
│   ├── index.ts
│   └── *.tsx
├── home/           # Home page components (CreateRoomButton, HeroSection)
│   ├── index.ts
│   └── *.tsx
├── login/          # Login page components (LoginForm, LoginButton, BackButton)
│   ├── index.ts
│   └── *.tsx
├── layout/         # Layout components (Navbar, Logo, Providers)
│   ├── index.ts
│   └── *.tsx
└── shared/         # Shared components (Spinner, Toast)
    ├── index.ts
    └── *.tsx
```

**Barrel file pattern (login/index.ts):**

```tsx
export { LoginButton } from './login-button'
export { LoginForm } from './login-form'
export { BackButton } from './back-button'
```

**Import from barrel:**

```tsx
import { LoginButton, LoginForm } from '@/components/login'
```

## 6. Test Co-location

Place test files in the same directory as the components they test. This keeps tests
close to the code they verify and makes them easier to find.

**Rules:**

- Test file naming: `<component-name>.test.tsx` in the same folder as `<component-name>.tsx`
- Use relative imports in tests to avoid barrel file issues: `import { Component } from './component'`

**Example:**

```
components/
├── login/
│   ├── login-form.tsx
│   ├── login-form.test.tsx    # Co-located test
│   ├── login-button.tsx
│   ├── login-button.test.tsx  # Co-located test
│   └── index.ts
```
