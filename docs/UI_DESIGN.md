# GroceriesAI - UI/UX Design Specification (Phase 1)

This document defines the comprehensive UI/UX specifications for all Phase 1 screens. It is the source of truth for the Frontend Developer agent.

---

## Table of Contents

**Phase 1**
1. [Design System](#1-design-system)
2. [Navigation Structure](#2-navigation-structure)
3. [Authentication Screens](#3-authentication-screens)
4. [Onboarding Flow](#4-onboarding-flow)
5. [App Shell / Layout](#5-app-shell--layout)
6. [Shopping Lists Screens](#6-shopping-lists-screens)
7. [Household Screens](#7-household-screens)
8. [User Profile Screen](#8-user-profile-screen)
9. [Common Components & States](#9-common-components--states)
10. [Component Inventory](#10-component-inventory)
11. [Design Decisions](#11-design-decisions)

**Phase 2**
12. [Phase 2 Navigation Update](#12-phase-2-navigation-update)
13. [Phase 2 Design System Extensions](#13-phase-2-design-system-extensions)
14. [Product Catalog Screens](#14-product-catalog-screens)
15. [Receipt Screens](#15-receipt-screens)
16. [Enhanced Add-Item Flow](#16-enhanced-add-item-flow)
17. [Phase 2 Common Components](#17-phase-2-common-components)
18. [Phase 2 Component Inventory](#18-phase-2-component-inventory)
19. [Phase 2 Design Decisions](#19-phase-2-design-decisions)

---

## 1. Design System

### 1.1 Color System (Tailwind CSS Theme Tokens)

```
Primary (Green — fresh, grocery):
  --primary:           142.1 76.2% 36.3%    (hsl) → green-600
  --primary-foreground: 355.7 100% 97.3%

Destructive (Red — delete, danger):
  --destructive:       0 84.2% 60.2%         → red-500
  --destructive-foreground: 0 0% 98%

Warning (Amber — alerts, pending):
  --warning:           38 92% 50%             → amber-500
  --warning-foreground: 38 92% 14%

Success (Green — completed, checked):
  --success:           142.1 70.6% 45.3%      → green-500
  --success-foreground: 0 0% 98%

Muted (Gray — secondary text, backgrounds):
  --muted:             210 40% 96.1%
  --muted-foreground:  215.4 16.3% 46.9%

Background:
  --background:        0 0% 100%
  --foreground:        222.2 84% 4.9%

Card:
  --card:              0 0% 100%
  --card-foreground:   222.2 84% 4.9%

Border:
  --border:            214.3 31.8% 91.4%

Ring (focus):
  --ring:              142.1 76.2% 36.3%      (matches primary)
```

Dark mode tokens follow shadcn/ui defaults with primary green preserved.

### 1.2 Typography

| Role        | Class                          | Size   | Weight  |
| ----------- | ------------------------------ | ------ | ------- |
| Page title  | `text-2xl font-bold`           | 24px   | 700     |
| Section     | `text-lg font-semibold`        | 18px   | 600     |
| Card title  | `text-base font-medium`        | 16px   | 500     |
| Body        | `text-sm`                      | 14px   | 400     |
| Caption     | `text-xs text-muted-foreground`| 12px   | 400     |
| Button      | `text-sm font-medium`          | 14px   | 500     |

Font family: system default (`font-sans` in Tailwind — Inter if loaded, else system stack).

### 1.3 Spacing & Layout

- Base unit: 4px (`space-1`)
- Content padding: `p-4` (16px) on mobile, `p-6` (24px) on desktop
- Card gap: `gap-3` (12px) between list cards
- Section gap: `gap-6` (24px) between page sections
- Max content width: `max-w-2xl` (672px) for forms, `max-w-4xl` (896px) for list views

### 1.4 Elevation & Borders

- Cards: `border rounded-lg` (no shadow on mobile to save visual weight)
- Modals/Sheets: `shadow-lg rounded-t-xl` (bottom sheet on mobile)
- FAB: `shadow-md rounded-full`
- Focus ring: `ring-2 ring-ring ring-offset-2`

### 1.5 Iconography

- Library: **Lucide React**
- Size: 20px (`w-5 h-5`) for inline icons, 24px (`w-6 h-6`) for nav icons
- Stroke width: 2 (default)
- Key icons:
  - Lists: `ShoppingCart`
  - Household: `Home`
  - Profile: `User`
  - Add: `Plus`
  - Check: `Check`
  - Delete: `Trash2`
  - Edit: `Pencil`
  - Settings: `Settings`
  - Back: `ChevronLeft`
  - Menu: `MoreVertical`
  - Drag: `GripVertical`
  - Notes: `StickyNote`
  - Invite: `UserPlus`
  - Sign out: `LogOut`

---

## 2. Navigation Structure

### 2.1 Mobile — Bottom Navigation Bar

```
┌─────────────────────────────────────────┐
│                                         │
│            Main Content                 │
│                                         │
├────────────┬────────────┬───────────────┤
│  🛒 Lists  │  🏠 Home   │  👤 Profile  │
│  (active)  │ Household  │              │
└────────────┴────────────┴───────────────┘
```

- 3 tabs for Phase 1: **Lists**, **Household**, **Profile**
- Active tab: primary color icon + label; inactive: muted-foreground
- Tab bar: `h-16` (64px), fixed to bottom, `border-t`
- Each tab icon: `w-6 h-6`, label: `text-xs`
- Touch target: full tab width × 64px (well above 44px minimum)
- Future tabs (Receipts, Insights) will be added between Household and Profile

### 2.2 Desktop — Sidebar Navigation

```
┌──────────────┬──────────────────────────┐
│  GroceriesAI │                          │
│  ──────────  │                          │
│  🛒 Lists    │     Main Content         │
│  🏠 Household│                          │
│  👤 Profile  │                          │
│              │                          │
│              │                          │
│              │                          │
│  ──────────  │                          │
│  🚪 Sign Out │                          │
└──────────────┴──────────────────────────┘
```

- Sidebar: `w-64` (256px), fixed left, `border-r`
- App logo/name at top
- Nav items: `h-10`, `px-3`, `rounded-md`, hover: `bg-muted`
- Active item: `bg-primary/10 text-primary font-medium`
- Sign out link at sidebar bottom
- Breakpoint: sidebar visible at `md` (768px+), bottom nav below

### 2.3 Route Structure

| Route                     | Screen                  | Auth Required |
| ------------------------- | ----------------------- | ------------- |
| `/sign-in`                | Sign In                 | No            |
| `/sign-up`                | Sign Up                 | No            |
| `/onboarding`             | Create/Join Household   | Yes           |
| `/lists`                  | Lists Overview (Home)   | Yes           |
| `/lists/[id]`             | List Detail             | Yes           |
| `/household`              | Household Settings      | Yes           |
| `/profile`                | Profile / Settings      | Yes           |

Default redirect: authenticated users without a household go to `/onboarding`. Users with a household go to `/lists`.

---

## 3. Authentication Screens

### 3.1 Screen: Sign In

#### Purpose

Authenticate existing users via Google OAuth or email/password.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│                             │
│       🥬 GroceriesAI       │
│    "Smart grocery lists     │
│     for your family"        │
│                             │
│  ┌─────────────────────┐   │
│  │ G  Sign in with Google│  │
│  └─────────────────────┘   │
│                             │
│  ─────── or ────────        │
│                             │
│  Email                      │
│  ┌─────────────────────┐   │
│  │                     │   │
│  └─────────────────────┘   │
│  Password                   │
│  ┌─────────────────────┐   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │     Sign In         │   │
│  └─────────────────────┘   │
│                             │
│  Don't have an account?     │
│  Sign up                    │
│                             │
└─────────────────────────────┘
```

#### Components

| Component                | shadcn/ui Base | Purpose                      |
| ------------------------ | -------------- | ---------------------------- |
| App logo + tagline       | —              | Branding, centered           |
| Google sign-in button    | `Button`       | variant="outline", full width, Google icon |
| Divider with text        | `Separator`    | "or" text between methods    |
| Email input              | `Input`        | type="email"                 |
| Password input           | `Input`        | type="password", toggle visibility icon |
| Sign in button           | `Button`       | variant="default" (primary), full width |
| Link to sign-up          | `Link`         | text-sm, text-primary        |

#### States

- **Loading**: Sign-in button shows `Loader2` spinner, inputs disabled
- **Error**: Inline error below the form using `Alert` variant="destructive" (e.g., "Invalid email or password")
- **Success**: Redirect to `/lists` or `/onboarding`

#### User Flow

1. User opens app → sees sign-in page
2. Option A: Taps "Sign in with Google" → Firebase popup → authenticated → redirect
3. Option B: Enters email + password → taps "Sign In" → Firebase auth → redirect
4. If user has no household → redirect to `/onboarding`
5. If user has household → redirect to `/lists`

#### Responsive Behavior

- **Mobile**: Full screen, content vertically centered, `max-w-sm mx-auto`, `px-6`
- **Desktop**: Centered card (`max-w-md`) on a muted background, `shadow-lg rounded-xl p-8`

#### i18n Keys

```
auth.signIn.title              — "Sign In" / "Iniciar Sesión"
auth.signIn.tagline            — "Smart grocery lists for your family" / "Listas de compras inteligentes para tu familia"
auth.signIn.googleButton       — "Sign in with Google" / "Iniciar sesión con Google"
auth.signIn.divider            — "or" / "o"
auth.signIn.emailLabel         — "Email" / "Correo electrónico"
auth.signIn.emailPlaceholder   — "you@example.com" / "tu@ejemplo.com"
auth.signIn.passwordLabel      — "Password" / "Contraseña"
auth.signIn.submitButton       — "Sign In" / "Iniciar Sesión"
auth.signIn.noAccount          — "Don't have an account?" / "¿No tienes una cuenta?"
auth.signIn.signUpLink         — "Sign up" / "Regístrate"
auth.signIn.error.invalidCredentials — "Invalid email or password" / "Correo o contraseña inválidos"
auth.signIn.error.generic      — "Something went wrong. Please try again." / "Algo salió mal. Inténtalo de nuevo."
```

#### Accessibility Notes

- Form inputs have associated `<label>` elements
- Password field has toggle visibility button with `aria-label="Toggle password visibility"`
- Google button has distinct focus style
- Error messages linked to inputs via `aria-describedby`
- `role="alert"` on error messages for screen reader announcement
- Autofocus on email field on page load

---

### 3.2 Screen: Sign Up

#### Purpose

Register new users with email/password.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│                             │
│       🥬 GroceriesAI       │
│      "Create your account"  │
│                             │
│  Display name               │
│  ┌─────────────────────┐   │
│  │                     │   │
│  └─────────────────────┘   │
│  Email                      │
│  ┌─────────────────────┐   │
│  │                     │   │
│  └─────────────────────┘   │
│  Password                   │
│  ┌─────────────────────┐   │
│  │                     │   │
│  └─────────────────────┘   │
│  Confirm password           │
│  ┌─────────────────────┐   │
│  │                     │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │    Create Account   │   │
│  └─────────────────────┘   │
│                             │
│  Already have an account?   │
│  Sign in                    │
│                             │
└─────────────────────────────┘
```

#### Components

| Component                  | shadcn/ui Base | Purpose                         |
| -------------------------- | -------------- | -------------------------------- |
| App logo + subtitle        | —              | Branding                         |
| Display name input         | `Input`        | Optional but encouraged          |
| Email input                | `Input`        | type="email", required           |
| Password input             | `Input`        | type="password", min 8 chars     |
| Confirm password input     | `Input`        | Must match password              |
| Create account button      | `Button`       | variant="default", full width    |
| Link to sign-in            | `Link`         | text-sm, text-primary            |

#### Validation Rules (Zod Schema)

```typescript
const signUpSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(8).max(72)
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

#### States

- **Loading**: Button shows spinner, all inputs disabled
- **Validation error**: Inline error below each invalid field (red text, `text-destructive text-xs`)
- **Firebase error**: Alert banner below form (e.g., "Email already in use")
- **Success**: Redirect to `/onboarding`

#### User Flow

1. User taps "Sign up" from sign-in page
2. Fills in form fields → real-time validation on blur
3. Taps "Create Account" → Firebase creates user → API auto-provisions DB record
4. Redirect to `/onboarding`

#### Responsive Behavior

- Same layout as Sign In — full screen mobile, centered card desktop

#### i18n Keys

```
auth.signUp.title              — "Create your account" / "Crea tu cuenta"
auth.signUp.displayNameLabel   — "Display name" / "Nombre"
auth.signUp.displayNamePlaceholder — "How should we call you?" / "¿Cómo te llamamos?"
auth.signUp.emailLabel         — "Email" / "Correo electrónico"
auth.signUp.passwordLabel      — "Password" / "Contraseña"
auth.signUp.confirmPasswordLabel — "Confirm password" / "Confirmar contraseña"
auth.signUp.submitButton       — "Create Account" / "Crear Cuenta"
auth.signUp.hasAccount         — "Already have an account?" / "¿Ya tienes una cuenta?"
auth.signUp.signInLink         — "Sign in" / "Inicia sesión"
auth.signUp.validation.displayNameMin — "Name must be at least 2 characters" / "El nombre debe tener al menos 2 caracteres"
auth.signUp.validation.emailInvalid — "Enter a valid email" / "Ingresa un correo válido"
auth.signUp.validation.passwordMin — "Password must be at least 8 characters" / "La contraseña debe tener al menos 8 caracteres"
auth.signUp.validation.passwordUppercase — "Must contain at least one uppercase letter" / "Debe contener al menos una letra mayúscula"
auth.signUp.validation.passwordNumber — "Must contain at least one number" / "Debe contener al menos un número"
auth.signUp.validation.passwordMismatch — "Passwords don't match" / "Las contraseñas no coinciden"
auth.signUp.error.emailInUse   — "This email is already registered" / "Este correo ya está registrado"
```

#### Accessibility Notes

- All validation errors are announced to screen readers via `aria-live="polite"`
- Password requirements displayed as a checklist below password field (visible on focus)
- Confirm password field validated on blur, error linked via `aria-describedby`

---

## 4. Onboarding Flow

### 4.1 Screen: Create or Join Household

#### Purpose

After first sign-in, the user must either create a new household or join an existing one. This is a mandatory gate — the user cannot access the app without a household.

#### Design Decision

**Single screen with two clear options** — not a multi-step wizard. The decision is binary and simple enough for one screen. A wizard adds unnecessary friction for a single choice.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│                             │
│       👋 Welcome!          │
│  "Set up your household     │
│   to start shopping"        │
│                             │
│  ┌───────────────────────┐ │
│  │  🏠                   │ │
│  │  Create a Household   │ │
│  │  Start fresh. You'll  │ │
│  │  be the admin.        │ │
│  │                       │ │
│  │  Household name       │ │
│  │  ┌─────────────────┐ │ │
│  │  │ e.g. Casa Franco│ │ │
│  │  └─────────────────┘ │ │
│  │  [ Create Household ] │ │
│  └───────────────────────┘ │
│                             │
│  ─────── or ────────        │
│                             │
│  ┌───────────────────────┐ │
│  │  🔗                   │ │
│  │  Join a Household     │ │
│  │  Enter an invite code │ │
│  │  from a family member │ │
│  │                       │ │
│  │  Invite code          │ │
│  │  ┌─────────────────┐ │ │
│  │  │ e.g. ABC123XY   │ │ │
│  │  └─────────────────┘ │ │
│  │  [ Join Household ]   │ │
│  └───────────────────────┘ │
│                             │
└─────────────────────────────┘
```

#### Components

| Component              | shadcn/ui Base | Purpose                              |
| ---------------------- | -------------- | ------------------------------------ |
| Welcome heading        | —              | `text-2xl font-bold`, centered       |
| Subtitle               | —              | `text-muted-foreground`, centered    |
| Create card            | `Card`         | CardHeader + CardContent + CardFooter|
| Household name input   | `Input`        | Inside create card                   |
| Create button          | `Button`       | variant="default", full width in card|
| Separator              | `Separator`    | "or" divider                         |
| Join card              | `Card`         | CardHeader + CardContent + CardFooter|
| Invite code input      | `Input`        | Uppercase, monospace font            |
| Join button            | `Button`       | variant="outline", full width in card|

#### States

- **Loading (create)**: Create button shows spinner
- **Loading (join)**: Join button shows spinner
- **Error (create)**: Inline below input — "Household name is required"
- **Error (join)**: Inline below input — "Invalid or expired invite code"
- **Success**: Redirect to `/lists` with welcome toast

#### User Flow

1. User signs up/in for the first time → no household → redirected here
2. Option A: Types household name → taps "Create Household" → API `POST /households` → becomes ADMIN → redirect to `/lists`
3. Option B: Types invite code → taps "Join Household" → API `POST /households/join` → becomes MEMBER → redirect to `/lists`

#### Responsive Behavior

- **Mobile**: Full screen, scrollable, cards stacked vertically, `px-4`
- **Desktop**: Centered content (`max-w-lg`), cards can be side-by-side in a 2-column grid

#### i18n Keys

```
onboarding.welcome             — "Welcome!" / "¡Bienvenido!"
onboarding.subtitle            — "Set up your household to start shopping" / "Configura tu hogar para empezar a comprar"
onboarding.create.title        — "Create a Household" / "Crear un Hogar"
onboarding.create.description  — "Start fresh. You'll be the admin." / "Empieza de cero. Serás el administrador."
onboarding.create.nameLabel    — "Household name" / "Nombre del hogar"
onboarding.create.namePlaceholder — "e.g. Casa Franco" / "ej. Casa Franco"
onboarding.create.button       — "Create Household" / "Crear Hogar"
onboarding.divider             — "or" / "o"
onboarding.join.title          — "Join a Household" / "Unirse a un Hogar"
onboarding.join.description    — "Enter an invite code from a family member" / "Ingresa el código de invitación de un familiar"
onboarding.join.codeLabel      — "Invite code" / "Código de invitación"
onboarding.join.codePlaceholder — "e.g. ABC123XY" / "ej. ABC123XY"
onboarding.join.button         — "Join Household" / "Unirse al Hogar"
onboarding.error.nameRequired  — "Household name is required" / "El nombre del hogar es obligatorio"
onboarding.error.invalidCode   — "Invalid or expired invite code" / "Código de invitación inválido o expirado"
onboarding.success.created     — "Household created! Welcome aboard." / "¡Hogar creado! Bienvenido."
onboarding.success.joined      — "You've joined the household!" / "¡Te has unido al hogar!"
```

#### Accessibility Notes

- Both options are clearly labeled and reachable via keyboard (Tab between cards)
- Invite code input uses `inputMode="text"` and `autoCapitalize="characters"` for mobile
- Each card is a `<section>` with an `aria-labelledby` pointing to its heading
- Loading state disables all interactive elements and sets `aria-busy="true"` on the active card

---

## 5. App Shell / Layout

### 5.1 Screen: App Shell

#### Purpose

The persistent layout wrapper for all authenticated app screens. Contains navigation, header, and the main content area.

#### Layout (ASCII wireframe — Mobile)

```
┌─────────────────────────────┐
│ GroceriesAI     [Avatar ▾]  │  ← Header (h-14)
├─────────────────────────────┤
│                             │
│                             │
│       Page Content          │  ← Scrollable area
│       (children)            │
│                             │
│                             │
├─────────────────────────────┤
│ 🛒 Lists │ 🏠 Home │👤 Me  │  ← Bottom nav (h-16)
└─────────────────────────────┘
```

#### Layout (ASCII wireframe — Desktop)

```
┌──────────┬──────────────────────────────┐
│ 🥬       │  Page Title                  │  ← Header
│ GroceriesAI│                            │
│ ──────── ├──────────────────────────────┤
│          │                              │
│ 🛒 Lists │      Page Content            │
│ 🏠 Home  │      (children)              │
│ 👤 Profile│                             │
│          │                              │
│          │                              │
│ ──────── │                              │
│ 🚪 Sign Out│                            │
└──────────┴──────────────────────────────┘
```

#### Components

| Component           | shadcn/ui Base    | Purpose                        |
| ------------------- | ----------------- | ------------------------------ |
| Header              | —                 | App name, user avatar, h-14    |
| Bottom Nav (mobile) | —                 | 3 tabs, fixed bottom, h-16    |
| Sidebar (desktop)   | —                 | Fixed left, w-64               |
| User avatar         | `Avatar`          | In header (mobile) or sidebar  |
| Nav item            | `Button`          | variant="ghost", with icon     |
| Main content area   | —                 | `flex-1 overflow-y-auto`       |

#### Responsive Behavior

- **< 768px (mobile)**: Bottom nav visible, sidebar hidden, header shows app name + avatar dropdown
- **≥ 768px (desktop)**: Sidebar visible, bottom nav hidden, header shows page title
- Content area: `pb-20` on mobile (to clear bottom nav), `pl-64` on desktop (to clear sidebar)

#### i18n Keys

```
nav.lists                — "Lists" / "Listas"
nav.household            — "Household" / "Hogar"
nav.profile              — "Profile" / "Perfil"
nav.signOut              — "Sign out" / "Cerrar sesión"
app.name                 — "GroceriesAI"
```

#### Accessibility Notes

- Bottom nav uses `<nav aria-label="Main navigation">`
- Active tab indicated by `aria-current="page"`
- Sidebar uses `<aside aria-label="Sidebar navigation">`
- Skip-to-content link at the very top of the layout (visually hidden, visible on focus)
- Avatar dropdown is keyboard accessible (Enter to open, Escape to close)

---

## 6. Shopping Lists Screens

### 6.1 Screen: Lists Overview (Home)

#### Purpose

The main hub of the app. Users see all their household's shopping lists, filtered by status, and can create new ones.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│ My Lists              [+ ]  │  ← Page title + FAB
├─────────────────────────────┤
│ [Active] [Completed] [All]  │  ← Status filter tabs
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐│
│ │ 🛒 Weekly Groceries     ││  ← List card
│ │ 3/8 items  ·  Carlos    ││
│ │ Apr 3, 2026             ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ 🛒 Party Supplies       ││
│ │ 0/5 items  ·  Alejandro ││
│ │ Apr 2, 2026             ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ ✅ Last Week            ││  ← Completed list (muted)
│ │ 12/12 items  ·  Carlos  ││
│ │ Mar 28, 2026            ││
│ └─────────────────────────┘│
│                             │
└─────────────────────────────┘
```

#### Components

| Component          | shadcn/ui Base | Purpose                                     |
| ------------------ | -------------- | ------------------------------------------- |
| Page header        | —              | Title + create button                       |
| Create list button | `Button`       | `size="icon"` on mobile (FAB), text on desktop. Primary variant |
| Filter tabs        | `Tabs`         | TabsList + TabsTrigger for Active/Completed/All |
| List card          | `Card`         | CardHeader: name + status icon. CardContent: item count, creator, date |
| Progress text      | `Badge`        | "3/8 items" — checked count / total         |
| Status badge       | `Badge`        | variant: default (active), secondary (completed), outline (archived) |
| Empty state        | —              | Custom component (see Section 9)            |

#### Data per Card

From `GET /lists` response:
- `name` — list name
- `status` — ACTIVE / COMPLETED / ARCHIVED
- `items` count and checked count (derived from items array or returned by API)
- `createdBy.displayName`
- `createdAt` — formatted as relative date ("Today", "Yesterday") or short date

#### States

- **Loading**: 3 skeleton cards — each with skeleton line for title, shorter line for metadata
- **Empty (no lists at all)**: Shopping cart illustration + "No lists yet" + "Create your first shopping list" + CTA button
- **Empty (filtered, no match)**: "No [active/completed] lists" message, no CTA
- **Error**: "Could not load your lists" + retry button

#### User Flow

1. User lands on `/lists` → sees active lists by default
2. Taps filter tab to switch between Active / Completed / All
3. Taps a list card → navigates to `/lists/[id]`
4. Taps `+` button → opens Create List dialog

#### Responsive Behavior

- **Mobile**: Cards full width, single column, FAB is `size="icon"` positioned in header
- **Desktop**: Cards in a grid (`grid-cols-2` on `lg`), create button shows text "New List"

#### i18n Keys

```
lists.title                    — "My Lists" / "Mis Listas"
lists.createButton             — "New List" / "Nueva Lista"
lists.filter.active            — "Active" / "Activas"
lists.filter.completed         — "Completed" / "Completadas"
lists.filter.all               — "All" / "Todas"
lists.card.itemCount           — "{checked}/{total} items" / "{checked}/{total} artículos"
lists.card.createdBy           — "by {name}" / "por {name}"
lists.empty.title              — "No lists yet" / "Aún no hay listas"
lists.empty.description        — "Create your first shopping list to get started" / "Crea tu primera lista de compras para comenzar"
lists.empty.cta                — "Create List" / "Crear Lista"
lists.empty.filtered           — "No {status} lists" / "No hay listas {status}"
lists.error.load               — "Could not load your lists" / "No se pudieron cargar tus listas"
lists.error.retry              — "Retry" / "Reintentar"
```

#### Accessibility Notes

- List cards are `<article>` elements within a `<section aria-label="Shopping lists">`
- Each card is a link (entire card clickable) — using `<a>` or Next.js `<Link>`
- Filter tabs use `role="tablist"` with `aria-selected` on active tab
- FAB has `aria-label="Create new list"`
- Empty state CTA is auto-focused when empty

---

### 6.2 Screen: Create List Dialog

#### Purpose

Quick creation of a new shopping list. Minimal friction — just a name.

#### Layout (ASCII wireframe)

```
Mobile (Bottom Sheet):         Desktop (Dialog):
┌─────────────────────┐       ┌───────────────────────┐
│                     │       │ Create a new list   ✕ │
│                     │       ├───────────────────────┤
│                     │       │ List name             │
├─────────────────────┤       │ ┌─────────────────┐  │
│ ─── (drag handle)   │       │ │ e.g. Weekly...  │  │
│                     │       │ └─────────────────┘  │
│ Create a new list   │       │                       │
│                     │       │ [Cancel]  [Create]    │
│ List name           │       └───────────────────────┘
│ ┌─────────────────┐│
│ │ e.g. Weekly...  ││
│ └─────────────────┘│
│                     │
│ [    Create List   ]│
└─────────────────────┘
```

#### Components

| Component        | shadcn/ui Base    | Purpose                         |
| ---------------- | ----------------- | ------------------------------- |
| Dialog/Sheet     | `Dialog` (desktop), `Sheet` (mobile) | Container               |
| Title            | `DialogTitle`     | "Create a new list"             |
| Name input       | `Input`           | Autofocus, required             |
| Create button    | `Button`          | Primary, full width on mobile   |
| Cancel button    | `Button`          | variant="ghost", desktop only   |

#### States

- **Loading**: Create button disabled + spinner
- **Validation error**: Red border on input + "List name is required"
- **Success**: Dialog closes, toast "List created!", navigates to new list detail

#### User Flow

1. User taps `+` / "New List" → dialog/sheet opens
2. Types list name → taps "Create"
3. API `POST /lists` → on success, redirect to `/lists/[newId]`

#### i18n Keys

```
lists.create.title             — "Create a new list" / "Crear una nueva lista"
lists.create.nameLabel         — "List name" / "Nombre de la lista"
lists.create.namePlaceholder   — "e.g. Weekly Groceries" / "ej. Compras de la Semana"
lists.create.submitButton      — "Create List" / "Crear Lista"
lists.create.cancelButton      — "Cancel" / "Cancelar"
lists.create.validation.nameRequired — "List name is required" / "El nombre de la lista es obligatorio"
lists.create.success           — "List created!" / "¡Lista creada!"
```

#### Accessibility Notes

- Dialog traps focus; Escape closes it
- Input auto-focused on open
- Close button has `aria-label="Close dialog"`
- On mobile, Sheet is draggable but also closeable via button

---

### 6.3 Screen: List Detail (Items View)

#### Purpose

The core screen where users manage items in a shopping list. Optimized for one-handed mobile use while shopping.

#### Design Decisions

- **Add item**: Inline sticky input at the bottom (not a modal). This minimizes taps and keeps the context visible. The user types a name and hits Enter — that's it for quick add. A "full edit" mode is available by tapping the item afterward.
- **Checked items**: Automatically moved to the bottom of the list in a collapsible "Checked" section. This keeps the unchecked (still-needed) items visible at the top while shopping.
- **Grouping**: Flat list with manual reorder for Phase 1. Category-based grouping will be added in Phase 2 when the product catalog is more mature.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│ ← Weekly Groceries  [···]   │  ← Back + title + actions menu
│ 🟢 Active  ·  8 items       │  ← Status badge + count
├─────────────────────────────┤
│                             │
│ ☐ ≡ Whole Milk       2 unit │  ← Drag handle + checkbox + name + qty
│ ☐ ≡ Bread            1 unit │
│ ☐ ≡ Chicken breast   1 kg   │
│ ☐ ≡ Tomatoes     📝  500 g  │  ← Notes indicator
│ ☐ ≡ Onions           3 unit │
│                             │
│ ▾ Checked (3)               │  ← Collapsible section
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ ☑ ≡ ̶E̶g̶g̶s̶              12 unit│  ← Strikethrough + muted
│ ☑ ≡ ̶R̶i̶c̶e̶              1 kg  │
│ ☑ ≡ ̶O̶l̶i̶v̶e̶ ̶o̶i̶l̶         1 L   │
│                             │
├─────────────────────────────┤
│ [+] Add an item...          │  ← Sticky bottom input
└─────────────────────────────┘
```

#### Components

| Component            | shadcn/ui Base       | Purpose                                |
| -------------------- | -------------------- | -------------------------------------- |
| Back button          | `Button`             | variant="ghost", icon `ChevronLeft`    |
| List title           | —                    | `text-lg font-semibold`, inline editable on tap |
| Actions menu         | `DropdownMenu`       | Edit, Complete, Archive, Delete        |
| Status badge         | `Badge`              | Active (green), Completed (secondary)  |
| Item row             | —                    | Custom: drag handle + checkbox + text + qty |
| Checkbox             | `Checkbox`           | Toggle checked/unchecked               |
| Drag handle          | —                    | `GripVertical` icon, touch-friendly    |
| Notes indicator      | —                    | `StickyNote` icon if item has notes    |
| Checked section      | `Collapsible`        | Collapsible header + item list         |
| Quick add input      | `Input`              | Sticky at bottom, `Plus` icon prefix   |
| Item context menu    | `DropdownMenu`       | Edit, Delete — triggered by long-press (mobile) or right-click (desktop) |

#### Item Row Detail

```
┌─────────────────────────────────────┐
│ ≡  ☐  Whole Milk         📝  2 unit│
│ │  │  │                  │   │     │
│ │  │  name               │   qty+unit
│ │  checkbox              notes icon
│ drag handle
└─────────────────────────────────────┘
```

- Drag handle: `w-6`, visible only when not in "shopping mode" (future consideration)
- Checkbox: `w-5 h-5`, adequate touch target via padding
- Name: `flex-1`, truncated with ellipsis if too long
- Notes icon: only if `notes` is non-null
- Quantity + unit: right-aligned, `text-muted-foreground`
- Checked items: `line-through text-muted-foreground opacity-60`

#### Actions Menu Options

| Action    | Icon         | Behavior                                           |
| --------- | ------------ | -------------------------------------------------- |
| Edit name | `Pencil`     | Inline edit mode on list title                     |
| Complete  | `CheckCheck` | `PATCH /lists/:id` status → COMPLETED              |
| Archive   | `Archive`    | `PATCH /lists/:id` status → ARCHIVED               |
| Delete    | `Trash2`     | Confirmation dialog → `DELETE /lists/:id`           |

#### States

- **Loading**: Skeleton — 5 item rows with placeholder lines
- **Empty (no items)**: Centered message "This list is empty" + "Add your first item below" + arrow pointing to input
- **Error**: "Could not load list items" + retry
- **Optimistic updates**: Checkbox toggles are instant (optimistic), reverted on API failure with toast error

#### User Flow — Quick Add

1. User taps the sticky input at bottom
2. Keyboard opens, input is focused
3. Types item name (e.g., "Milk") → hits Enter / taps send
4. Item added at the top of unchecked list with default qty=1, unit=UNIT
5. Input clears, stays focused for next item (rapid add)
6. To add with details: user taps the added item → opens edit form (see 6.4)

#### User Flow — Check Item

1. User taps checkbox on item row
2. Item instantly shows strikethrough (optimistic update)
3. Item animates down to "Checked" section after 300ms delay
4. API `PATCH /lists/:listId/items/:itemId` with `isChecked: true`
5. On API failure: item reverts to unchecked, toast shows error

#### User Flow — Delete Item

1. User swipes left on item (mobile) or clicks menu → Delete (desktop)
2. Item fades out, removed from list
3. API `DELETE /lists/:listId/items/:itemId`
4. Toast: "Item removed" with "Undo" action (re-adds item within 5 seconds)

#### Responsive Behavior

- **Mobile**: Full screen, sticky input at bottom (above bottom nav, `bottom-16`), swipe gestures for item actions
- **Desktop**: Content in center column (`max-w-2xl`), hover reveals item action buttons (edit, delete) instead of swipe

#### i18n Keys

```
listDetail.backButton          — "Back" / "Volver"
listDetail.itemCount           — "{count} items" / "{count} artículos"
listDetail.actions.edit        — "Edit list" / "Editar lista"
listDetail.actions.complete    — "Complete list" / "Completar lista"
listDetail.actions.archive     — "Archive list" / "Archivar lista"
listDetail.actions.delete      — "Delete list" / "Eliminar lista"
listDetail.checked.title       — "Checked ({count})" / "Marcados ({count})"
listDetail.quickAdd.placeholder — "Add an item..." / "Agregar un artículo..."
listDetail.empty.title         — "This list is empty" / "Esta lista está vacía"
listDetail.empty.description   — "Add your first item below" / "Agrega tu primer artículo abajo"
listDetail.item.delete         — "Remove item" / "Eliminar artículo"
listDetail.item.edit           — "Edit item" / "Editar artículo"
listDetail.item.undoDelete     — "Undo" / "Deshacer"
listDetail.item.removed        — "Item removed" / "Artículo eliminado"
listDetail.delete.confirmTitle — "Delete this list?" / "¿Eliminar esta lista?"
listDetail.delete.confirmDescription — "This action cannot be undone." / "Esta acción no se puede deshacer."
listDetail.delete.confirm      — "Delete" / "Eliminar"
listDetail.delete.cancel       — "Cancel" / "Cancelar"
listDetail.error.load          — "Could not load list items" / "No se pudieron cargar los artículos"
listDetail.error.update        — "Could not update item" / "No se pudo actualizar el artículo"
```

#### Accessibility Notes

- Item list is `<ul role="list">`, each item is `<li>`
- Checkbox has `aria-label="{item name}"` (e.g., "Mark Whole Milk as checked")
- Drag handle has `aria-label="Reorder {item name}"`; keyboard reorder via Arrow keys when focused on handle
- Quick-add input has `aria-label="Add a new item"`
- Checked section is `<details>` / Collapsible with `aria-expanded`
- Swipe actions have keyboard equivalents (context menu)
- `prefers-reduced-motion`: disable slide animations for check/delete, use instant show/hide
- Delete confirmation dialog traps focus

---

### 6.4 Screen: Add/Edit Item Form

#### Purpose

Full editing form for a list item. Used when the user needs to set quantity, unit, or notes beyond the quick-add default.

#### Design Decision

This is a **bottom sheet on mobile** and a **dialog on desktop**, opened by tapping an existing item in the list.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│                             │
│  (list content behind)      │
│                             │
├─────────────────────────────┤
│ ─── (drag handle)           │
│                             │
│ Edit Item                   │
│                             │
│ Name                        │
│ ┌─────────────────────────┐│
│ │ Whole Milk              ││
│ └─────────────────────────┘│
│                             │
│ Quantity          Unit      │
│ ┌──────────┐ ┌───────────┐│
│ │ 2        │ │ UNIT  ▾   ││
│ └──────────┘ └───────────┘│
│                             │
│ Notes (optional)            │
│ ┌─────────────────────────┐│
│ │ Brand X preferred       ││
│ └─────────────────────────┘│
│                             │
│ [       Save Changes       ]│
└─────────────────────────────┘
```

#### Components

| Component      | shadcn/ui Base             | Purpose                                  |
| -------------- | -------------------------- | ---------------------------------------- |
| Container      | `Sheet` (mobile), `Dialog` (desktop) | Slide-up sheet on mobile       |
| Name input     | `Input`                    | Pre-filled with item name                |
| Quantity input | `Input`                    | type="number", min=0.01, step=0.01       |
| Unit selector  | `Select`                   | Dropdown with UnitType values            |
| Notes textarea | `Textarea`                 | Optional, 2 rows                         |
| Save button    | `Button`                   | Primary, full width                      |

#### Unit Selector Options

| Value  | Label (en)   | Label (es)   |
| ------ | ------------ | ------------ |
| UNIT   | Units        | Unidades     |
| KG     | Kilograms    | Kilogramos   |
| LB     | Pounds       | Libras       |
| G      | Grams        | Gramos       |
| L      | Liters       | Litros       |
| ML     | Milliliters  | Mililitros   |
| OZ     | Ounces       | Onzas        |
| DOZEN  | Dozen        | Docena       |
| PACK   | Pack         | Paquete      |

#### States

- **Loading**: Save button disabled + spinner
- **Validation error**: Name required, quantity must be > 0
- **Success**: Sheet/dialog closes, item updated in list, toast "Item updated"

#### User Flow

1. User taps an item row in list detail
2. Bottom sheet slides up with item data pre-filled
3. User edits fields → taps "Save Changes"
4. API `PATCH /lists/:listId/items/:itemId` → optimistic update → close sheet
5. For new items (from quick add wanting to add details): same form but title is "Add Item" and fields are empty except name

#### i18n Keys

```
itemForm.editTitle             — "Edit Item" / "Editar Artículo"
itemForm.addTitle              — "Add Item" / "Agregar Artículo"
itemForm.nameLabel             — "Name" / "Nombre"
itemForm.quantityLabel         — "Quantity" / "Cantidad"
itemForm.unitLabel             — "Unit" / "Unidad"
itemForm.notesLabel            — "Notes (optional)" / "Notas (opcional)"
itemForm.notesPlaceholder      — "e.g. Brand X preferred" / "ej. Preferir marca X"
itemForm.saveButton            — "Save Changes" / "Guardar Cambios"
itemForm.addButton             — "Add Item" / "Agregar Artículo"
itemForm.validation.nameRequired — "Item name is required" / "El nombre del artículo es obligatorio"
itemForm.validation.quantityMin — "Quantity must be greater than 0" / "La cantidad debe ser mayor a 0"
itemForm.success.updated       — "Item updated" / "Artículo actualizado"
itemForm.success.added         — "Item added" / "Artículo agregado"
units.UNIT                     — "Units" / "Unidades"
units.KG                       — "Kilograms" / "Kilogramos"
units.LB                       — "Pounds" / "Libras"
units.G                        — "Grams" / "Gramos"
units.L                        — "Liters" / "Litros"
units.ML                       — "Milliliters" / "Mililitros"
units.OZ                       — "Ounces" / "Onzas"
units.DOZEN                    — "Dozen" / "Docena"
units.PACK                     — "Pack" / "Paquete"
```

#### Accessibility Notes

- Form fields have associated `<label>` elements
- Unit select has keyboard navigation
- Sheet/Dialog traps focus and returns focus to trigger element on close
- Validation errors linked via `aria-describedby`
- Quantity input: `inputMode="decimal"` on mobile for numeric keyboard

---

## 7. Household Screens

### 7.1 Screen: Household Settings

#### Purpose

View and manage household info, members, and invitations. Admins can invite/remove members and edit the household name.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│ Household Settings          │
├─────────────────────────────┤
│                             │
│ Household Name              │
│ ┌─────────────────────┬──┐ │
│ │ Casa Franco         │✏️│ │  ← Editable (ADMIN only)
│ └─────────────────────┴──┘ │
│                             │
│ Members (2)                 │
│ ┌─────────────────────────┐│
│ │ 👤 Carlos Franco        ││
│ │    carlos@ex.com  ADMIN ││
│ ├─────────────────────────┤│
│ │ 👤 Alejandro            ││
│ │    alejo@ex.com  MEMBER ││  ← [Remove] button for ADMIN
│ └─────────────────────────┘│
│                             │
│ Invite Members              │
│ ┌─────────────────────────┐│
│ │ [👤+ Invite Member]     ││
│ └─────────────────────────┘│
│                             │
│ Pending Invites (1)         │
│ ┌─────────────────────────┐│
│ │ 📧 maria@ex.com        ││
│ │ Code: XYZ789 · Exp: 7d ││  ← [Cancel] button
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ 🚪 Leave Household      ││  ← MEMBER only (not ADMIN)
│ └─────────────────────────┘│
│                             │
└─────────────────────────────┘
```

#### Components

| Component              | shadcn/ui Base     | Purpose                                 |
| ---------------------- | ------------------ | --------------------------------------- |
| Page title             | —                  | "Household Settings"                    |
| Household name field   | `Input`            | Editable by ADMIN (pencil icon trigger) |
| Members section        | `Card`             | List of members with avatars            |
| Member row             | —                  | Avatar + name + email + role badge      |
| Role badge             | `Badge`            | "ADMIN" (primary), "MEMBER" (secondary) |
| Remove member button   | `Button`           | variant="ghost", destructive, ADMIN only|
| Invite button          | `Button`           | variant="outline", icon `UserPlus`      |
| Invite dialog          | `Dialog`           | Optional email field + generate code    |
| Pending invite row     | —                  | Email + code + expiry + cancel button   |
| Cancel invite button   | `Button`           | variant="ghost", destructive            |
| Leave household button | `Button`           | variant="outline", destructive, at bottom|

#### Invite Flow Sub-Dialog

```
┌───────────────────────────┐
│ Invite a Member         ✕ │
├───────────────────────────┤
│ Email (optional)          │
│ ┌───────────────────────┐│
│ │ maria@example.com     ││
│ └───────────────────────┘│
│                           │
│ [ Generate Invite Code ]  │
│                           │
│ ┌───────────────────────┐│
│ │  Code: ABC123XY       ││  ← Shown after generation
│ │  [📋 Copy]  [📤 Share]││
│ │  Expires: Apr 11, 2026││
│ └───────────────────────┘│
│                           │
│ [       Done       ]      │
└───────────────────────────┘
```

#### States

- **Loading**: Skeleton for member list (3 rows with avatar circles + text lines)
- **Empty members**: Should never happen (at least the current user is always a member)
- **Empty invites**: Section hidden entirely if no pending invites
- **Error**: "Could not load household info" + retry

#### User Flow — Invite

1. ADMIN taps "Invite Member"
2. Dialog opens → optionally enters email → taps "Generate Invite Code"
3. API `POST /households/me/invite` → code displayed
4. ADMIN taps "Copy" (clipboard) or "Share" (native share API)
5. Dialog stays open until ADMIN taps "Done"

#### User Flow — Remove Member

1. ADMIN taps remove button on a member row
2. Confirmation dialog: "Remove {name} from {household}?"
3. On confirm → API `DELETE /households/me/members/:userId`
4. Member removed from list, toast "Member removed"

#### User Flow — Leave Household

1. MEMBER taps "Leave Household"
2. Confirmation dialog: "Leave {household name}? You'll need a new invite to rejoin."
3. On confirm → API call → redirect to `/onboarding`

#### Responsive Behavior

- **Mobile**: Single column, full width sections
- **Desktop**: Content in center column (`max-w-2xl`), invite code uses larger font

#### i18n Keys

```
household.title                — "Household Settings" / "Configuración del Hogar"
household.nameLabel            — "Household Name" / "Nombre del Hogar"
household.members.title        — "Members ({count})" / "Miembros ({count})"
household.members.roleAdmin    — "Admin" / "Admin"
household.members.roleMember   — "Member" / "Miembro"
household.members.remove       — "Remove" / "Eliminar"
household.members.removeConfirm — "Remove {name} from {household}?" / "¿Eliminar a {name} de {household}?"
household.members.removeConfirmDescription — "They will need a new invite to rejoin." / "Necesitará una nueva invitación para volver."
household.invite.title         — "Invite a Member" / "Invitar un Miembro"
household.invite.button        — "Invite Member" / "Invitar Miembro"
household.invite.emailLabel    — "Email (optional)" / "Correo electrónico (opcional)"
household.invite.emailPlaceholder — "member@example.com" / "miembro@ejemplo.com"
household.invite.generateButton — "Generate Invite Code" / "Generar Código de Invitación"
household.invite.codeLabel     — "Invite Code" / "Código de Invitación"
household.invite.copy          — "Copy" / "Copiar"
household.invite.share         — "Share" / "Compartir"
household.invite.copied        — "Copied to clipboard!" / "¡Copiado al portapapeles!"
household.invite.expires       — "Expires: {date}" / "Expira: {date}"
household.invite.done          — "Done" / "Listo"
household.pending.title        — "Pending Invites ({count})" / "Invitaciones Pendientes ({count})"
household.pending.cancel       — "Cancel" / "Cancelar"
household.pending.cancelConfirm — "Cancel this invite?" / "¿Cancelar esta invitación?"
household.leave.button         — "Leave Household" / "Abandonar Hogar"
household.leave.confirmTitle   — "Leave {household}?" / "¿Abandonar {household}?"
household.leave.confirmDescription — "You'll need a new invite to rejoin." / "Necesitarás una nueva invitación para volver."
household.leave.confirm        — "Leave" / "Abandonar"
household.error.load           — "Could not load household info" / "No se pudo cargar la información del hogar"
household.success.nameUpdated  — "Household name updated" / "Nombre del hogar actualizado"
household.success.memberRemoved — "Member removed" / "Miembro eliminado"
household.success.inviteCancelled — "Invite cancelled" / "Invitación cancelada"
```

#### Accessibility Notes

- Member list is a `<ul>` with member name as primary content
- Remove and cancel buttons have `aria-label` with context (e.g., "Remove Alejandro from household")
- Role badges are for visual grouping only; role info also available as text for screen readers
- Copy button confirms via `aria-live="polite"` announcement
- Confirmation dialogs trap focus; destructive buttons are not auto-focused

---

## 8. User Profile Screen

### 8.1 Screen: Profile / Settings

#### Purpose

View and edit user profile information, access household settings, and sign out.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│ Profile                     │
├─────────────────────────────┤
│                             │
│         ┌────┐              │
│         │ 👤 │              │  ← Avatar (large)
│         └────┘              │
│       Carlos Franco         │  ← Display name
│    carlos@example.com       │  ← Email (read-only)
│                             │
│ ┌─────────────────────────┐│
│ │ Display Name            ││
│ │ ┌─────────────────────┐ ││
│ │ │ Carlos Franco       │ ││  ← Editable
│ │ └─────────────────────┘ ││
│ │ [    Save Changes     ] ││
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ 🏠 Household Settings → ││  ← Link to /household
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ 🌙 Dark Mode    [toggle]││  ← Theme toggle
│ └─────────────────────────┘│
│                             │
│ ┌─────────────────────────┐│
│ │ 🚪 Sign Out             ││
│ └─────────────────────────┘│
│                             │
│ Version 1.0.0               │  ← App version (caption)
│                             │
└─────────────────────────────┘
```

#### Components

| Component              | shadcn/ui Base | Purpose                          |
| ---------------------- | -------------- | -------------------------------- |
| Avatar                 | `Avatar`       | Large (`w-20 h-20`), centered   |
| Display name           | —              | `text-xl font-semibold`          |
| Email                  | —              | `text-muted-foreground`          |
| Edit name section      | `Card`         | Input + save button              |
| Name input             | `Input`        | Pre-filled with current name     |
| Save button            | `Button`       | Primary, only enabled when changed|
| Household link         | `Button`       | variant="outline", full width, arrow icon |
| Dark mode toggle       | `Switch`       | Toggles theme                    |
| Sign out button        | `Button`       | variant="outline", destructive text |
| App version            | —              | `text-xs text-muted-foreground`  |

#### States

- **Loading**: Skeleton for avatar (circle) + name/email lines
- **Saving name**: Save button shows spinner
- **Error**: Toast on save failure
- **Success**: Toast "Profile updated"

#### User Flow

1. User navigates to Profile tab
2. Sees their info → taps name field to edit
3. Types new name → "Save Changes" button enables → taps save
4. API `PATCH /users/me` → toast "Profile updated"
5. "Sign Out" → confirmation dialog → Firebase sign out → redirect to `/sign-in`

#### Responsive Behavior

- **Mobile**: Full width, stacked sections
- **Desktop**: Center column (`max-w-md`), more generous spacing

#### i18n Keys

```
profile.title                  — "Profile" / "Perfil"
profile.displayNameLabel       — "Display Name" / "Nombre"
profile.emailLabel             — "Email" / "Correo electrónico"
profile.saveButton             — "Save Changes" / "Guardar Cambios"
profile.householdLink          — "Household Settings" / "Configuración del Hogar"
profile.darkMode               — "Dark Mode" / "Modo Oscuro"
profile.signOut                — "Sign Out" / "Cerrar Sesión"
profile.signOutConfirm         — "Are you sure you want to sign out?" / "¿Estás seguro de que quieres cerrar sesión?"
profile.success.updated        — "Profile updated" / "Perfil actualizado"
profile.error.update           — "Could not update profile" / "No se pudo actualizar el perfil"
profile.version                — "Version {version}" / "Versión {version}"
```

#### Accessibility Notes

- Avatar has `alt` text with user's name
- Sign out button is not auto-focused and requires confirmation
- Dark mode switch has `aria-label="Toggle dark mode"` and `role="switch"` with `aria-checked`
- All sections are reachable via keyboard

---

## 9. Common Components & States

### 9.1 Loading Skeletons

Every screen uses skeleton placeholders instead of spinners. Implementation via shadcn/ui `Skeleton` component.

| Screen              | Skeleton Pattern                                               |
| ------------------- | -------------------------------------------------------------- |
| Lists Overview      | 3 cards: rectangle (title line) + shorter rectangle (meta line)|
| List Detail         | 5 item rows: small square (checkbox) + long line + short line  |
| Household Settings  | Circle (avatar) + 2 lines, repeated 3 times                   |
| Profile             | Large circle (avatar) + 2 centered lines + 2 rectangles       |

All skeletons wrap their container with `aria-busy="true"` and include `aria-label="Loading"`.

### 9.2 Empty States

| Screen / Context           | Icon         | Title (en)                              | Title (es)                                    | CTA              |
| -------------------------- | ------------ | --------------------------------------- | --------------------------------------------- | ---------------- |
| Lists (no lists at all)    | `ShoppingCart` | "No lists yet"                        | "Aún no hay listas"                           | "Create List"    |
| Lists (filtered empty)     | `Search`     | "No {status} lists"                     | "No hay listas {status}"                      | —                |
| List Detail (no items)     | `PackageOpen`| "This list is empty"                    | "Esta lista está vacía"                       | Focus quick-add  |
| Household (no invites)     | —            | (section hidden)                        | (section hidden)                              | —                |

Empty state layout:
```
┌─────────────────────────┐
│                         │
│       [ 📦 icon ]       │  ← 48px, text-muted-foreground
│                         │
│    Title goes here      │  ← text-lg font-medium
│  Description goes here  │  ← text-sm text-muted-foreground
│                         │
│    [ CTA Button ]       │  ← Button variant="default" (if applicable)
│                         │
└─────────────────────────┘
```

### 9.3 Error States

All error states follow the same pattern:

```
┌─────────────────────────┐
│                         │
│       [ ⚠️ icon ]       │  ← AlertTriangle, text-destructive
│                         │
│  Something went wrong   │  ← text-lg font-medium
│  {specific message}     │  ← text-sm text-muted-foreground
│                         │
│    [ Retry ]            │  ← Button variant="outline"
│                         │
└─────────────────────────┘
```

- Use `aria-live="polite"` on the error container
- Retry button calls the original fetch function
- If retry fails 3 times, show "Please check your connection and try again"

### 9.4 Toast Notifications

Using shadcn/ui `Toast` (Sonner integration). All toasts auto-dismiss after 4 seconds.

| Type    | Style                          | Example                          |
| ------- | ------------------------------ | -------------------------------- |
| Success | Green left border, check icon  | "List created!"                  |
| Error   | Red left border, X icon        | "Could not save changes"         |
| Info    | Blue left border, info icon    | "Copied to clipboard!"           |
| Undo    | Default + "Undo" action button | "Item removed" [Undo]            |

Toast position: `bottom-center` on mobile (above bottom nav), `bottom-right` on desktop.

### 9.5 Confirmation Dialogs

For destructive actions (delete list, remove member, leave household):

```
┌───────────────────────────┐
│ {Title}                 ✕ │
├───────────────────────────┤
│                           │
│ {Description message}     │
│                           │
│    [Cancel]  [Confirm]    │
│              ↑ destructive│
└───────────────────────────┘
```

- `AlertDialog` from shadcn/ui
- Cancel button: `variant="outline"`
- Confirm button: `variant="destructive"`
- Focus starts on Cancel (not the destructive action)
- Escape closes without action

---

## 10. Component Inventory

### shadcn/ui Components Required for Phase 1

| Component       | Usage                                              |
| --------------- | -------------------------------------------------- |
| `Alert`         | Inline error messages on auth forms                |
| `AlertDialog`   | Destructive action confirmations                   |
| `Avatar`        | User avatars in member lists, profile, header      |
| `Badge`         | Status badges, role badges, item counts            |
| `Button`        | All interactive buttons                            |
| `Card`          | List cards, settings sections, onboarding options  |
| `Checkbox`      | List item check/uncheck                            |
| `Collapsible`   | Checked items section in list detail               |
| `Dialog`        | Create list, invite member (desktop)               |
| `DropdownMenu`  | List actions menu, item context menu               |
| `Input`         | All text inputs                                    |
| `Label`         | Form field labels                                  |
| `Select`        | Unit type selector                                 |
| `Separator`     | Dividers ("or" in auth, section dividers)          |
| `Sheet`         | Bottom sheets on mobile (create list, edit item)   |
| `Skeleton`      | Loading states                                     |
| `Switch`        | Dark mode toggle                                   |
| `Tabs`          | List status filter                                 |
| `Textarea`      | Item notes field                                   |
| `Toast/Sonner`  | Notifications                                      |

### Custom Components to Build

| Component             | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `AppShell`            | Layout with header + nav + content area          |
| `BottomNav`           | Mobile bottom navigation bar                     |
| `Sidebar`             | Desktop sidebar navigation                       |
| `EmptyState`          | Reusable empty state with icon + text + CTA      |
| `ErrorState`          | Reusable error state with message + retry        |
| `ListCard`            | Shopping list card for overview                  |
| `ItemRow`             | List item row with checkbox + drag + actions     |
| `QuickAddInput`       | Sticky input for rapid item addition             |
| `InviteCodeDisplay`   | Code display with copy/share buttons             |
| `ConfirmDialog`       | Wrapper around AlertDialog for destructive actions|

---

## 11. Design Decisions

Summary of all open questions resolved in this document:

### Q1: Should the "Add item" flow be inline or a modal?

**Decision: Inline sticky input at the bottom of the list.**

Rationale: The primary use case is adding items quickly while shopping or planning. An inline input at the bottom of the list allows rapid entry — type name, hit Enter, repeat. This achieves the "< 3 taps" goal. For editing quantity/unit/notes, the user taps the already-added item to open an edit sheet.

### Q2: Should checked items move to the bottom automatically?

**Decision: Yes, automatically moved to a collapsible "Checked" section at the bottom.**

Rationale: While shopping, users need to see unchecked (still-needed) items at the top. Checked items are "done" and should not take up prime visual space. A collapsible section keeps them accessible if the user needs to uncheck something, while keeping the active list clean. A 300ms animation delay gives visual feedback before the item moves.

### Q3: What pattern for the onboarding flow?

**Decision: Single screen with two clear options (Create or Join).**

Rationale: The choice is binary — a wizard would add friction without adding value. Two distinct cards on a single screen make the options immediately clear. Each card has its own input and action button, so the user can choose and act in one step.

### Q4: Should items be grouped by category or flat list?

**Decision: Flat list with manual reorder for Phase 1.**

Rationale: In Phase 1, the product catalog is not yet mature — most items won't have category associations. Category grouping would result in a large "Uncategorized" section that's not useful. Manual reorder via drag-and-drop gives users control. Category-based grouping will be added in Phase 2 when products have established categories from receipt processing.

### Q5: What empty state messages work best?

**Decision: Contextual, encouraging messages with relevant icons.**

Rationale: Each empty state uses an icon related to its context (shopping cart for lists, open package for items) and a message that tells the user exactly what to do next. The tone is neutral and helpful — not cutesy. CTA buttons are included where the user can take immediate action.

---

---

# Phase 2 — Receipts & Product Catalog

---

## 12. Phase 2 Navigation Update

Phase 2 adds two new primary sections — **Products** and **Receipts** — requiring a navigation update on both mobile and desktop.

### 12.1 Mobile — Updated Bottom Navigation Bar (4 tabs)

```
┌──────────────────────────────────────────────────┐
│                                                  │
│                  Main Content                    │
│                                                  │
├───────────┬───────────┬───────────┬──────────────┤
│ 🛒 Lists  │ 📦 Products│ 🧾 Receipts│ 👤 Profile │
│ (active)  │           │            │             │
└───────────┴───────────┴────────────┴─────────────┘
```

**Changes from Phase 1:**
- **Household** tab removed from bottom nav → moved to Profile submenu (accessible via Profile → Household Settings)
- **Products** tab added (2nd position): `Package` Lucide icon
- **Receipts** tab added (3rd position): `Receipt` Lucide icon
- **Profile** tab remains 4th (last position)
- Tab bar layout: 4 equal-width tabs, each `h-16`, icons `w-6 h-6`, label `text-xs`

**Profile Submenu** (accessible via Profile page):
- Household Settings → links to `/household`
- Dark Mode toggle
- Sign Out

### 12.2 Desktop — Updated Sidebar Navigation

```
┌──────────────┬──────────────────────────────┐
│  🥬          │                              │
│  GroceriesAI │                              │
│  ──────────  │                              │
│  🛒 Lists    │       Main Content           │
│              │                              │
│  ── Products ─── (section header)           │
│  📦 Catalog  │                              │
│              │                              │
│  ── Receipts ─── (section header)           │
│  🧾 My Receipts│                            │
│              │                              │
│  ──────────  │                              │
│  🏠 Household│                              │
│  👤 Profile  │                              │
│              │                              │
│  ──────────  │                              │
│  🚪 Sign Out │                              │
└──────────────┴──────────────────────────────┘
```

**Changes from Phase 1:**
- Two new section headers in sidebar: "Products" and "Receipts" (text-xs uppercase text-muted-foreground)
- `Package` icon for Products Catalog nav item
- `Receipt` icon for Receipts nav item
- Household remains in sidebar (not moved to submenu on desktop, only on mobile)
- Sidebar sections use `gap-1` between items, `gap-4` between section groups

### 12.3 Updated Route Structure

| Route                     | Screen                    | Phase | Auth Required |
| ------------------------- | ------------------------- | ----- | ------------- |
| `/sign-in`                | Sign In                   | 1     | No            |
| `/sign-up`                | Sign Up                   | 1     | No            |
| `/onboarding`             | Create/Join Household     | 1     | Yes           |
| `/lists`                  | Lists Overview            | 1     | Yes           |
| `/lists/[id]`             | List Detail               | 1     | Yes           |
| `/household`              | Household Settings        | 1     | Yes           |
| `/profile`                | Profile / Settings        | 1     | Yes           |
| `/products`               | Product Catalog           | **2** | Yes           |
| `/products/[id]`          | Product Detail            | **2** | Yes           |
| `/receipts`               | Receipts List             | **2** | Yes           |
| `/receipts/[id]`          | Receipt Detail            | **2** | Yes           |

### 12.4 Updated i18n Keys

```
nav.lists                — "Lists" / "Listas"
nav.products             — "Products" / "Productos"
nav.productsCatalog      — "Catalog" / "Catálogo"
nav.receipts             — "Receipts" / "Recibos"
nav.household            — "Household" / "Hogar"
nav.profile              — "Profile" / "Perfil"
nav.signOut              — "Sign out" / "Cerrar sesión"
nav.section.products     — "Products" / "Productos"
nav.section.receipts     — "Receipts" / "Recibos"
```

---

## 13. Phase 2 Design System Extensions

### 13.1 New Color Tokens

```
Chart Colors (data visualization):
  --chart-1:   221.2 83.2% 53.3%    (blue-500  — spending bars)
  --chart-2:   142.1 70.6% 45.3%    (green-500 — category Fruits/Vegetables)
  --chart-3:   38 92% 50%            (amber-500 — category Bakery/Snacks)
  --chart-4:   0 84.2% 60.2%         (red-500   — price increase indicator)
  --chart-5:   262.1 83.3% 57.8%     (violet-500 — category Personal Care)

Status (for receipts):
  --status-pending:    38 92% 50%            → amber-500 (same as --warning)
  --status-processing: 217.2 91.2% 59.8%    → blue-400
  --status-completed:  142.1 70.6% 45.3%    → green-500 (same as --success)
  --status-failed:     0 84.2% 60.2%         → red-500   (same as --destructive)
```

### 13.2 New Icon Additions

```
Products:    Package, Tag, TrendingUp, TrendingDown, Minus (stable price)
Categories:  (Lucide icons mapped per category)
  - Fruits & Vegetables:  Apple
  - Dairy:                Milk
  - Meat & Fish:          Beef (or Drumstick)
  - Bakery:               Croissant
  - Beverages:            Coffee
  - Snacks:               Candy
  - Cleaning:             Sparkles
  - Personal Care:        Heart
  - Frozen:               Snowflake
  - Canned Goods:         Archive
  - Grains & Pasta:       Wheat
  - Condiments:           Flask (or TestTube)
  - Other:                MoreHorizontal
Receipts:    Receipt, ScanLine, Upload, Camera, FileImage, RefreshCw
Corrections: Edit2, AlertCircle, CheckCircle2, Link2
```

### 13.3 New Design Patterns

**Filter Chip Bar** (horizontal scrollable):
```
┌─────────────────────────────────────────────────┐
│ [All ×] [🥛 Dairy] [🥩 Meat] [🍎 Fruits] [→]  │  ← overflows with horizontal scroll
└─────────────────────────────────────────────────┘
```
- Chips: `h-8 px-3 rounded-full text-xs font-medium`
- Active chip: `bg-primary text-primary-foreground`
- Inactive chip: `border bg-background hover:bg-muted`
- Container: `flex gap-2 overflow-x-auto no-scrollbar pb-1`

**Price Trend Indicator:**
```
↑ $3.80   (text-destructive + TrendingUp icon) — price increased
↓ $3.20   (text-success + TrendingDown icon)   — price decreased
→ $3.50   (text-muted-foreground + Minus icon) — price stable (±5%)
```

**Receipt Status Badge:**
```
[● Processing]  (amber bg, spinner)
[✓ Completed]   (green bg, check icon)
[✕ Failed]      (red bg, X icon)
[○ Pending]     (muted bg, clock icon)
```

**Split Layout (Receipt Detail, desktop):**
```
┌──────────────────┬──────────────────┐
│   Image Panel    │   Data Panel     │
│   (50% width)    │   (50% width)    │
│   sticky scroll  │   scrollable     │
└──────────────────┴──────────────────┘
```

---

## 14. Product Catalog Screens

### 14.1 Screen: Product Catalog Page

#### Purpose

Browsable, searchable list of all products the household has ever purchased or added to lists. Grows automatically from receipt processing and list item linking. Provides a central reference for item history and pricing.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│ Products            [🔍]    │  ← Page title + search toggle
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🔍 Search products...   │ │  ← Search bar (expands on tap)
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [All] [🥛 Dairy] [🥩 Meat]  │  ← Category filter chips (scrollable)
│ [🍎 Fruits] [🧴 Personal]   │
├─────────────────────────────┤
│ Sort: [Most Purchased ▾]     │  ← Sort dropdown
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ 🥛 Whole Milk           │ │  ← Product card
│ │ Dairy · $3.50 avg       │ │
│ │ Purchased 12×  Apr 1    │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🥩 Chicken Breast       │ │
│ │ Meat & Fish · $8.20 avg │ │
│ │ Purchased 8×   Mar 25   │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🍞 Whole Wheat Bread    │ │
│ │ Bakery · $2.10 avg      │ │
│ │ Purchased 6×   Mar 20   │ │
│ └─────────────────────────┘ │
│                             │
│      [Load more...]         │  ← Pagination trigger
│                             │
└─────────────────────────────┘
```

#### Components

| Component              | shadcn/ui Base     | Purpose                                               |
| ---------------------- | ------------------ | ----------------------------------------------------- |
| Page header            | —                  | "Products" title + search icon button                 |
| Search input           | `Input`            | Full-width, collapsible (hidden behind icon on mobile)|
| Category filter bar    | —                  | Custom `CategoryChip` components (see §17.3)          |
| Sort dropdown          | `Select`           | Sort options: alphabetical, most purchased, recent    |
| Product card           | `Card`             | Category icon + name + avg price + purchase metadata  |
| Category icon          | Lucide icon        | Mapped per category (see §13.2)                       |
| Price display          | —                  | Custom `PriceDisplay` component (see §17.5)           |
| Load more button       | `Button`           | variant="outline", full width, triggers next page     |
| Empty state            | `EmptyState`       | When no products or no search results                 |
| Error state            | `ErrorState`       | On fetch failure                                      |
| Loading state          | `Skeleton`         | 6 skeleton product cards                              |

#### Product Card Detail

```
┌──────────────────────────────────────────────┐
│  [🥛]  Whole Milk                     [→]   │
│        Dairy                                 │
│        $3.50 avg · Purchased 12× · Apr 1    │
└──────────────────────────────────────────────┘
```

- Category icon: `w-8 h-8`, `text-muted-foreground`, left-aligned
- Product name: `text-base font-medium`
- Category name: `text-xs text-muted-foreground`
- Price + stats: `text-sm text-muted-foreground`
- Last purchased date: relative ("3 days ago", "2 weeks ago")
- Arrow chevron: `ChevronRight`, links to product detail
- Full card is tappable / clickable link

#### States

- **Loading**: 6 skeleton cards — icon placeholder + 2 text lines each; `aria-busy="true"`
- **Empty (no products)**: `Package` icon + "No products yet" + "Products appear here as you upload receipts and add items to your lists" (no CTA — products are auto-created)
- **Empty (search/filter no match)**: `Search` icon + "No products found for '{query}'" + "Clear filter" button
- **Error**: "Could not load products" + retry button

#### User Flow

1. User taps Products tab → default view loads (sorted by most purchased)
2. User can scroll category chips to filter by category → list updates
3. User can tap search icon → search bar expands → type to filter → results update as they type (300ms debounce)
4. User taps Sort dropdown → selects sort order → list re-sorts
5. User scrolls to bottom → taps "Load more" → next page appends
6. User taps a product card → navigates to `/products/[id]`

#### Responsive Behavior

- **Mobile**: Single column card list, `px-4`, search bar full width when expanded
- **Desktop**: Two-column card grid (`grid-cols-2 lg:grid-cols-3`), search bar always visible in header, filter chips in a fixed top area

#### i18n Keys

```
products.title                   — "Products" / "Productos"
products.searchPlaceholder       — "Search products..." / "Buscar productos..."
products.sort.label              — "Sort" / "Ordenar"
products.sort.alphabetical       — "Alphabetical" / "Alfabético"
products.sort.mostPurchased      — "Most Purchased" / "Más comprado"
products.sort.recentlyPurchased  — "Recently Purchased" / "Comprado recientemente"
products.filter.all              — "All" / "Todos"
products.card.avgPrice           — "avg" / "prom."
products.card.purchaseCount      — "Purchased {count}×" / "Comprado {count}×"
products.card.lastPurchased      — "{date}" / "{date}"
products.card.neverPurchased     — "Not yet purchased" / "Aún no comprado"
products.loadMore                — "Load more" / "Cargar más"
products.empty.title             — "No products yet" / "Aún no hay productos"
products.empty.description       — "Products appear here as you upload receipts and add items to your lists" / "Los productos aparecen aquí cuando subes recibos y agregas artículos a tus listas"
products.empty.searchTitle       — "No products found" / "No se encontraron productos"
products.empty.searchDescription — "No results for \"{query}\"" / "Sin resultados para \"{query}\""
products.empty.clearFilter       — "Clear filter" / "Limpiar filtro"
products.error.load              — "Could not load products" / "No se pudieron cargar los productos"
products.error.retry             — "Retry" / "Reintentar"
```

#### Accessibility Notes

- Product cards are `<article>` elements with `aria-label="{product name}, {category}"` for screen readers
- Category filter chips use `role="radio"` within a `role="radiogroup"` (only one active at a time)
- Search input has `aria-label="Search products"` and `aria-controls` pointing to the list
- Sort `Select` has `aria-label="Sort products by"`
- When search filters the list, announce result count to screen reader via `aria-live="polite"` region: "Showing 3 results for 'milk'"
- Keyboard: Tab navigates chips, Enter/Space activates

---

### 14.2 Screen: Product Detail Page

#### Purpose

Full detail view for a single product: purchase history timeline, price trend, category info, and quick-add to list. Admins can edit product metadata inline.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│ ← Products                  │  ← Back button
│                             │
│  ┌───────────────────────┐  │
│  │ [🥛]  Whole Milk      │  │  ← Product header card
│  │  Dairy · UNIT         │  │
│  │  $3.50 average price  │  │
│  │  Purchased 12 times   │  │
│  │  [✏️ Edit] (ADMIN)   │  │
│  └───────────────────────┘  │
│                             │
│  Price Trend                │  ← Trend section
│  ┌───────────────────────┐  │
│  │ ↑ $3.80 last purchase │  │  ← Up/down/stable indicator
│  │ (was $3.50 before)    │  │
│  └───────────────────────┘  │
│                             │
│  Purchase History           │
│  ┌───────────────────────┐  │
│  │ Apr 3   $3.80  ← receipt│ │  ← Timeline entry
│  │ Mar 25  $3.50  ← receipt│ │
│  │ Mar 18  $3.50  ← receipt│ │
│  │ Mar 10  $3.20  ← receipt│ │
│  │ [Show all 12 purchases] │ │  ← Expand button
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │ [+ Add to list]       │  │  ← Quick-add CTA
│  └───────────────────────┘  │
│                             │
└─────────────────────────────┘
```

#### Components

| Component              | shadcn/ui Base     | Purpose                                               |
| ---------------------- | ------------------ | ----------------------------------------------------- |
| Back button            | `Button`           | variant="ghost", `ChevronLeft` icon                   |
| Product header card    | `Card`             | Icon + name + category + default unit + avg price     |
| Edit button            | `Button`           | variant="outline", `Pencil` icon, ADMIN only          |
| Price trend indicator  | —                  | Custom (arrow icon + color + text, see §13.3)         |
| Purchase history list  | —                  | Timeline with date + price + receipt link             |
| Receipt link           | `Button`           | variant="ghost", `Receipt` icon, links to receipt     |
| Show all button        | `Button`           | variant="ghost", text only, expands list              |
| Add to list button     | `Button`           | variant="default", full width, `Plus` icon            |
| Edit product modal     | `Dialog`           | ADMIN inline edit form (see below)                    |

#### Edit Product Dialog (ADMIN only)

```
┌────────────────────────────┐
│ Edit Product             ✕ │
├────────────────────────────┤
│ Name                       │
│ ┌──────────────────────┐   │
│ │ Whole Milk           │   │
│ └──────────────────────┘   │
│ Category                   │
│ ┌──────────────────────┐   │
│ │ Dairy             ▾  │   │
│ └──────────────────────┘   │
│ Default Unit               │
│ ┌──────────────────────┐   │
│ │ UNIT              ▾  │   │
│ └──────────────────────┘   │
│                            │
│ [Cancel]      [Save]       │
└────────────────────────────┘
```

- Category selector: `Select` populated from `GET /categories`
- Unit selector: `Select` with all UnitType values (same options as item form)
- Save calls `PATCH /products/:id`

#### Purchase History Timeline Entry

```
┌──────────────────────────────────────┐
│ Apr 3, 2026     $3.80    🧾 →        │
│                 (×2 units)           │
└──────────────────────────────────────┘
```

- Date: `text-sm font-medium`
- Price: `text-sm` (colored by trend vs. previous: green if cheaper, red if more expensive)
- Quantity: `text-xs text-muted-foreground`
- Receipt icon: taps to `/receipts/[id]`
- Default show last 5 purchases; "Show all" expands

#### States

- **Loading**: Skeleton header (icon circle + 3 text lines), skeleton trend section, 3 skeleton timeline rows
- **Error**: "Could not load product details" + retry
- **No history**: Show header card; purchase history section shows "No purchases recorded yet"
- **Edit loading**: Save button disabled + spinner

#### User Flow

1. User arrives from Products list → sees product header, trend, recent history
2. User scrolls to see purchase timeline → taps receipt link → navigates to receipt detail
3. ADMIN: taps "Edit" → dialog opens pre-filled → edits → saves → toast "Product updated"
4. User taps "Add to list" → sheet slides up with list picker (existing lists shown) → selects a list → item added → toast "Added to [list name]"

#### Add to List Sheet (mobile) / Dialog (desktop)

```
┌─────────────────────────────┐
│ Add to List                 │
├─────────────────────────────┤
│ Whole Milk                  │  ← Product name (read-only)
│                             │
│ Select list                 │
│ ○ Weekly Groceries          │  ← Radio list of active lists
│ ○ Party Supplies            │
│                             │
│ Quantity        Unit        │
│ ┌──────────┐ ┌───────────┐  │
│ │ 1        │ │ UNIT   ▾  │  │
│ └──────────┘ └───────────┘  │
│                             │
│ [    Add to List    ]       │
└─────────────────────────────┘
```

#### Responsive Behavior

- **Mobile**: Single column, back button in header, purchase history as timeline cards
- **Desktop**: Two columns — header + trend on left, full purchase history on right (`grid-cols-2`)

#### i18n Keys

```
productDetail.backButton         — "Products" / "Productos"
productDetail.category           — "Category" / "Categoría"
productDetail.defaultUnit        — "Default unit" / "Unidad predeterminada"
productDetail.avgPrice           — "Average price" / "Precio promedio"
productDetail.purchaseCount      — "Purchased {count} times" / "Comprado {count} veces"
productDetail.editButton         — "Edit" / "Editar"
productDetail.priceTrend.title   — "Price Trend" / "Tendencia de precio"
productDetail.priceTrend.up      — "Up from last purchase" / "Subió desde la última compra"
productDetail.priceTrend.down    — "Down from last purchase" / "Bajó desde la última compra"
productDetail.priceTrend.stable  — "Stable" / "Estable"
productDetail.history.title      — "Purchase History" / "Historial de compras"
productDetail.history.showAll    — "Show all {count} purchases" / "Ver las {count} compras"
productDetail.history.noHistory  — "No purchases recorded yet" / "Aún no hay compras registradas"
productDetail.history.receiptLink — "View receipt" / "Ver recibo"
productDetail.addToList.button   — "Add to List" / "Agregar a lista"
productDetail.addToList.title    — "Add to List" / "Agregar a lista"
productDetail.addToList.selectList — "Select list" / "Seleccionar lista"
productDetail.addToList.quantity — "Quantity" / "Cantidad"
productDetail.addToList.unit     — "Unit" / "Unidad"
productDetail.addToList.confirm  — "Add to List" / "Agregar a lista"
productDetail.addToList.success  — "Added to {listName}" / "Agregado a {listName}"
productDetail.edit.title         — "Edit Product" / "Editar Producto"
productDetail.edit.nameLabel     — "Name" / "Nombre"
productDetail.edit.categoryLabel — "Category" / "Categoría"
productDetail.edit.unitLabel     — "Default Unit" / "Unidad Predeterminada"
productDetail.edit.save          — "Save" / "Guardar"
productDetail.edit.cancel        — "Cancel" / "Cancelar"
productDetail.edit.success       — "Product updated" / "Producto actualizado"
productDetail.error.load         — "Could not load product details" / "No se pudieron cargar los detalles del producto"
```

#### Accessibility Notes

- Back button has `aria-label="Back to Products"`
- Price trend indicator conveys information via text + icon (not color alone): "↑ Up from last purchase" in addition to color
- Purchase history is a `<ul>` timeline; each entry is `<li>` with `aria-label="{date}: purchased at {price}"`
- Edit dialog is an `AlertDialog` equivalent; traps focus; Cancel is default focus
- "Add to list" sheet/dialog traps focus; Escape closes
- ADMIN-only elements: `aria-hidden="true"` when current user is MEMBER (do not render, or visually hidden with no interaction)

---

## 15. Receipt Screens

### 15.1 Screen: Receipt Upload Flow

#### Purpose

Allow users to submit a receipt image for OCR processing. On mobile, the camera is the primary option; on desktop, file upload with drag-and-drop. After upload, users wait for processing before being redirected to the receipt detail.

#### Layout (ASCII wireframe — Mobile Upload)

```
┌─────────────────────────────┐
│ Upload Receipt              │  ← Page/sheet title
│                      [✕]   │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │    [📷 Camera icon]   │  │  ← Primary action zone
│  │                       │  │
│  │  Photograph your      │  │
│  │  receipt              │  │
│  │                       │  │
│  │ [📷 Take Photo]       │  │  ← Primary CTA (camera)
│  └───────────────────────┘  │
│                             │
│  ─── or upload from files ──│
│                             │
│  [📂 Choose File]           │  ← Secondary (file picker)
│                             │
│  JPEG, PNG, PDF · max 10MB  │  ← File type hint
│                             │
└─────────────────────────────┘
```

#### Layout (ASCII wireframe — Desktop Upload)

```
┌─────────────────────────────────────────┐
│ Upload Receipt                          │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │    [↑ Upload icon]                │  │
│  │                                   │  │
│  │    Drag & drop your receipt here  │  │
│  │    or click to browse             │  │
│  │                                   │  │
│  │    JPEG · PNG · PDF · max 10MB    │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Optional details                       │
│  Merchant name   Purchase date          │
│  ┌─────────────┐ ┌────────────────┐    │
│  │             │ │ Apr 3, 2026    │    │
│  └─────────────┘ └────────────────┘    │
│                                         │
│  [    Upload Receipt    ]               │
└─────────────────────────────────────────┘
```

#### Layout (ASCII wireframe — Upload Progress / Processing)

```
┌─────────────────────────────┐
│ Processing Receipt...       │
│                      [✕]   │
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │   [image thumbnail]   │  │  ← Small preview of uploaded image
│  └───────────────────────┘  │
│                             │
│  ████████████░░░░  75%      │  ← Upload progress bar
│  Uploading...               │  ← Changes to "Processing..."
│                             │
│  ┌───────────────────────┐  │
│  │  ○  Uploading image   │✓ │  ← Step indicator
│  │  ●  Reading receipt   │⟳ │  ← Spinner on current step
│  │  ○  Matching products │  │
│  └───────────────────────┘  │
│                             │
│  This usually takes         │
│  10-15 seconds              │
│                             │
└─────────────────────────────┘
```

#### Camera Guidance (mobile, before capture)

Guidance overlay displayed on mobile when camera is launched:
- "Align your receipt within the frame"
- "Ensure good lighting"
- Receipt outline guide (dashed border overlay)

#### Components

| Component                | shadcn/ui Base  | Purpose                                               |
| ------------------------ | --------------- | ----------------------------------------------------- |
| Upload container         | `Dialog`/`Sheet`| Modal (desktop Dialog, mobile Sheet from bottom)      |
| Camera zone (mobile)     | —               | Custom `FileUpload` component (see §17.1)             |
| Drag-drop zone (desktop) | —               | Custom `FileUpload` component                         |
| File input (hidden)      | `Input`         | type="file", accept=".jpg,.jpeg,.png,.pdf"            |
| Merchant name input      | `Input`         | Optional pre-fill for merchant                        |
| Purchase date picker     | `Input`         | type="date", optional                                 |
| Upload button            | `Button`        | variant="default", disabled until file selected       |
| Progress bar             | `Progress`      | shadcn/ui Progress component, 0–100                   |
| Step indicator           | —               | 3-step list: Uploading → Reading → Matching           |
| Wait message             | —               | "This usually takes 10–15 seconds"                    |

#### States

- **Idle**: Upload zone visible; no file selected; Upload button disabled
- **File selected**: Zone shows file name + size + thumbnail (if image); Upload button enabled
- **Uploading (0–100%)**: Progress bar animates; step 1 active; Cancel button available
- **Processing**: Progress bar at 100%; step 2/3 active with spinner; no cancel (already uploaded)
- **Error (file too large)**: Inline error "File is too large. Maximum size is 10MB."
- **Error (wrong type)**: Inline error "Invalid file type. Please upload JPEG, PNG, or PDF."
- **Error (upload failed)**: Error message + "Try again" button
- **Error (processing failed)**: "Receipt processing failed. You can try uploading again or submit manually." + Retry
- **Success**: Auto-redirect to `/receipts/[id]` with toast "Receipt uploaded! Processing..."

#### User Flow (Mobile)

1. User taps FAB / "Upload Receipt" on Receipts list
2. Sheet slides up showing camera zone + file option
3. User taps "Take Photo" → device camera opens
4. User photographs receipt → camera returns image to app
5. Sheet shows image preview + file details
6. Optional: user fills in merchant name / date
7. User taps "Upload Receipt"
8. Progress bar shows upload → transitions to processing steps
9. On success: redirect to receipt detail
10. On failure: error message + retry option

#### User Flow (Desktop)

1. User clicks "Upload Receipt" button on Receipts page
2. Dialog opens with drag-drop zone
3. User drags file in (drop zone highlights) OR clicks to browse
4. File selected → preview shown; optional fields visible
5. User clicks "Upload Receipt"
6. Progress + processing steps animate
7. Redirect to receipt detail on completion

#### Responsive Behavior

- **Mobile**: Sheet (bottom slide-up), camera as primary, full-width buttons, compact step list
- **Desktop**: Centered dialog (`max-w-lg`), drag-drop zone with dashed border, side-by-side optional fields

#### i18n Keys

```
receiptUpload.title              — "Upload Receipt" / "Subir Recibo"
receiptUpload.camera.title       — "Photograph your receipt" / "Fotografía tu recibo"
receiptUpload.camera.button      — "Take Photo" / "Tomar Foto"
receiptUpload.camera.guidance    — "Align receipt, ensure good lighting" / "Alinea el recibo con buena iluminación"
receiptUpload.divider            — "or upload from files" / "o subir desde archivos"
receiptUpload.fileButton         — "Choose File" / "Elegir Archivo"
receiptUpload.dragDrop.title     — "Drag & drop your receipt here" / "Arrastra tu recibo aquí"
receiptUpload.dragDrop.subtitle  — "or click to browse" / "o haz clic para buscar"
receiptUpload.fileHint           — "JPEG · PNG · PDF · max 10MB" / "JPEG · PNG · PDF · máx 10MB"
receiptUpload.optional.title     — "Optional details" / "Detalles opcionales"
receiptUpload.optional.merchant  — "Merchant name" / "Nombre del comercio"
receiptUpload.optional.date      — "Purchase date" / "Fecha de compra"
receiptUpload.submitButton       — "Upload Receipt" / "Subir Recibo"
receiptUpload.processing.title   — "Processing Receipt..." / "Procesando Recibo..."
receiptUpload.processing.step1   — "Uploading image" / "Subiendo imagen"
receiptUpload.processing.step2   — "Reading receipt" / "Leyendo recibo"
receiptUpload.processing.step3   — "Matching products" / "Asociando productos"
receiptUpload.processing.wait    — "This usually takes 10–15 seconds" / "Esto suele tardar 10–15 segundos"
receiptUpload.error.tooLarge     — "File is too large. Maximum size is 10MB." / "El archivo es muy grande. El máximo es 10MB."
receiptUpload.error.wrongType    — "Invalid file type. Please upload JPEG, PNG, or PDF." / "Tipo de archivo inválido. Sube JPEG, PNG o PDF."
receiptUpload.error.uploadFailed — "Upload failed. Please try again." / "Fallo al subir. Inténtalo de nuevo."
receiptUpload.error.processFailed — "Receipt processing failed. You can try again." / "Falló el procesamiento. Puedes intentarlo de nuevo."
receiptUpload.success.toast      — "Receipt uploaded! Processing..." / "¡Recibo subido! Procesando..."
```

#### Accessibility Notes

- Upload zone is a `<label>` wrapping a visually hidden `<input type="file">` — entire zone is keyboard activatable
- Drag-drop zone announces "Drag and drop zone" via `aria-label`; `aria-dropeffect="copy"` during drag
- Progress bar uses `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Processing steps use `aria-live="polite"` to announce step changes
- Camera button has `aria-label="Open camera to photograph receipt"`
- File selected state: announces file name via `aria-live="assertive"`
- `prefers-reduced-motion`: disable progress bar animation, use static completion state

---

### 15.2 Screen: Receipts List Page

#### Purpose

View all receipts uploaded by the household, with filtering by date range and processing status. Entry point for receipt upload.

#### Layout (ASCII wireframe)

```
┌─────────────────────────────┐
│ Receipts            [+ ]    │  ← Title + Upload FAB
├─────────────────────────────┤
│ [All] [Processing] [Done]   │  ← Status filter tabs
│ [Failed]                    │
├─────────────────────────────┤
│ 📅 Apr 1–Apr 5 (date range) │  ← Date range filter (collapsible)
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │ [img] Supermarket XYZ   │ │  ← Receipt card
│ │       Apr 3, 2026       │ │
│ │       $49.14 · 12 items │ │
│ │       ● COMPLETED ✓     │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ [img] Unknown Merchant  │ │
│ │       Apr 1, 2026       │ │
│ │       ⟳ PROCESSING      │ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ [img] Mini Market       │ │
│ │       Mar 30, 2026      │ │
│ │       $23.50 · 5 items  │ │
│ │       ✕ FAILED          │ │
│ └─────────────────────────┘ │
│                             │
└─────────────────────────────┘
```

#### Components

| Component              | shadcn/ui Base     | Purpose                                               |
| ---------------------- | ------------------ | ----------------------------------------------------- |
| Page header + FAB      | —                  | Title + Upload button (`Plus` icon, primary)          |
| Status filter tabs     | `Tabs`             | All / Processing / Completed / Failed                 |
| Date range filter      | `Collapsible`      | Collapsible section with two date inputs              |
| Date inputs            | `Input`            | type="date", start and end                            |
| Receipt card           | `Card`             | Thumbnail + merchant + date + total + status badge    |
| Image thumbnail        | `img`              | 64×64px, `object-cover rounded`, from `imageUrl`      |
| Status badge           | `StatusBadge`      | Custom (see §17.4) with icon + color per status       |
| Total amount           | `PriceDisplay`     | Custom (see §17.5)                                    |
| Empty state            | `EmptyState`       | No receipts at all or no match for filters            |
| Loading skeleton       | `Skeleton`         | 4 skeleton receipt cards                              |

#### Receipt Card Detail

```
┌──────────────────────────────────────────────┐
│ [64px img] │  Supermarket XYZ               →│
│            │  Apr 3, 2026                    │
│            │  $49.14 · 12 items              │
│            │  [● COMPLETED]                  │
└──────────────────────────────────────────────┘
```

- Thumbnail: `w-16 h-16`, `object-cover`, `rounded-md`, fallback to `Receipt` icon on error
- Merchant: `text-base font-medium`, fallback "Unknown Merchant" if `merchantName` is null
- Date: `text-sm text-muted-foreground`
- Total + item count: `text-sm text-muted-foreground` (only shown for COMPLETED receipts)
- Status badge: right-aligned (see `StatusBadge` in §17.4)
- Full card is tappable → `/receipts/[id]`
- PROCESSING receipts: show spinner instead of price

#### States

- **Loading**: 4 skeleton cards with thumbnail placeholder + 3 text lines each
- **Empty (no receipts)**: `Receipt` icon + "No receipts yet" + "Upload your first receipt to start tracking purchases" + "Upload Receipt" CTA button
- **Empty (filtered)**: `Search` icon + "No {status} receipts" + "Clear filters" link
- **Error**: "Could not load receipts" + retry
- **Processing (polling)**: PROCESSING receipts poll status every 5 seconds; when status changes to COMPLETED/FAILED, card updates in place with `aria-live` announcement

#### User Flow

1. User taps Receipts tab → default view loads (all receipts, newest first)
2. User taps status filter tabs to filter (e.g., only Failed)
3. User expands date range filter → sets start/end dates → list filters
4. User taps FAB / "Upload Receipt" → upload flow opens (see §15.1)
5. User taps a receipt card → navigates to `/receipts/[id]`
6. PROCESSING receipts auto-update when processing completes (polling or websocket)

#### Responsive Behavior

- **Mobile**: Single column cards, FAB is `size="icon"` in header, date filter collapsible
- **Desktop**: Two-column grid cards (`grid-cols-2`), filter row stays visible (not collapsible), upload button shows full text "Upload Receipt"

#### i18n Keys

```
receipts.title                   — "Receipts" / "Recibos"
receipts.uploadButton            — "Upload Receipt" / "Subir Recibo"
receipts.filter.all              — "All" / "Todos"
receipts.filter.processing       — "Processing" / "Procesando"
receipts.filter.completed        — "Completed" / "Completados"
receipts.filter.failed           — "Failed" / "Fallidos"
receipts.dateFilter.title        — "Date Range" / "Rango de fechas"
receipts.dateFilter.from         — "From" / "Desde"
receipts.dateFilter.to           — "To" / "Hasta"
receipts.dateFilter.clear        — "Clear" / "Limpiar"
receipts.card.merchant.unknown   — "Unknown Merchant" / "Comercio desconocido"
receipts.card.items              — "{count} items" / "{count} artículos"
receipts.card.processing         — "Processing..." / "Procesando..."
receipts.status.PENDING          — "Pending" / "Pendiente"
receipts.status.PROCESSING       — "Processing" / "Procesando"
receipts.status.COMPLETED        — "Completed" / "Completado"
receipts.status.FAILED           — "Failed" / "Fallido"
receipts.empty.title             — "No receipts yet" / "Aún no hay recibos"
receipts.empty.description       — "Upload your first receipt to start tracking purchases" / "Sube tu primer recibo para empezar a rastrear compras"
receipts.empty.cta               — "Upload Receipt" / "Subir Recibo"
receipts.empty.filtered          — "No {status} receipts" / "No hay recibos {status}"
receipts.empty.clearFilters      — "Clear filters" / "Limpiar filtros"
receipts.error.load              — "Could not load receipts" / "No se pudieron cargar los recibos"
receipts.error.retry             — "Retry" / "Reintentar"
```

#### Accessibility Notes

- Receipt cards are `<article>` with `aria-label="{merchant}, {date}, {status}"`
- Status filter tabs: `role="tablist"` with `aria-selected`
- Date range inputs: paired with visible `<label>` elements; associated via `htmlFor`
- Processing status updates announced via `aria-live="polite"` region at page level
- Upload FAB: `aria-label="Upload new receipt"`
- Status badge: color + icon + text (never color alone); screen reader reads "Status: Completed"

---

### 15.3 Screen: Receipt Detail Page

#### Purpose

View the full parsed receipt: the original image alongside all extracted line items. Users can correct OCR errors inline. Failed receipts show the error and retry options.

#### Layout (ASCII wireframe — Desktop, split view)

```
┌─────────────────────────────────────────────────────────┐
│ ← Receipts   Supermarket XYZ · Apr 3, 2026 [● COMPLETED]│
├──────────────────────────┬──────────────────────────────┤
│                          │  Items (12)                  │
│   [Receipt Image]        │  ┌──────────────────────┐   │
│   (zoomable/pannable)    │  │ Whole Milk ×2  $7.00 │✏️│   │
│                          │  │ 🥛 Whole Milk (linked)│   │
│   [🔍 Zoom in]           │  ├──────────────────────┤   │
│   [🔍 Zoom out]          │  │ Chicken ×1     $8.20 │✏️│   │
│                          │  │ 🥩 Chicken Breast     │   │
│                          │  ├──────────────────────┤   │
│                          │  │ ⚠️ "Lche entera" ×1  │✏️│  │
│                          │  │ (unmatched)    $3.50  │   │
│                          │  └──────────────────────┘   │
│                          │                             │
│                          │  ──────────────────────     │
│                          │  Subtotal           $45.50  │
│                          │  Tax                 $3.64  │
│                          │  Total              $49.14  │
│                          │                             │
└──────────────────────────┴─────────────────────────────┘
```

#### Layout (ASCII wireframe — Mobile, stacked)

```
┌─────────────────────────────┐
│ ← Receipts                  │
│ Supermarket XYZ             │
│ Apr 3, 2026 · ● COMPLETED   │
├─────────────────────────────┤
│ ▾ Receipt Image (tap to     │  ← Collapsible image section
│   expand)                   │
│ ┌─────────────────────────┐ │
│ │  [receipt thumbnail]    │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Items (12)                  │
│                             │
│ ┌─────────────────────────┐ │
│ │ Whole Milk ×2    $7.00  │ │  ← Item card (not table)
│ │ 🥛 Whole Milk (linked) ✏️│ │
│ └─────────────────────────┘ │
│                             │
│ ┌─────────────────────────┐ │
│ │ ⚠️ "Lche entera" ×1    │ │  ← Unmatched (highlighted)
│ │ Not linked       $3.50 ✏️│ │
│ └─────────────────────────┘ │
│                             │
│ ──────────────────────────  │
│ Subtotal             $45.50 │
│ Tax                   $3.64 │
│ Total                $49.14 │
│                             │
└─────────────────────────────┘
```

#### Failed Receipt Layout

```
┌─────────────────────────────┐
│ ← Receipts                  │
│ Unknown Merchant            │
│ Apr 1, 2026 · ✕ FAILED      │
├─────────────────────────────┤
│                             │
│ ⚠️ Processing Failed        │
│ Could not extract text      │
│ from image. Please upload   │
│ a clearer photo.            │
│                             │
│ [🔄 Retry Processing]       │
│ [🗑 Delete Receipt]         │
│                             │
│ ┌─────────────────────────┐ │
│ │ [original image]        │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

#### Components

| Component              | shadcn/ui Base       | Purpose                                            |
| ---------------------- | -------------------- | -------------------------------------------------- |
| Back button            | `Button`             | variant="ghost", links back to /receipts           |
| Receipt header         | —                    | Merchant + date + status badge                     |
| Status badge           | `StatusBadge`        | Custom (see §17.4)                                 |
| Image panel            | —                    | Custom `ImageViewer` component (see §17.2)         |
| Image collapse         | `Collapsible`        | Mobile: collapsible image section                  |
| Zoom controls          | `Button`             | variant="outline", size="icon", +/- zoom           |
| Items section header   | —                    | "Items ({count})" with section label               |
| Item row (desktop)     | —                    | Table row: name, qty, unit price, total, edit btn  |
| Item card (mobile)     | `Card`               | Card layout for each item (replaces table on mobile)|
| Matched product link   | —                    | Product name + category icon, links to product     |
| Unmatched indicator    | `Badge`              | variant="warning", `AlertCircle` icon, "Not linked"|
| Edit item button       | `Button`             | variant="ghost", `Pencil` icon, opens correction modal|
| Receipt summary        | —                    | Subtotal / Tax / Total in a summary section        |
| Failed state           | `Alert`              | variant="destructive", error message + actions     |
| Retry button           | `Button`             | variant="outline", `RefreshCw` icon                |
| Delete button          | `Button`             | variant="destructive", `Trash2` icon               |

#### Item Row / Card Detail

```
Desktop row:
┌────────────────────────────────────────────────────────┐
│ Whole Milk ×2  │  $3.50/unit  │  $7.00  │  🥛 Whole Milk │ ✏️ │
└────────────────────────────────────────────────────────┘

Mobile card (unmatched — highlighted):
┌───────────────────────────────────────┐
│ ⚠️  "Lche entera"                 ✏️  │  ← amber border
│     ×1 · $3.50                        │
│     [Not linked to a product]         │
└───────────────────────────────────────┘
```

- Matched items: white background; product name + category icon below item name
- Unmatched items: `border-warning/50 bg-warning/5` background; `AlertCircle` icon in amber; "Not linked to a product" label
- Edit button: `Pencil` icon, opens Receipt Item Correction Modal (see §15.4)

#### States

- **Loading**: Skeleton image placeholder (tall rectangle) + skeleton items (8 rows of 4 columns)
- **Processing (in-progress)**: Items section shows "Still processing... Check back in a moment." + spinner; image shown if available
- **Completed**: Full layout as specified above
- **Failed**: Error state with retry + delete; original image visible
- **Error (load)**: "Could not load receipt details" + retry

#### User Flow

1. User arrives from receipts list → sees full receipt with image + items
2. User taps `+` zoom on image → image zooms; can pan; taps `-` to zoom out
3. User reviews items → spots unmatched (amber) item → taps edit `✏️`
4. Correction modal opens (see §15.4) → user corrects → saves
5. Item updates in list, amber indicator removed if now matched
6. For FAILED receipts: user taps "Retry Processing" → receipt status resets to PENDING → processing restarts

#### Responsive Behavior

- **Desktop**: Fixed left panel (image, ~50% width, sticky while scrolling data panel); right panel scrollable with items table
- **Mobile**: Stacked layout — collapsible image at top (collapsed by default to save space), items as cards below (not a table), summary section at bottom
- Image panel breakpoint: `hidden md:block` for sticky panel; mobile uses `Collapsible`

#### i18n Keys

```
receiptDetail.backButton          — "Receipts" / "Recibos"
receiptDetail.merchant.unknown    — "Unknown Merchant" / "Comercio desconocido"
receiptDetail.image.title         — "Receipt Image" / "Imagen del recibo"
receiptDetail.image.expand        — "View receipt image" / "Ver imagen del recibo"
receiptDetail.image.collapse      — "Hide receipt image" / "Ocultar imagen del recibo"
receiptDetail.image.zoomIn        — "Zoom in" / "Acercar"
receiptDetail.image.zoomOut       — "Zoom out" / "Alejar"
receiptDetail.items.title         — "Items ({count})" / "Artículos ({count})"
receiptDetail.items.name          — "Item" / "Artículo"
receiptDetail.items.qty           — "Qty" / "Cant."
receiptDetail.items.unitPrice     — "Unit price" / "Precio unitario"
receiptDetail.items.total         — "Total" / "Total"
receiptDetail.items.product       — "Linked product" / "Producto asociado"
receiptDetail.items.unmatched     — "Not linked to a product" / "No asociado a un producto"
receiptDetail.items.edit          — "Edit item" / "Editar artículo"
receiptDetail.items.processing    — "Still processing... Check back in a moment." / "Aún procesando... Vuelve en un momento."
receiptDetail.summary.subtotal    — "Subtotal" / "Subtotal"
receiptDetail.summary.tax         — "Tax" / "Impuesto"
receiptDetail.summary.total       — "Total" / "Total"
receiptDetail.failed.title        — "Processing Failed" / "Procesamiento fallido"
receiptDetail.failed.retry        — "Retry Processing" / "Reintentar procesamiento"
receiptDetail.failed.delete       — "Delete Receipt" / "Eliminar recibo"
receiptDetail.failed.deleteConfirm — "Delete this receipt?" / "¿Eliminar este recibo?"
receiptDetail.failed.deleteDescription — "This cannot be undone." / "Esta acción no se puede deshacer."
receiptDetail.error.load          — "Could not load receipt details" / "No se pudieron cargar los detalles del recibo"
```

#### Accessibility Notes

- Image viewer: `role="img"` with `aria-label="Receipt image from {merchant} on {date}"`; zoom buttons have `aria-label`
- Items table (desktop): proper `<table>` with `<thead>` and `<th scope="col">` headers; each `<tr>` has `aria-label`
- Item cards (mobile): each card has `aria-label="{item name}, quantity: {qty}, total: {price}"`
- Unmatched items: `role="alert"` is too noisy here; use `aria-label` on the warning badge instead: "This item is not linked to a product"
- Edit buttons: `aria-label="Edit {item name}"`
- Retry/Delete for failed: `AlertDialog` for delete confirmation; Cancel auto-focused
- Collapsible image on mobile: `aria-expanded`, toggle button with clear label

---

### 15.4 Screen: Receipt Item Correction Modal

#### Purpose

Allow users to fix OCR errors in a single receipt item: correct name, quantity, price, or re-link to a different product in the catalog. Preserves original OCR value for reference.

#### Layout (ASCII wireframe)

```
┌──────────────────────────────┐
│ Edit Item                  ✕ │
├──────────────────────────────┤
│ Original: "Lche entera"      │  ← Original OCR value (muted, read-only)
│                              │
│ Name                         │
│ ┌────────────────────────┐   │
│ │ Leche entera           │   │  ← Editable (corrected name)
│ └────────────────────────┘   │
│                              │
│ Quantity       Unit Price    │
│ ┌───────────┐ ┌───────────┐  │
│ │ 1         │ │ $3.50     │  │
│ └───────────┘ └───────────┘  │
│                              │
│ Total Price                  │
│ ┌────────────────────────┐   │
│ │ $3.50                  │   │
│ └────────────────────────┘   │
│                              │
│ Link to product              │
│ ┌────────────────────────┐   │
│ │ 🔍 Search products...  │   │  ← ProductAutocomplete (see §17.6)
│ └────────────────────────┘   │
│ ┌────────────────────────┐   │
│ │ 🥛 Whole Milk          │   │  ← Suggestion / current link
│ │ Dairy · $3.50 avg      │   │
│ └────────────────────────┘   │
│                              │
│ [+ Create new product]       │  ← If no match found
│                              │
│ [  Cancel  ]   [  Save  ]    │
└──────────────────────────────┘
```

#### Components

| Component              | shadcn/ui Base     | Purpose                                               |
| ---------------------- | ------------------ | ----------------------------------------------------- |
| Dialog container       | `Dialog`           | Modal (both mobile and desktop)                       |
| Title                  | `DialogTitle`      | "Edit Item"                                           |
| Original value label   | —                  | `text-xs text-muted-foreground italic`, read-only     |
| Name input             | `Input`            | Pre-filled with current name                         |
| Quantity input         | `Input`            | type="number", `inputMode="decimal"`                  |
| Unit price input       | `Input`            | type="number", `inputMode="decimal"`, currency prefix|
| Total price input      | `Input`            | type="number", auto-calculated but editable           |
| Product autocomplete   | —                  | Custom `ProductAutocomplete` (see §17.6)              |
| Product suggestion card| `Card`             | Category icon + name + avg price; tappable selection  |
| Create product link    | `Button`           | variant="ghost", `Plus` icon, opens new product flow  |
| Cancel button          | `Button`           | variant="outline"                                     |
| Save button            | `Button`           | variant="default", calls `PATCH /receipts/:id/items/:itemId`|

#### Original OCR Value Display

```
┌──────────────────────────────────────────┐
│ Original OCR: "Lche entera"  [← muted]  │
└──────────────────────────────────────────┘
```

- Always shown as reference regardless of how many times the item is edited
- Styled: `text-xs text-muted-foreground italic`
- Label: "Original OCR:" in bold, then value in normal weight
- Cannot be changed (informational only)

#### Product Autocomplete Behavior

1. User starts typing in the product search → debounce 300ms → `GET /products?search={query}`
2. Results show as dropdown: category icon + product name + avg price
3. User selects a product → product linked; displays as selected product card below
4. User can clear selection (× button on selected card) to unlink
5. If no results: shows "No products found" + "Create new product" option
6. "Create new product" pre-fills the product name from the corrected item name → opens brief product creation flow inline

#### States

- **Loading (save)**: Save button disabled + spinner
- **Validation error**: Name required; quantity and prices must be > 0
- **Product search loading**: Small spinner inside autocomplete input
- **No product match**: "No products found" message + "Create new product" option
- **Success**: Dialog closes; item in receipt updates; toast "Item updated"

#### User Flow

1. User taps `✏️` on a receipt item → correction dialog opens
2. Dialog shows original OCR value + current parsed values pre-filled
3. User corrects name → types in product search → selects from suggestions
4. Quantity / price auto-calculated (total = qty × unit price) but editable independently
5. User taps "Save" → API `PATCH /receipts/:id/items/:itemId`
6. Dialog closes; item row updates; if product linked, amber warning removed

#### i18n Keys

```
itemCorrection.title             — "Edit Item" / "Editar Artículo"
itemCorrection.original          — "Original OCR:" / "OCR original:"
itemCorrection.nameLabel         — "Name" / "Nombre"
itemCorrection.quantityLabel     — "Quantity" / "Cantidad"
itemCorrection.unitPriceLabel    — "Unit Price" / "Precio unitario"
itemCorrection.totalPriceLabel   — "Total Price" / "Precio total"
itemCorrection.linkProduct       — "Link to product" / "Asociar a producto"
itemCorrection.searchProduct     — "Search products..." / "Buscar productos..."
itemCorrection.noProductFound    — "No products found" / "No se encontraron productos"
itemCorrection.createProduct     — "Create new product" / "Crear nuevo producto"
itemCorrection.selectedProduct   — "Linked to: {name}" / "Asociado a: {name}"
itemCorrection.clearProduct      — "Clear product link" / "Quitar asociación"
itemCorrection.saveButton        — "Save" / "Guardar"
itemCorrection.cancelButton      — "Cancel" / "Cancelar"
itemCorrection.validation.nameRequired — "Item name is required" / "El nombre es obligatorio"
itemCorrection.validation.quantityMin  — "Quantity must be greater than 0" / "La cantidad debe ser mayor a 0"
itemCorrection.validation.priceMin     — "Price must be greater than 0" / "El precio debe ser mayor a 0"
itemCorrection.success           — "Item updated" / "Artículo actualizado"
```

#### Accessibility Notes

- Dialog traps focus; Escape closes (preserving edits is intentional — user must tap Cancel to discard)
- Original OCR value: `aria-label="Original OCR value: {value}"`, not interactive
- Quantity and price inputs: `inputMode="decimal"` for mobile numeric keyboard
- Total price auto-calculation announced via `aria-live="polite"` when it updates
- Product autocomplete dropdown: `role="listbox"` / `role="option"` for keyboard navigation (up/down arrows, Enter to select)
- "Create new product" button: `aria-label="Create a new product named {itemName}"`
- Cancel should be default focus (not save) to prevent accidental saves

---

## 16. Enhanced Add-Item Flow

### 16.1 Screen: List Detail — Product Autocomplete Update

#### Purpose

Upgrade the existing "quick add" input in List Detail (§6.3) to suggest matching products from the catalog as the user types. Selecting a product pre-fills the unit and links the `productId`. Free-text entry still allowed for unlinked items.

#### Layout Update (ASCII wireframe — suggestion dropdown open)

```
┌─────────────────────────────┐
│ ← Weekly Groceries  [···]   │
│ 🟢 Active  ·  8 items       │
├─────────────────────────────┤
│                             │
│  [item list...]             │
│                             │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ [+] milk              ↑ │ │  ← Quick-add input with text typed
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │  ← Suggestion dropdown (above input)
│ │ 🥛 Whole Milk    $3.50  │ │  ← Suggestion row 1
│ │    Dairy · UNIT         │ │
│ ├─────────────────────────┤ │
│ │ 🥛 Skim Milk     $2.80  │ │  ← Suggestion row 2
│ │    Dairy · UNIT         │ │
│ ├─────────────────────────┤ │
│ │ ── Free text entry ──── │ │  ← Divider: use as-typed or select
│ │ Add "milk" as new item  │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

#### Behavior

| User Action                              | System Response                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------- |
| Type ≥2 characters                       | Query `GET /products?search={query}&limit=5`; show dropdown (debounced 300ms) |
| Select a product suggestion              | Pre-fill name + unit from product; set `productId`; add to list; input clears |
| Select "Add '{text}' as new item"         | Add item with typed name; no `productId`; input clears                  |
| Press Enter with no suggestion selected  | Add item as free text (same as before); input clears                    |
| No products match                        | Only show "Add '{text}' as new item" option                             |
| Press Escape                             | Close dropdown; keep focus on input                                     |

#### Suggestion Row Detail

```
┌──────────────────────────────────────────────────────┐
│  [🥛]  Whole Milk                          $3.50 avg │
│         Dairy · UNIT                                 │
└──────────────────────────────────────────────────────┘
```

- Category icon: `w-5 h-5`, left side
- Product name: `text-sm font-medium`
- Category + unit: `text-xs text-muted-foreground`
- Average price: `text-xs text-muted-foreground`, right-aligned, only shown if `averagePrice` exists
- Highlighted on hover/focus: `bg-muted`
- Touch target: min `h-12` (48px) for comfortable tapping while shopping

#### Visual Feedback on Selection

When a product suggestion is selected:
- Input briefly shows selected product name (200ms) then clears — rapid-add experience preserved
- Small product category icon appears in the input prefix area momentarily
- Toast: optional, skip for quick-add to avoid disrupting shopping flow

#### States

- **Idle (< 2 chars)**: No dropdown; input shows placeholder
- **Loading suggestions**: Spinner in input suffix; dropdown not yet shown
- **Suggestions available**: Dropdown with matching products + free-text option at bottom
- **No matches**: Dropdown shows only "Add '{text}' as new item"
- **Selected (product)**: Item added with product link; input clears; no dropdown
- **Selected (free text)**: Item added without product link; input clears

#### i18n Keys

```
quickAdd.placeholder           — "Add an item..." / "Agregar un artículo..."
quickAdd.addFreeText           — "Add \"{text}\" as new item" / "Agregar \"{text}\" como nuevo artículo"
quickAdd.suggestion.avgPrice   — "avg" / "prom."
quickAdd.searching             — "Searching..." / "Buscando..."
quickAdd.noResults             — "No matching products" / "Sin productos coincidentes"
quickAdd.productLinked         — "Linked to {product}" / "Asociado a {product}"
```

#### Accessibility Notes

- Suggestion dropdown: `role="listbox"` with `id` referenced by `aria-owns` on the input
- Input has `aria-expanded="true"` when dropdown is open, `aria-haspopup="listbox"`
- Each suggestion: `role="option"`, `aria-selected="false"` (or true when selected)
- Keyboard navigation: ArrowDown opens/navigates dropdown; ArrowUp navigates; Enter selects; Escape closes
- When suggestion selected, announce via `aria-live="polite"`: "Added {product name} to list"
- When free-text added, announce: "Added {name} to list"
- Price information in suggestions is decorative for quick-add context; not critical for screen reader flow

---

## 17. Phase 2 Common Components

### 17.1 Component: FileUpload

#### Purpose

Handles file selection from both camera (mobile) and file picker / drag-drop (desktop). Wraps the native file input with accessible custom UI.

#### Variants

**Mobile variant:**
```
┌──────────────────────────────────────┐
│                                      │
│    [📷 Camera icon, 48px]            │
│                                      │
│    Photograph your receipt           │
│    Ensure good lighting              │
│                                      │
│    [📷  Take Photo]                  │  ← Primary button, full width
│    [📂  Choose from files]           │  ← Secondary button
│                                      │
└──────────────────────────────────────┘
```

**Desktop variant (drag-drop zone):**
```
┌─────────────────────────────────────────┐
│                                         │
│          [↑  Upload icon, 40px]         │
│                                         │
│    Drag & drop your receipt here        │
│    or  [click to browse]                │  ← inline link
│                                         │
│    JPEG · PNG · PDF · max 10MB          │
│                                         │
└─────────────────────────────────────────┘  (dashed border, rounded-lg)
```

**Drag-active state (desktop):**
```
┌─────────────────────────────────────────┐
│  ┌─────────────────────────────────┐    │  ← border becomes solid primary
│  │  Drop here to upload            │    │
│  └─────────────────────────────────┘    │  ← bg changes to primary/5
└─────────────────────────────────────────┘
```

**File selected state (both):**
```
┌──────────────────────────────────────┐
│  [image thumbnail / pdf icon]        │
│  receipt_photo.jpg                   │
│  2.3 MB                              │
│  [✕  Remove]                         │
└──────────────────────────────────────┘
```

#### Props (for Frontend Developer)

```typescript
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  accept?: string;         // default: ".jpg,.jpeg,.png,.pdf"
  maxSizeMb?: number;      // default: 10
  variant?: 'camera' | 'dropzone';  // camera on mobile, dropzone on desktop
  selectedFile?: File | null;
  error?: string;
}
```

#### shadcn/ui Base: None (custom), using hidden `Input type="file"` + `Button` + `Card`

---

### 17.2 Component: ImageViewer

#### Purpose

Display receipt images with pan and zoom controls. Used in Receipt Detail (both mobile and desktop).

#### Layout

```
┌──────────────────────────────────────┐
│  [receipt image, fills container]    │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ [-]   50%   [+]   [⤢ Fullscreen]│  │  ← Zoom controls bar at bottom
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

- Pinch-to-zoom on mobile (native CSS touch-action)
- Scroll-to-zoom on desktop (mouse wheel)
- Pan by dragging (touch on mobile, mouse drag on desktop)
- Zoom range: 50%–300% in 25% steps via buttons
- Fullscreen button: native `requestFullscreen()` API, with fallback
- `prefers-reduced-motion`: disable zoom transition animation

#### Props (for Frontend Developer)

```typescript
interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}
```

#### shadcn/ui Base: None (custom). Consider `@use-gesture/react` for gesture handling.

---

### 17.3 Component: CategoryChip

#### Purpose

Selectable filter chip representing a product category, with category icon and name. Used in Product Catalog filter bar.

#### Variants

```
Inactive:  [🥛 Dairy]     border, bg-background, text-foreground
Active:    [🥛 Dairy]     bg-primary, text-primary-foreground, no border
All chip:  [All]          special "all categories" chip
```

#### Layout

```
┌──────────────────┐
│  [🥛]  Dairy     │   h-8, px-3, rounded-full, text-xs font-medium
└──────────────────┘
```

- Minimum touch target: enforce by wrapping in `min-h-[44px]` container or adding vertical padding
- Icon: `w-4 h-4` Lucide icon mapped per category (see §13.2)
- Gap between chips: `gap-2`
- Horizontal scroll container: `overflow-x-auto`, scrollbar hidden on mobile

#### Props (for Frontend Developer)

```typescript
interface CategoryChipProps {
  category: { id: string; name: string; icon?: string };
  isActive: boolean;
  onClick: () => void;
}
```

#### shadcn/ui Base: Custom, using `Button` as primitive (`variant="outline"` modified with Tailwind)

---

### 17.4 Component: StatusBadge

#### Purpose

Color-coded badge displaying the processing status of a receipt. Uses both color and icon (never color alone).

#### Variants

```
PENDING:    [○ Pending]      bg-muted text-muted-foreground    Clock icon
PROCESSING: [⟳ Processing]   bg-amber-100 text-amber-800       Loader2 icon (spinning)
COMPLETED:  [✓ Completed]    bg-green-100 text-green-800       CheckCircle2 icon
FAILED:     [✕ Failed]       bg-red-100 text-red-800           XCircle icon
```

- Height: `h-6`, padding: `px-2`, font: `text-xs font-medium`
- Icon: `w-3 h-3`, `mr-1`
- PROCESSING spinner: `animate-spin` (respect `prefers-reduced-motion` — show static icon if reduced)
- Dark mode: adjusted bg/text tokens for visibility

#### Props (for Frontend Developer)

```typescript
type ReceiptStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

interface StatusBadgeProps {
  status: ReceiptStatus;
}
```

#### shadcn/ui Base: `Badge` (customized with color overrides via Tailwind variants)

---

### 17.5 Component: PriceDisplay

#### Purpose

Formatted currency display with locale-aware formatting. Handles null/undefined prices gracefully.

#### Variants

```
Standard:   $3.50          text-sm
Large:      $49.14         text-lg font-semibold
Muted:      $3.50          text-sm text-muted-foreground
Trend up:   ↑ $3.80        text-sm text-destructive + TrendingUp icon
Trend down: ↓ $3.20        text-sm text-success + TrendingDown icon
Null:       —              text-muted-foreground (em-dash placeholder)
```

#### Props (for Frontend Developer)

```typescript
interface PriceDisplayProps {
  amount: number | null | undefined;
  currency?: string;    // default: "USD" (configurable)
  variant?: 'standard' | 'large' | 'muted' | 'trend-up' | 'trend-down';
  className?: string;
}
```

#### Note on Currency

For Spanish-speaking countries, the currency symbol and format will vary (e.g., COP, MXN, ARS). The `currency` prop accepts any ISO 4217 code. The `Intl.NumberFormat` API handles locale-specific formatting. For Phase 2, default to USD; currency settings can be a household preference in Phase 3.

#### shadcn/ui Base: None (custom, pure display component)

---

### 17.6 Component: ProductAutocomplete

#### Purpose

Search input with a dropdown of matching products from the catalog. Used in Quick-Add (§16.1) and Receipt Item Correction (§15.4).

#### Layout (active / dropdown open)

```
┌──────────────────────────────────────────┐
│ 🔍  milk                          [⟳]   │  ← search icon prefix + spinner
└──────────────────────────────────────────┘
┌──────────────────────────────────────────┐  ← dropdown (above or below input)
│ 🥛  Whole Milk                  $3.50    │  ← option row
│     Dairy · UNIT                         │
├──────────────────────────────────────────┤
│ 🥛  Skim Milk                   $2.80    │
│     Dairy · UNIT                         │
├──────────────────────────────────────────┤
│     No other matches                     │  ← if < 5 results
└──────────────────────────────────────────┘
```

#### Dropdown Positioning

- Default: renders above the input when input is near the bottom of the screen (bottom sheet context)
- Default: renders below the input when there's room above
- Uses `@radix-ui/react-popover` for positioning (already available via shadcn/ui)

#### Props (for Frontend Developer)

```typescript
interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onProductSelect: (product: Product) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}
```

#### shadcn/ui Base: `Command` (cmdk-based search/filter component from shadcn/ui). Alternatively, `Popover` + custom `Input` + results list.

---

## 18. Phase 2 Component Inventory

### New shadcn/ui Components Required for Phase 2

| Component       | Usage                                                     |
| --------------- | --------------------------------------------------------- |
| `Progress`      | Upload progress bar in FileUpload / receipt upload flow   |
| `Collapsible`   | Already in Phase 1; used for image panel on mobile        |
| `Command`       | Base for ProductAutocomplete dropdown search              |
| `Popover`       | Positioning container for autocomplete dropdown           |
| `Sheet`         | Already in Phase 1; used for upload on mobile             |
| `Calendar`      | (Optional) Date range picker in Receipts list filters     |
| `Separator`     | Already in Phase 1; used in receipt summary section       |

> Note: `Sheet`, `Collapsible`, and `Separator` are already installed from Phase 1.

### New Custom Components to Build

| Component              | File Path (suggested)                               | Purpose                                      |
| ---------------------- | --------------------------------------------------- | -------------------------------------------- |
| `FileUpload`           | `components/features/receipts/file-upload/`         | Camera + drag-drop file selection            |
| `ImageViewer`          | `components/features/receipts/image-viewer/`        | Zoomable/pannable image display              |
| `CategoryChip`         | `components/features/products/category-chip/`       | Selectable filter chip with category icon    |
| `StatusBadge`          | `components/ui/status-badge/`                       | Receipt processing status badge              |
| `PriceDisplay`         | `components/ui/price-display/`                      | Formatted currency display                   |
| `ProductAutocomplete`  | `components/features/products/product-autocomplete/`| Product search input with suggestions        |
| `ReceiptCard`          | `components/features/receipts/receipt-card/`        | Receipt list item card                       |
| `ProductCard`          | `components/features/products/product-card/`        | Product list item card                       |
| `PurchaseTimeline`     | `components/features/products/purchase-timeline/`   | Product purchase history timeline            |
| `ReceiptItemRow`       | `components/features/receipts/receipt-item-row/`    | Single item row in receipt detail            |
| `ReceiptSummary`       | `components/features/receipts/receipt-summary/`     | Subtotal/tax/total summary section           |
| `ProcessingSteps`      | `components/features/receipts/processing-steps/`    | Step indicator during receipt upload         |

### Updated Skeleton Patterns for Phase 2

| Screen               | Skeleton Pattern                                                              |
| -------------------- | ----------------------------------------------------------------------------- |
| Product Catalog      | 6 cards: icon circle + 2 text lines + short metadata line                     |
| Product Detail       | Large icon + 3 lines; trend block; 5 history rows (date + price + link)       |
| Receipt List         | 4 cards: 64×64 square + 3 lines (merchant, date, status)                      |
| Receipt Detail       | Tall rectangle (image) + 8 rows of 4 columns each (items table)               |

---

## 19. Phase 2 Design Decisions

### Q6: Split view or stacked for Receipt Detail?

**Decision: Split view on desktop (image left, data right); stacked on mobile with collapsible image.**

Rationale: On desktop, having the image and parsed data side-by-side allows users to verify OCR accuracy by comparing the two simultaneously — this is the core value of the receipt detail screen. On mobile, the screen is too narrow for a split view. A collapsible image section (collapsed by default) saves vertical space while keeping the image accessible when needed.

### Q7: Should the product autocomplete in Quick-Add pre-select a product automatically?

**Decision: No auto-selection. Always require explicit user selection.**

Rationale: Auto-selecting the top match could add the wrong product silently. Since the quick-add is used rapidly while shopping (items are added quickly, one after another), a silent wrong match would go unnoticed. The user must actively select a suggestion or press Enter to add as free text. This keeps the intent clear with zero risk of incorrect product linking.

### Q8: How to communicate receipt processing wait time?

**Decision: Step-indicator with friendly time estimate ("10–15 seconds").**

Rationale: A bare spinner during 10–15 seconds feels broken. A progress bar alone feels arbitrary. A three-step indicator (Uploading → Reading receipt → Matching products) gives users a sense of progress and shows what the system is doing. The time estimate manages expectations proactively. Steps animate forward even if the actual processing completes faster (to avoid jarring instant completions).

### Q9: Camera vs file upload on mobile — which is primary?

**Decision: Camera is primary on mobile. File picker is secondary ("or upload from files").**

Rationale: The primary use case on mobile is photographing a physical receipt in-store or at home immediately after purchase. The camera enables this without intermediate steps. File upload covers the case of pre-existing photos in the gallery. The UI hierarchy reflects this: camera button is large and prominent; file picker is a smaller secondary option.

### Q10: What happens when an OCR item can't be matched to any product?

**Decision: Highlight unmatched items with amber warning + edit button. Do not block receipt completion.**

Rationale: Strict product matching would block users from viewing their receipt if any item couldn't be matched. Instead, the receipt is marked as COMPLETED once parsing is done (even if some items are unmatched). Unmatched items are visually flagged in amber so users know which items may need correction. Users can fix them at their convenience — the correction is optional, not mandatory.

### Q11: Should receipt list receipts poll for status updates?

**Decision: Poll every 5 seconds for PROCESSING receipts; stop polling once terminal state (COMPLETED or FAILED).**

Rationale: WebSockets would be ideal but add infrastructure complexity for Phase 2. Simple polling (5s interval) is straightforward to implement and gives a good UX for the typical 10–15 second processing time. The frontend should only poll when there are receipts in PROCESSING state, and stop immediately when all receipts reach terminal states. This avoids unnecessary server load.

### Q12: Should Household move out of the bottom nav on mobile?

**Decision: Yes. Household moves to Profile submenu on mobile (4-tab nav: Lists, Products, Receipts, Profile).**

Rationale: 4 tabs is approaching the maximum comfortable count for a bottom nav. Household settings is accessed infrequently (a few times after initial setup) compared to the four primary activities (listing, products, receipts, profile). Moving it to a Profile submenu reduces nav clutter without hiding it — users will find it in Profile settings, which is the natural place for "household / account settings."
