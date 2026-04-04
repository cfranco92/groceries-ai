# Handoff: UI/UX Design Specifications for Phase 1 — Sprint 1

## Context

This is the first sprint of GroceriesAI. We need comprehensive UI/UX specifications for all Phase 1 screens before the frontend developer can begin implementation. The app is a household grocery management tool used primarily by families in Spanish-speaking countries, on mobile devices while shopping.

## Target Agent

**UX Designer** (`.claude/agents/ux-designer.md`)

## Your Deliverable

Create `docs/UI_DESIGN.md` — a comprehensive UI/UX specification document covering all screens listed below. Use the design specification template from your agent file for each screen.

## Context Files to Read First

1. `CLAUDE.md` — Project conventions (i18n, styling, component library)
2. `docs/FEATURES.md` — Phase 1 features (sections 1.1 through 1.5)
3. `docs/API_DESIGN.md` — API endpoints (understand what data is available per screen)
4. `docs/DATA_MODEL.md` — Entities and relationships
5. `docs/ARCHITECTURE.md` — Auth flow, household model

## Screens Required

### 1. Authentication Screens

#### 1.1 Sign In Page
- Google sign-in button (primary CTA)
- Email/password form (secondary option)
- "Don't have an account?" link to sign-up
- App branding/logo at the top
- Must work well on mobile (full-screen, centered)

#### 1.2 Sign Up Page
- Email/password registration form
- Fields: email, password, confirm password, display name
- Form validation with Zod (show specs for validation rules)
- "Already have an account?" link to sign-in

### 2. Onboarding Flow (post-registration)

#### 2.1 Onboarding: Create or Join Household
- After first sign-in, user must either:
  - **Create a household** (enters household name) -> becomes ADMIN
  - **Join a household** (enters invite code) -> becomes MEMBER
- This is a required step; user cannot proceed without a household
- Simple, focused screen with two clear options

### 3. Main App Layout

#### 3.1 App Shell / Layout
- **Mobile**: Bottom navigation bar with icons + labels
  - Tabs: Lists, Household, Profile (3 tabs for Phase 1; Receipts and Insights added in Phase 2-3)
- **Desktop**: Sidebar navigation
- Header with app name and optional actions
- Main scrollable content area
- The layout should be designed to accommodate future tabs (Receipts, Insights) without redesign

### 4. Shopping Lists Screens

#### 4.1 Lists Overview (Home)
- List of all shopping lists grouped/filtered by status (Active, Completed, Archived)
- Each list card shows: name, item count, checked count, created by, date
- FAB or prominent button to create a new list
- Empty state when no lists exist
- Filter/tab bar for status filtering

#### 4.2 Create List Dialog/Modal
- Simple modal or bottom sheet
- Single field: list name
- Create button

#### 4.3 List Detail (items view)
- List header: name, status badge, actions (edit, complete, archive, delete)
- Items list with:
  - Checkbox to mark as checked/unchecked
  - Item name, quantity, unit
  - Swipe actions or menu for edit/delete
  - Checked items visually distinct (strikethrough, muted)
  - Notes indicator if item has notes
- Add item input at the bottom (sticky) — quick add pattern
- Reorder capability (drag handle)
- Group by category if product is linked (nice-to-have for Phase 1)

#### 4.4 Add/Edit Item Form
- Can be inline (quick add at bottom of list) or modal for full edit
- Fields: name (with autocomplete against product catalog in Phase 2), quantity, unit (dropdown), notes
- Unit selector: UNIT, KG, LB, G, L, ML, OZ, DOZEN, PACK

### 5. Household Screens

#### 5.1 Household Settings Page
- Household name (editable by ADMIN)
- Members list with: avatar, name, email, role badge (ADMIN/MEMBER)
- Remove member button (ADMIN only, with confirmation)
- Invite section:
  - "Invite member" button
  - Generate invite code / share link
  - List of pending invites with cancel option
- Leave household option (for non-admin members)

### 6. User Profile Screen

#### 6.1 Profile / Settings Page
- User info: avatar, display name (editable), email (read-only)
- Household info (link to household settings)
- Sign out button
- Future: language switcher, dark mode toggle, notification preferences

### 7. Common Components & States

Specify these for every screen:
- **Loading state**: Skeleton components with `aria-busy="true"`
- **Empty state**: Illustration/icon + descriptive message + CTA
- **Error state**: Error message + retry button
- **Toast notifications**: For success/error actions (item added, list created, etc.)

## Design Constraints

1. **Mobile-first**: The app will be used while shopping. Design for one-handed use on phones.
2. **Touch targets**: Minimum 44x44px for all interactive elements.
3. **Quick add**: Adding an item to a list should take < 3 taps.
4. **i18n ready**: All text must be specified as i18n keys (English default, Spanish supported). Provide both translations.
5. **Color system**: Green primary (grocery/fresh), Red destructive, Amber warning, consistent with Tailwind/shadcn theme.
6. **Accessibility**: WCAG 2.1 AA — color contrast, keyboard navigation, screen reader labels.
7. **Component library**: Use shadcn/ui components as base. Reference them by name (Button, Card, Dialog, Input, Toast, etc.).

## Open Questions for You to Resolve

1. Should the "Add item" flow be inline at the bottom of the list, or a modal? Consider mobile UX.
2. Should checked items be moved to the bottom of the list automatically, or stay in place?
3. What's the best pattern for the onboarding flow — a multi-step wizard or a single screen with two options?
4. Should the list detail view show items grouped by category, or in a flat list with manual reorder?
5. What empty state illustrations/messages would work best for a grocery app?

## Acceptance Criteria

- [ ] `docs/UI_DESIGN.md` created with specs for ALL screens listed above
- [ ] Each screen has: purpose, ASCII wireframe, component list, states (loading/empty/error/success), user flow, responsive behavior, i18n keys, accessibility notes
- [ ] Design decisions documented for all open questions
- [ ] Color system and typography defined
- [ ] Component inventory listing all shadcn/ui components needed for Phase 1
- [ ] Navigation structure clearly defined for mobile and desktop
