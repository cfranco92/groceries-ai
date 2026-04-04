# Handoff: Frontend Implementation — Sprint 1

## Context

Sprint 1 covers the full Phase 1 frontend: Next.js setup, Firebase auth, household management UI, and shopping lists UI. This handoff is **blocked** until the UX Designer produces `docs/UI_DESIGN.md` — read that document before starting implementation.

## Target Agent

**Frontend Developer** (`.claude/agents/frontend-developer.md`)

## Context Files to Read First

1. `CLAUDE.md` — Project conventions (App Router, components, state management)
2. `docs/UI_DESIGN.md` — **Primary reference** — UI specs from the UX Designer (must exist before starting)
3. `docs/API_DESIGN.md` — API endpoints you'll consume
4. `docs/ARCHITECTURE.md` — Auth flow, system overview
5. `packages/shared-types/src/` — Shared TypeScript interfaces (populated by backend developer)
6. `apps/web/package.json` — Current dependencies (already has React, Next, shadcn deps)

## Tickets Covered

| Ticket | Summary | Priority |
|--------|---------|----------|
| SCRUM-10 | Set up Next.js web app with Tailwind CSS and shadcn/ui | 1 (do first) |
| SCRUM-22 | Build base UI layout, navigation, and shared components | 2 |
| SCRUM-14 | Implement Firebase Auth on frontend | 3 |
| SCRUM-18 | Build Household management UI and onboarding flow | 4 |
| SCRUM-21 | Build Shopping Lists UI (create, view, manage items) | 5 |

## Dependencies

- **UX Designer** must complete `docs/UI_DESIGN.md` before you start SCRUM-22, 18, 21
- **DevOps** should complete monorepo scaffolding (SCRUM-9) before you start
- **Backend** endpoints for SCRUM-18 and SCRUM-21 may not be ready yet — use mock data / TanStack Query with placeholder API functions that can be connected later
- `packages/shared-types` should export enums and interfaces — import them

## Implementation Order and Requirements

### Step 1: SCRUM-10 — Next.js App Setup

Scaffold the Next.js application in `apps/web/src/`.

**Requirements:**
- App Router structure in `src/app/`
- Tailwind CSS configured (`tailwind.config.ts`, `postcss.config.js`, `globals.css`)
- shadcn/ui initialized with base components:
  - Button, Input, Label, Card, Dialog, Toast, Dropdown Menu, Skeleton, Badge
  - Run `npx shadcn@latest init` and add components
- Path aliases in `tsconfig.json`:
  - `@/components/*`, `@/lib/*`, `@/hooks/*`, `@/stores/*`, `@/styles/*`
- Dark mode support via `class` strategy in Tailwind config
- Custom theme tokens matching GroceriesAI color system (green primary — see UI_DESIGN.md)
- Base `layout.tsx` with:
  - HTML lang attribute
  - Font setup (Inter or similar)
  - Metadata (title, description)
  - ThemeProvider for dark mode

**Acceptance Criteria:**
- `pnpm --filter=web dev` starts on port 3000
- Home page renders with Tailwind styles working
- shadcn/ui components render correctly
- Dark mode toggle works
- Path aliases resolve correctly
- `pnpm --filter=web lint` passes
- `pnpm --filter=web tsc --noEmit` passes

### Step 2: SCRUM-22 — Base UI Layout & Navigation

Follow `docs/UI_DESIGN.md` for layout specs.

**Requirements:**
- App shell layout component:
  - **Mobile**: Bottom navigation bar (Lists, Household, Profile tabs)
  - **Desktop**: Sidebar navigation
  - Responsive switching via Tailwind breakpoints
- Navigation items with icons (Lucide React) and labels
- Active route highlighting
- Main content area (scrollable)
- Header component (app name, optional action buttons)
- Shared components:
  - `EmptyState` — icon + message + optional CTA button
  - `LoadingSkeleton` — configurable skeleton with `aria-busy`
  - `ErrorState` — error message + retry button
  - `PageHeader` — title + optional action buttons
- Toast provider configured (using shadcn Toast)

**Acceptance Criteria:**
- Layout renders correctly on mobile and desktop
- Navigation works between tabs
- Shared components are reusable and documented
- All components follow `ComponentName/index.tsx` pattern

### Step 3: SCRUM-14 — Firebase Auth

**Requirements:**
- Firebase SDK config in `src/lib/firebase.ts` (using `NEXT_PUBLIC_FIREBASE_*` env vars)
- Auth providers: Google sign-in + email/password
- Pages:
  - `/auth/sign-in` — Sign in page (Google button + email form)
  - `/auth/sign-up` — Sign up page (email, password, confirm password, display name)
- Auth context/provider (`src/lib/auth-context.tsx`):
  - Wraps the app
  - Provides: `user`, `loading`, `signIn`, `signUp`, `signInWithGoogle`, `signOut`
  - Listens to `onAuthStateChanged`
  - Stores Firebase ID token for API calls
- Protected route middleware or layout:
  - Redirect to `/auth/sign-in` if not authenticated
  - Redirect to `/` if already authenticated and visiting auth pages
  - Show loading state while auth initializes
- API client (`src/lib/api-client.ts`):
  - Axios or fetch wrapper
  - Automatically attaches Firebase ID token to `Authorization: Bearer <token>` header
  - Base URL from `NEXT_PUBLIC_API_URL`
  - Consistent error handling
- Form validation with Zod:
  - Sign up: email (valid email), password (min 8 chars), confirm password (matches), displayName (min 2)
  - Sign in: email, password
- React Hook Form integration for both forms

**Acceptance Criteria:**
- Google sign-in works (redirects to Google, returns with token)
- Email/password sign-up and sign-in work
- Protected routes redirect correctly
- Auth state persists on page refresh
- Sign out clears state and redirects
- API client sends auth headers
- Form validation shows inline errors
- Loading state shown while auth initializes

### Step 4: SCRUM-18 — Household Management UI

**Requirements:**
- Onboarding flow (shown after first sign-in if user has no household):
  - `/onboarding` page with two options: Create or Join
  - Create: form with household name
  - Join: form with invite code
  - Redirect to home after completion
- Household settings page (`/household`):
  - Household name (editable by ADMIN)
  - Members list with avatars, names, roles
  - Remove member button (ADMIN only, with confirmation dialog)
  - Invite section: generate invite button, display code/link, share functionality
  - Pending invites list with cancel option (ADMIN only)
- TanStack Query hooks:
  - `useHousehold()` — GET /households/me
  - `useCreateHousehold()` — POST /households
  - `useJoinHousehold()` — POST /households/join
  - `useInviteMember()` — POST /households/me/invite
  - `useCancelInvite()` — DELETE /households/me/invites/:id
  - `useRemoveMember()` — DELETE /households/me/members/:userId

**Note:** If the backend API is not ready yet, create the query hooks with placeholder functions that return mock data. Structure them so connecting to the real API is just changing the fetch function.

**Acceptance Criteria:**
- Onboarding flow works for both create and join paths
- Household settings page shows all members
- Invite generation and display work
- ADMIN-only actions are conditionally rendered based on user role
- Confirmation dialog before destructive actions (remove member, cancel invite)
- All states handled: loading, empty, error

### Step 5: SCRUM-21 — Shopping Lists UI

**Requirements:**
- Lists overview page (`/` or `/lists`):
  - List of shopping lists (cards or rows)
  - Status filter tabs (All, Active, Completed, Archived)
  - FAB or button to create new list
  - Each list shows: name, item count, checked count, created by, date
  - Empty state when no lists
- Create list dialog:
  - Modal/dialog with list name input
  - Create button
- List detail page (`/lists/[id]`):
  - List header: name, status badge, actions menu (edit, complete, archive, delete)
  - Items list with checkboxes
  - Checked items visually distinct (strikethrough, muted color)
  - Quick-add item input at the bottom (sticky on mobile)
  - Swipe or menu actions per item (edit, delete)
  - Drag-and-drop reorder (using a library like @dnd-kit)
  - Delete confirmation dialog for list
- Add/Edit item form:
  - Fields: name, quantity (number input), unit (select dropdown), notes (textarea)
  - Unit options from UnitType enum
- TanStack Query hooks:
  - `useLists(status?)` — GET /lists
  - `useList(id)` — GET /lists/:id
  - `useCreateList()` — POST /lists
  - `useUpdateList()` — PATCH /lists/:id
  - `useDeleteList()` — DELETE /lists/:id
  - `useAddItem()` — POST /lists/:listId/items
  - `useUpdateItem()` — PATCH /lists/:listId/items/:itemId
  - `useReorderItems()` — PATCH /lists/:listId/items/reorder
  - `useDeleteItem()` — DELETE /lists/:listId/items/:itemId
- Optimistic updates for check/uncheck and add item (instant feedback)
- Zustand store for UI state (selected filter, modal open state)

**Acceptance Criteria:**
- Full list CRUD via UI
- Full item CRUD via UI
- Check/uncheck with optimistic updates
- Reorder works with drag and drop
- Status filtering works
- All states handled (loading skeletons, empty states, errors)
- Mobile-friendly (touch targets, sticky input, responsive layout)
- Follows UI_DESIGN.md specifications

## After Completion

Create `docs/handoffs/test-ready-sprint-1-web.md` describing:
- All pages/routes implemented
- Components created
- How to test (manual steps)
- Any deviations from UI_DESIGN.md
- Known limitations or mock data still in use
