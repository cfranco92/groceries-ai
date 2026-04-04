# GroceriesAI - UI/UX Design Specification (Phase 1)

This document defines the comprehensive UI/UX specifications for all Phase 1 screens. It is the source of truth for the Frontend Developer agent.

---

## Table of Contents

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
