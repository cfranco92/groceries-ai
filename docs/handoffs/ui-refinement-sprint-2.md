# Handoff: UI/UX Design Specifications for Phase 2 — Sprint 2

## Context

Sprint 2 adds Product catalog and Receipt upload/processing to the app. We need UI specifications for these new screens before the frontend developer can implement them. The existing `docs/UI_DESIGN.md` covers Phase 1 screens (auth, onboarding, lists, household, profile). You need to **extend** it with Phase 2 screens.

## Target Agent

**UX Designer** (`.claude/agents/ux-designer.md`)

## Jira Workflow

This agent does not own a dedicated Jira ticket. The UI specs support SCRUM-27 (Frontend UI). Comment on SCRUM-27 when the design spec is complete.

## Your Deliverable

**Update `docs/UI_DESIGN.md`** — Add Phase 2 screen specifications. Use the same format as the existing Phase 1 specs. Also update the navigation structure to include the new tabs.

## Context Files to Read First

1. `CLAUDE.md` — Project conventions (i18n, styling, shadcn/ui)
2. `docs/UI_DESIGN.md` — **Existing** Phase 1 specs (extend this file)
3. `docs/FEATURES.md` — Phase 2 features (sections 2.1, 2.2, 2.3)
4. `docs/API_DESIGN.md` — Products, Categories, Receipts, Insights endpoints
5. `docs/DATA_MODEL.md` — Product, Category, Receipt, ReceiptItem models
6. `docs/ARCHITECTURE.md` — Receipt processing pipeline
7. `apps/web/src/` — Existing frontend code for current component patterns

## Screens Required

### 1. Navigation Update

Update the app shell navigation to include Phase 2 tabs:
- **Mobile**: Bottom nav with 4 tabs: Lists, Products, Receipts, Profile
  - Household settings moves to Profile submenu
- **Desktop**: Sidebar with expanded navigation including Products, Receipts sections

### 2. Product Catalog Screens

#### 2.1 Product Catalog Page (`/products`)
- Searchable list of all household products
- Filter by category (horizontal scrolling category chips or dropdown)
- Each product card/row shows: name, category with icon, average price, last purchased date, purchase count
- Sort options: alphabetical, most purchased, recently purchased
- Empty state when no products yet ("Products will appear here as you upload receipts and add items to lists")
- Pagination or infinite scroll

#### 2.2 Product Detail Page (`/products/[id]`)
- Product info header: name, category, default unit, average price
- Edit button (ADMIN only) — inline edit or modal for name, category, default unit
- Purchase history timeline: list of purchases with date, price, receipt link
- Price trend indicator (up/down/stable compared to last purchase)
- "Add to list" quick action

### 3. Receipt Screens

#### 3.1 Receipt Upload Flow
- Upload trigger: FAB or prominent button on receipts page
- Mobile: camera capture option (primary) + file picker (secondary)
- Desktop: file picker with drag-and-drop zone
- File type indicator (accepted: JPEG, PNG, PDF, max 10MB)
- Upload progress indicator
- After upload: show processing state (spinner/skeleton with "Processing receipt..." message)
- Processing complete: redirect to receipt detail

#### 3.2 Receipts List Page (`/receipts`)
- List of all household receipts
- Filters: date range picker, status filter (All, Processing, Completed, Failed)
- Each receipt card shows: merchant name (or "Unknown"), date, total amount, item count, status badge, thumbnail
- Status badges: Processing (amber), Completed (green), Failed (red)
- Empty state: "Upload your first receipt to start tracking purchases"

#### 3.3 Receipt Detail Page (`/receipts/[id]`)
- Split layout (desktop): receipt image on left, parsed data on right
- Stacked layout (mobile): image at top (collapsible), data below
- Receipt header: merchant name, date, status
- Parsed data:
  - Items table/list: name, quantity, unit price, total price, matched product
  - Each item row has an edit button for OCR corrections
  - Unmatched items highlighted (no product linked)
  - Subtotal, tax, total summary at bottom
- Image viewer: zoomable, pan-able receipt image
- For FAILED receipts: show error message with "Retry" or "Delete" options

#### 3.4 Receipt Item Correction Modal
- Edit fields: item name, quantity, unit price, total price
- Product link: autocomplete dropdown to re-link to a different product
- "Create new product" option if no match
- Save/Cancel buttons
- Show original OCR value for reference (muted text)

### 4. Enhanced Add-Item Flow (List Detail Update)

Update the existing list detail page add-item input:
- Product autocomplete: as user types, suggest matching products from the catalog
- Show product category icon and average price in suggestions
- If user selects a product, auto-fill unit and link productId
- If no match, allow free-text entry (creates unlinked item)

### 5. Common Components (New for Phase 2)

- `FileUpload` — Drag-and-drop zone with camera capture option on mobile
- `ImageViewer` — Zoomable/pan-able image display for receipts
- `CategoryChip` — Category with icon, selectable for filtering
- `StatusBadge` — Color-coded status indicator (Processing, Completed, Failed)
- `PriceDisplay` — Formatted currency display
- `ProductAutocomplete` — Search input with product suggestions dropdown

## Design Constraints

Same as Sprint 1 plus:
1. **Receipt processing UX**: Users will wait during synchronous processing (5-15 seconds). The loading state must communicate progress and not feel broken.
2. **OCR correction**: The correction UI must make it easy to fix common OCR errors (wrong price, misspelled name). Show original vs. corrected.
3. **Product matching feedback**: When a product is auto-matched, show the match with a way to change it. When unmatched, highlight it.
4. **Camera capture**: Mobile users will photograph receipts in varied lighting. Provide guidance (align receipt, ensure good lighting).
5. **Responsive tables**: Receipt items may have many columns. On mobile, use a card layout instead of a table.

## i18n Keys Required

All text must be specified as i18n keys. Provide both English and Spanish translations for all new screens.

## Acceptance Criteria

- [ ] `docs/UI_DESIGN.md` updated with all Phase 2 screens listed above
- [ ] Navigation structure updated for 4 tabs (mobile) and expanded sidebar (desktop)
- [ ] Each screen has: purpose, ASCII wireframe, component list, states (loading/empty/error/success), user flow, responsive behavior, i18n keys, accessibility notes
- [ ] New common components specified
- [ ] Enhanced add-item flow with product autocomplete documented
- [ ] Receipt processing loading states designed
- [ ] OCR correction UI designed
