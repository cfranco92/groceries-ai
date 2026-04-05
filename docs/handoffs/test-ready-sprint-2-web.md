# Handoff: Sprint 2 Web Frontend — Test Ready

## Summary

SCRUM-27 implements the Phase 2 frontend: Product Catalog and Receipt Upload UI. All pages, components, hooks, and navigation updates are in place with mock data. TypeScript, ESLint, and all existing tests pass.

## Pages / Routes Implemented

| Route | Page | Description |
|-------|------|-------------|
| `/products` | Product Catalog | Search, category filter chips, sort dropdown, product cards grid, load more pagination |
| `/products/[id]` | Product Detail | Header card, edit dialog (ADMIN), price trend indicator, purchase history timeline, add-to-list sheet |
| `/receipts` | Receipts List | Status filter tabs (All/Processing/Completed/Failed), collapsible date range filter, receipt cards with thumbnails and status badges, upload FAB |
| `/receipts/[id]` | Receipt Detail | Split view (desktop) / stacked (mobile), image viewer with zoom/pan, items with matched/unmatched highlighting, OCR correction modal, totals summary, failed state with retry/delete |

## Navigation Updates

- **Mobile bottom nav**: 4 tabs — Lists, Products, Receipts, Profile (Household moved to Profile submenu)
- **Desktop sidebar**: Section headers for Products and Receipts, Household and Profile in bottom section

## Components Created

### UI Components (`components/ui/`)
- `progress.tsx` — Progress bar with ARIA attributes
- `status-badge.tsx` — Color-coded receipt status badge (Pending/Processing/Completed/Failed)
- `price-display.tsx` — Locale-aware currency display with trend variants

### Feature Components (`components/features/products/`)
- `category-chip/` — Selectable filter chip with category icon mapping
- `product-card/` — Product list card with category, price, purchase count
- `product-autocomplete/` — Search input with debounced product suggestions dropdown

### Feature Components (`components/features/receipts/`)
- `file-upload/` — Camera (mobile) + drag-drop (desktop) file selection
- `image-viewer/` — Zoomable/pannable receipt image (using react-zoom-pan-pinch)
- `receipt-card/` — Receipt list card with thumbnail, merchant, status badge
- `receipt-item-row/` — Single receipt item with matched/unmatched product indicator
- `receipt-summary/` — Subtotal/tax/total summary section
- `processing-steps/` — 3-step indicator during receipt upload

## Hooks Created

### `hooks/use-products.ts`
- `useProducts(params, options)` — Paginated products with search, category, sort
- `useProduct(id)` — Single product detail
- `useUpdateProduct()` — PATCH product (ADMIN)
- `useCategories()` — Categories list (1h stale time)
- `useProductPurchaseHistory(productId)` — Purchase timeline data

### `hooks/use-receipts.ts`
- `useReceipts(params)` — Paginated receipts with status/date filters; auto-polls PROCESSING receipts every 5s
- `useReceipt(id)` — Single receipt with items; auto-polls PROCESSING
- `useUploadReceipt()` — Multipart form upload mutation
- `useUpdateReceiptItem()` — PATCH receipt item (OCR correction)
- `useDeleteReceipt()` — DELETE receipt

## Enhanced Existing Pages

- **List Detail (`/lists/[id]`)**: Quick-add input replaced with `ProductAutocomplete` — typing 2+ characters shows matching products from catalog; selecting pre-fills name/unit (productId linking not yet wired — requires API/hook extension); free-text entry still works

## Dependencies Added

- `react-zoom-pan-pinch` — Receipt image viewer zoom/pan

## Mock Data Status

All hooks use `USE_MOCK = true` with realistic sample data. To switch to real API:
1. Set `USE_MOCK = false` in `use-products.ts` and `use-receipts.ts`
2. Ensure API endpoints are running at `NEXT_PUBLIC_API_URL`

## How to Test (Manual)

1. `pnpm dev --filter=web` — Start the web app
2. Navigate to `/products` — Should see 8 mock products with category chips and search
3. Click a product card — Product detail page with price trend and purchase history
4. Click "Add to List" — Dialog with list selection and quantity
5. Click "Edit" — Product edit dialog with name/category/unit fields
6. Navigate to `/receipts` — Should see 4 mock receipts (completed, processing, failed)
7. Click the Upload button — Upload dialog with camera (mobile) / drag-drop (desktop)
8. Click a completed receipt — Split view with items, edit buttons, correction modal
9. Click a failed receipt — Error state with retry/delete
10. Navigate to `/lists/[id]` — Quick-add input now shows product suggestions
11. Check bottom nav on mobile — 4 tabs: Lists, Products, Receipts, Profile
12. Check sidebar on desktop — Section headers for Products and Receipts

## Deviations from UI_DESIGN.md

- **Receipt image viewer**: Uses `react-zoom-pan-pinch` instead of `@use-gesture/react` (simpler API, same UX)
- **Receipt card thumbnail**: Uses native `<img>` with eslint-disable for external GCS URLs (not compatible with `next/image` optimization without domain config)
- **i18n**: Keys defined in design spec but not wired to next-intl yet (following Phase 1 pattern of hardcoded English strings)

## Known Limitations

- All data is mocked — no real API integration yet (toggle `USE_MOCK` to enable)
- Receipt upload simulates 2s delay but doesn't actually upload files in mock mode
- Processing receipt polling works but mock data status doesn't change (would need backend)
- "Create new product" in correction modal is a placeholder button (no inline creation flow yet)
- "Retry Processing" on failed receipts is a placeholder button
- Product purchase history is hardcoded for all products (same 4 entries)
- Product autocomplete in list detail pre-fills name/unit but does not persist `productId` (API hook doesn't accept it yet)
