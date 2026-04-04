# Handoff: Frontend Test-Ready — Sprint 1

## Summary

All Phase 1 frontend tickets (SCRUM-10, SCRUM-22, SCRUM-14, SCRUM-18, SCRUM-21) have been implemented. The web app is fully functional with mock data and ready for QA testing.

## Pages / Routes Implemented

| Route | Screen | Auth Required |
|-------|--------|---------------|
| `/sign-in` | Sign in (Google + email/password) | No |
| `/sign-up` | Sign up with Zod validation | No |
| `/onboarding` | Create or Join Household | Yes |
| `/lists` | Lists overview with status filter tabs | Yes |
| `/lists/[id]` | List detail with items, drag-and-drop, quick-add | Yes |
| `/household` | Household settings, members, invites | Yes |
| `/profile` | User profile, dark mode toggle, sign out | Yes |

## Components Created

### UI Components (`src/components/ui/`)
Button, Input, Label, Card, Badge, Skeleton, Separator, Avatar, Dialog, DropdownMenu, Toast/Toaster/useToast, Tabs, Checkbox, Select, Textarea, Switch, Collapsible, Alert, AlertDialog

### Layout Components (`src/components/layout/`)
- `app-shell.tsx` — Responsive layout with sidebar (desktop) and bottom nav (mobile)
- `sidebar.tsx` — Desktop navigation (w-64, fixed left)
- `bottom-nav.tsx` — Mobile bottom tabs (h-16, fixed bottom)
- `header.tsx` — Mobile header with branding

### Feature Components (`src/components/features/`)
- `empty-state/` — Icon + message + optional CTA
- `loading-skeleton/` — 4 variants: list-cards, list-items, members, profile
- `error-state/` — Error message + retry button
- `page-header/` — Title + action buttons

### Auth Components
- `theme-provider.tsx` — Dark mode via next-themes
- `auth-guard.tsx` — Protected route wrapper

### Hooks (`src/hooks/`)
- `use-household.ts` — TanStack Query hooks for household CRUD
- `use-lists.ts` — TanStack Query hooks for lists and items CRUD

### Stores (`src/stores/`)
- `lists-store.ts` — Zustand store for lists UI state (filter, dialog)

### Lib (`src/lib/`)
- `utils.ts` — cn() helper
- `firebase.ts` — Firebase SDK initialization
- `auth-context.tsx` — AuthProvider + useAuth hook
- `api-client.ts` — Fetch wrapper with Bearer token injection
- `query-provider.tsx` — TanStack Query client provider
- `validations/auth.ts` — Zod schemas for sign-in/sign-up

## How to Test

### Prerequisites
```bash
pnpm install
pnpm --filter=web dev    # starts on port 3000
```

### Manual Test Steps

1. **Auth flow**: Visit `/sign-in` — verify Google button and email form render. Navigate to `/sign-up` — verify validation (password min 8, uppercase, number, confirm match). Submit redirects to `/onboarding`.

2. **Onboarding**: Verify two cards (Create / Join). Submit "Create" with a name — redirects to `/lists` with success toast. Test empty validation.

3. **Lists overview**: Verify mock lists appear with Active filter default. Switch tabs (Active, Completed, All). Click "New List" — dialog opens, create and verify redirect.

4. **List detail**: Click a list card — verify items render with checkboxes. Toggle checkbox (optimistic update). Test quick-add input (type + Enter). Test drag-and-drop reorder. Open actions menu (Complete, Archive, Delete with confirmation). Click an item to open edit form — verify name, quantity, unit, notes fields.

5. **Household**: Verify members list with avatars and role badges. Test edit household name (pencil icon). Test invite dialog (generate code, copy). Test remove member confirmation dialog.

6. **Profile**: Verify avatar, name, email display. Edit name and save. Toggle dark mode. Test sign out with confirmation.

7. **Responsive**: Test all pages at mobile (<768px) and desktop (>=768px) widths. Verify bottom nav vs sidebar switching.

8. **Accessibility**: Tab through all interactive elements. Verify focus styles, aria labels, skip-to-content link.

## Deviations from UI_DESIGN.md

- **i18n**: Text is hardcoded in English for Sprint 1. The `next-intl` package is installed but i18n key system is not wired yet — planned for a dedicated i18n pass.
- **Swipe actions on mobile**: Item swipe-to-delete is not implemented (requires gesture library). Desktop hover actions and context menu cover the functionality.
- **Bottom sheet on mobile for dialogs**: All modals use Dialog on both mobile and desktop. Bottom sheet (Sheet component) was not added to avoid additional complexity. Can be added in a follow-up.
- **Password visibility toggle**: Not implemented on sign-in/sign-up. Can be added as a minor enhancement.
- **Web Share API**: Invite sharing falls back to clipboard copy if Web Share API is unavailable.

## Known Limitations

- **Mock data**: All API hooks use `USE_MOCK = true` flag. When the backend is ready, set this to `false` in `src/hooks/use-household.ts` and `src/hooks/use-lists.ts`.
- **Auth redirect logic**: The onboarding redirect (if user has no household → go to `/onboarding`) is not automated yet — requires backend `/users/me` endpoint to check household membership.
- **Firebase not configured**: Google sign-in and email auth require valid Firebase project credentials in `.env.local`.
- **No tests**: Unit and integration tests have not been written for this sprint.

## Verification

```bash
pnpm --filter=web tsc --noEmit   # passes
pnpm --filter=web lint            # passes (zero warnings)
pnpm --filter=web test            # passes (no test files yet)
```
