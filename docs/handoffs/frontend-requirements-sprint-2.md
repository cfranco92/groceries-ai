# Handoff: Frontend Implementation — Sprint 2

## Context

Sprint 2 adds Product catalog and Receipt upload/processing UI to the web app. The Sprint 1 frontend is complete with auth, household management, and shopping lists. This handoff is **blocked** until the UX Designer updates `docs/UI_DESIGN.md` with Phase 2 screens.

## Target Agent

**Frontend Developer** (`.claude/agents/frontend-developer.md`)

## Jira Workflow

For **each ticket**, follow this workflow:
1. **Start work**: Create branch `feature/SCRUM-XX-short-description` from `main`
2. **Comment on Jira**: Add a comment when starting with your approach
3. **Implement**: One branch and one commit per ticket
4. **Comment on Jira**: Add a comment when done with summary of changes, files modified, and test results
5. **Finish work**: Push branch, mark ticket as done

## Context Files to Read First

1. `CLAUDE.md` — Project conventions (App Router, components, state management)
2. `docs/UI_DESIGN.md` — **Primary reference** — Updated UI specs from UX Designer (must have Phase 2 sections)
3. `docs/API_DESIGN.md` — Products, Categories, Receipts endpoints
4. `docs/ARCHITECTURE.md` — Receipt processing pipeline
5. `packages/shared-types/src/` — Shared TypeScript interfaces (extended by backend dev with Product, Receipt types)
6. `apps/web/src/` — Existing frontend code (auth, lists, household)
7. `docs/handoffs/test-ready-sprint-2-api.md` — Backend dev's notes on what was built (read when available)

## Ticket Covered

| Ticket | Summary | Priority |
|--------|---------|----------|
| SCRUM-27 | Build Product catalog and Receipt upload UI | 1 |

## Dependencies

- **UX Designer** must have updated `docs/UI_DESIGN.md` with Phase 2 screens
- **Backend Developer** must have completed SCRUM-24 (Products API) at minimum
  - SCRUM-25 (Receipts upload) and SCRUM-26 (OCR) ideally complete
  - If receipts backend is not ready, build the upload UI with placeholder API functions
- `packages/shared-types` should export Product, Category, Receipt, ReceiptItem types

## Implementation Requirements

### 1. Navigation Update

Update the app shell to include Phase 2 sections:
- **Mobile bottom nav**: Add "Products" and "Receipts" tabs (4 tabs total: Lists, Products, Receipts, Profile)
- **Desktop sidebar**: Add Products and Receipts navigation items
- Move Household settings into Profile page or submenu
- Follow updated `docs/UI_DESIGN.md` navigation spec

### 2. Product Catalog Page (`/products`)

**Requirements:**
- Searchable list of household products
- Category filter (chips or dropdown, fetched from `GET /api/v1/categories`)
- Product cards showing: name, category icon, average price, last purchased, purchase count
- Sort options: alphabetical, most purchased, recently purchased
- Pagination controls
- Empty state: "Products will appear as you add items to lists and upload receipts"
- TanStack Query hooks:
  - `useProducts(params)` — GET /products with search, categoryId, sortBy, page, limit
  - `useCategories()` — GET /categories (cache aggressively, rarely changes)

### 3. Product Detail Page (`/products/[id]`)

**Requirements:**
- Product header: name, category badge, default unit, average price
- Edit form/modal (ADMIN only): name, category (dropdown), default unit (dropdown)
- Purchase history: list of recent purchases (from receipt items) with date, price, receipt link
- Price trend indicator
- "Add to list" action: opens a modal to select an active list and add the product as an item
- TanStack Query hooks:
  - `useProduct(id)` — GET /products/:id
  - `useUpdateProduct()` — PATCH /products/:id

### 4. Receipt Upload Component

**Requirements:**
- `FileUpload` component:
  - Mobile: primary button for camera capture (`accept="image/*" capture="environment"`)
  - Mobile: secondary option for file picker
  - Desktop: drag-and-drop zone + file picker button
  - Visual: dashed border zone, icon, text instruction
  - File validation: max 10MB, JPEG/PNG/PDF only
  - Show file preview after selection
  - Upload progress indicator
- Upload flow:
  1. User selects/captures file
  2. Show file preview + optional fields (purchase date, merchant name)
  3. User taps "Upload"
  4. Show processing state (skeleton/spinner with "Processing receipt..." text)
  5. On completion: redirect to receipt detail page
  6. On failure: show error with retry option
- TanStack Query hooks:
  - `useUploadReceipt()` — POST /receipts (multipart/form-data)
  - Use mutation with `onSuccess` redirect to receipt detail

### 5. Receipts List Page (`/receipts`)

**Requirements:**
- List of household receipts
- Filters:
  - Status: All, Processing, Completed, Failed (tab bar or chips)
  - Date range: date picker for start/end
- Receipt cards showing: merchant name, date, total, item count, status badge, small thumbnail
- Status badges color-coded: Processing (amber), Completed (green), Failed (red)
- Sort by date (newest first)
- Pagination
- FAB or button to upload new receipt
- Empty state: "Upload your first receipt to start tracking purchases"
- TanStack Query hooks:
  - `useReceipts(params)` — GET /receipts with status, startDate, endDate, page, limit

### 6. Receipt Detail Page (`/receipts/[id]`)

**Requirements:**
- Layout:
  - Desktop: split view — zoomable receipt image (left), parsed data (right)
  - Mobile: stacked — image at top (collapsible), data below
- Receipt header: merchant name, date, status badge
- Items list/table:
  - Columns: name, quantity, unit price, total price, matched product
  - Each row has an edit button for OCR corrections
  - Unmatched items (no productId) highlighted differently
- Totals section: subtotal, tax, total
- For FAILED receipts: error message + "Retry" or "Delete" buttons
- `ImageViewer` component: zoom in/out, pan (use a library like `react-zoom-pan-pinch`)
- TanStack Query hooks:
  - `useReceipt(id)` — GET /receipts/:id
  - `useDeleteReceipt()` — DELETE /receipts/:id

### 7. Receipt Item Correction Modal

**Requirements:**
- Trigger: edit button on each receipt item row
- Fields: item name, quantity, unit price, total price
- Product re-linking: autocomplete dropdown to search products
  - Show "Create new product" option if no match
- Show original OCR value for reference (muted text below each field)
- Save/Cancel actions
- Optimistic update on save
- TanStack Query hooks:
  - `useUpdateReceiptItem()` — PATCH /receipts/:id/items/:itemId

### 8. Enhanced Add-Item Flow (Update Existing List Detail)

**Update** the existing add-item input on the list detail page:
- Replace the simple text input with a `ProductAutocomplete` component:
  - As user types, search products from catalog (`GET /products?search=...`)
  - Show suggestions dropdown: product name, category icon, average price
  - If user selects a product: set `productId`, auto-fill `unit` from product's `defaultUnit`
  - If user presses Enter without selecting: create item as free-text (no product link)
- Debounce search (300ms) to avoid excessive API calls
- TanStack Query hooks:
  - Reuse `useProducts()` with search param for autocomplete

### 9. New Shared Components

Create these reusable components in `src/components/ui/` or `src/components/features/`:
- `FileUpload/` — Drag-and-drop + camera capture
- `ImageViewer/` — Zoomable receipt image viewer
- `CategoryChip/` — Category name + icon, selectable
- `StatusBadge/` — Color-coded status indicator
- `PriceDisplay/` — Formatted currency display (use locale-aware formatting)
- `ProductAutocomplete/` — Search input with product suggestions

### 10. New Dependencies

Likely needed (check `docs/UI_DESIGN.md` for confirmed list):
- `react-zoom-pan-pinch` — For receipt image viewer
- `date-fns` — For date formatting/parsing in receipts (may already exist)

## After Completion

Create `docs/handoffs/test-ready-sprint-2-web.md` describing:
- All pages/routes implemented
- Components created
- How to test (manual steps)
- Any deviations from UI_DESIGN.md
- Known limitations or mock data still in use
