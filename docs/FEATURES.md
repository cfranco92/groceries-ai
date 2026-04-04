# GroceriesAI - Feature Roadmap

## Development Phases

The project is divided into 4 phases. Each phase builds on the previous one and delivers a usable increment. Phase 1 is the MVP.

---

## Phase 1 - MVP: Lists & Authentication

**Goal:** A working web app where household members can create and manage shopping lists collaboratively.

**Duration estimate:** 2-3 weeks

### 1.1 Project Setup
- [ ] Initialize Turborepo monorepo with pnpm workspaces
- [ ] Set up Next.js app with App Router, Tailwind CSS, shadcn/ui
- [ ] Set up NestJS app with base configuration
- [ ] Configure shared TypeScript types package
- [ ] Set up ESLint + Prettier shared config
- [ ] Configure PostgreSQL with Prisma (schema, first migration, seed)
- [ ] Set up environment variable management (.env files, validation)
- [ ] Docker Compose for local PostgreSQL

### 1.2 Authentication
- [ ] Firebase Auth setup (Google + email/password providers)
- [ ] Frontend: sign-in/sign-up pages with Firebase UI or custom forms
- [ ] Backend: Firebase Admin SDK token verification
- [ ] NestJS AuthGuard that validates Firebase JWT on every request
- [ ] Auto-provisioning: create DB user on first authenticated request
- [ ] Frontend: auth context/provider, protected routes
- [ ] Sign out flow

### 1.3 Household Management
- [ ] Create household (first user becomes ADMIN)
- [ ] Household settings page (name, members list)
- [ ] Invite system: generate invite code, share link
- [ ] Join household via invite code
- [ ] Remove member (ADMIN only)
- [ ] Onboarding flow: after sign-up, create or join a household

### 1.4 Shopping Lists - Core
- [ ] Create a new shopping list (name)
- [ ] View all lists (active, completed, archived)
- [ ] Add items to a list (name, quantity, unit)
- [ ] Check/uncheck items
- [ ] Edit item (name, quantity, notes)
- [ ] Delete item
- [ ] Reorder items (drag and drop)
- [ ] Complete/archive a list
- [ ] Delete (soft) a list
- [ ] Real-time feel: optimistic updates on the frontend

### 1.5 Basic UI/UX
- [ ] Responsive layout (mobile-friendly from day one)
- [ ] Navigation: sidebar or bottom nav
- [ ] Empty states for lists, items
- [ ] Loading skeletons
- [ ] Toast notifications for actions
- [ ] Dark mode support (Tailwind dark: classes)

### Phase 1 Acceptance Criteria
- A user can sign up, create a household, and invite a family member
- Both users can create lists, add items, and check them off
- The app works well on mobile browsers
- All API endpoints have validation and error handling
- Basic test coverage (unit tests for services, E2E for critical flows)

---

## Phase 2 - Receipts & Product Catalog

**Goal:** Users can upload receipts, which are processed via OCR. A product catalog is built automatically from purchase history.

**Duration estimate:** 2-3 weeks

### 2.1 Product Catalog
- [ ] Product catalog page (searchable, filterable by category)
- [ ] Seed default categories
- [ ] Auto-creation of products from list items (fuzzy name matching)
- [ ] Product detail view (name, category, purchase history)
- [ ] Edit product (category, name, default unit) - ADMIN only
- [ ] Link list items to existing products (autocomplete on add item)

### 2.2 Receipt Upload & OCR
- [ ] File upload component (camera capture on mobile, file picker on desktop)
- [ ] Upload endpoint with Cloud Storage integration
- [ ] Google Document AI integration for receipt parsing
- [ ] Receipt processing: extract merchant, date, items, prices, total
- [ ] Match parsed items to existing products (fuzzy matching)
- [ ] Create new products for unmatched items
- [ ] Receipt detail view (image + parsed data side by side)
- [ ] Manual correction UI for OCR errors
- [ ] Receipt list view with filters (date range, merchant)

### 2.3 Purchase History
- [ ] Update product stats on receipt processing (averagePrice, purchaseCount, lastPurchasedAt, avgDaysBetween)
- [ ] Product purchase history timeline
- [ ] Price trend per product

### Phase 2 Acceptance Criteria
- Users can photograph a receipt and have it automatically parsed
- Products are auto-created and linked to receipt items
- Product catalog grows organically from purchases
- Users can correct OCR errors
- Purchase history is accurately tracked

---

## Phase 3 - Insights & Smart Recommendations

**Goal:** The app provides actionable insights about spending and proactively suggests items to buy.

**Duration estimate:** 2-3 weeks

### 3.1 Spending Analytics
- [ ] Dashboard with spending overview (total, by category, trends)
- [ ] Charts: spending over time, category breakdown (pie/bar)
- [ ] Period comparison (this month vs last month)
- [ ] Most purchased items ranking

### 3.2 Restocking Recommendations
- [ ] Algorithm: calculate days since last purchase vs average purchase frequency
- [ ] Confidence scoring (higher confidence = more consistent purchase pattern)
- [ ] "You might need" suggestions on the home screen
- [ ] One-tap "add to list" from a suggestion
- [ ] Notification-ready structure (for Phase 4 push notifications)

### 3.3 Smart List Creation
- [ ] "Create list from suggestions" - pre-populate a list with recommended items
- [ ] "Repeat last list" - clone a previous list
- [ ] Template lists (e.g., "Weekly Essentials")

### Phase 3 Acceptance Criteria
- Dashboard shows meaningful spending insights
- Restocking suggestions are reasonably accurate after 4+ weeks of data
- Users can create lists quickly from suggestions or templates

---

## Phase 4 - Mobile App & Polish

**Goal:** Native mobile experience and production hardening.

**Duration estimate:** 3-4 weeks

### 4.1 React Native App
- [ ] Initialize Expo project in `apps/mobile/`
- [ ] Shared types and API client from monorepo packages
- [ ] Authentication flow (Firebase Auth for React Native)
- [ ] Shopping lists (full feature parity with web)
- [ ] Receipt capture (native camera integration)
- [ ] Push notifications for restocking reminders
- [ ] Offline support (local cache + sync when online)

### 4.2 Production Hardening
- [ ] Rate limiting on API endpoints
- [ ] Comprehensive error monitoring (Sentry or Cloud Error Reporting)
- [ ] Structured logging
- [ ] Database backup strategy
- [ ] CI/CD pipeline (GitHub Actions)
  - Lint + test on PR
  - Auto-deploy to staging on merge to develop
  - Manual deploy to production on release
- [ ] Performance optimization (lazy loading, image optimization)
- [ ] Accessibility audit (WCAG AA)

### 4.3 Advanced Features (Nice-to-Have)
- [ ] i18n: Spanish and English language support
- [ ] Price alerts: notify when a product's price changes significantly
- [ ] Shared lists between households
- [ ] Barcode scanning for quick product lookup
- [ ] Integration with store APIs for price comparison
- [ ] AI-powered meal planning based on purchase history

### Phase 4 Acceptance Criteria
- Mobile app published to TestFlight / Play Store beta
- Push notifications working for restocking reminders
- CI/CD pipeline fully operational
- App passes basic accessibility checks

---

## Implementation Priority for Claude Code

When implementing with Claude Code, follow this order within each phase:

1. **Database first**: Create Prisma schema and migrations
2. **Backend modules**: Build NestJS modules with DTOs, services, and controllers
3. **Shared types**: Export relevant types to `packages/shared-types`
4. **Frontend pages**: Build Next.js pages that consume the API
5. **Tests**: Write unit tests for services and E2E tests for critical flows
6. **Polish**: Error handling, loading states, edge cases

Always refer to `CLAUDE.md` for coding conventions, `DATA_MODEL.md` for schema details, and `API_DESIGN.md` for endpoint specifications.
