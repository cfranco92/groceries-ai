# Handoff: QA Test Plan — Sprint 2

## Context

Sprint 2 delivers Phase 2: product catalog API, receipt upload with Cloud Storage, Document AI OCR processing, and the frontend UI for products and receipts. This test plan covers all new functionality.

## Target Agent

**QA Engineer** (`.claude/agents/qa-engineer.md`)

## Jira Workflow

This agent does not own a dedicated Sprint 2 ticket. Create comments on SCRUM-24, 25, 26, 27 with test results for each.

## Context Files to Read First

1. `CLAUDE.md` — Test commands, coverage targets (80%)
2. `docs/API_DESIGN.md` — Products, Categories, Receipts API contracts
3. `docs/DATA_MODEL.md` — Product, Category, Receipt, ReceiptItem models
4. `docs/handoffs/test-ready-sprint-2-api.md` — Backend dev's notes (read when available)
5. `docs/handoffs/test-ready-sprint-2-web.md` — Frontend dev's notes (read when available)
6. `apps/api/src/modules/` — Existing test patterns from Sprint 1

## Dependencies

- **Backend Developer** must complete SCRUM-24, 25, 26 and create `docs/handoffs/test-ready-sprint-2-api.md`
- **Frontend Developer** must complete SCRUM-27 and create `docs/handoffs/test-ready-sprint-2-web.md`
- Both apps must be runnable locally: `pnpm dev`

## Test Scope

### 1. Backend Unit Tests — Products Module (SCRUM-24)

**CategoriesService:**
- `findAll()` returns all seeded categories with icons
- Categories are sorted by `sortOrder`

**ProductsService:**
- `findAll()` returns products scoped to household with pagination
- `findAll()` with `search` param filters by name (case-insensitive)
- `findAll()` with `categoryId` filters by category
- `findAll()` with `sortBy` sorts correctly (name, lastPurchasedAt, purchaseCount)
- `findOne()` returns product with category and recent purchase history
- `findOne()` rejects access to products from another household (403)
- `update()` works for ADMIN role
- `update()` rejects MEMBER role (403)
- Pagination returns correct meta (total, page, limit, hasNextPage)

**ProductMatchingService:**
- Exact match by name (case-insensitive)
- Fuzzy match catches common variations (e.g., "Milk" matches "Whole Milk")
- Returns null when no match found
- Scoped to household (doesn't match products from other households)

### 2. Backend Unit Tests — Receipts Module (SCRUM-25)

**StorageService:**
- `upload()` stores file and returns URL
- `getSignedUrl()` returns signed URL with expiration
- `delete()` removes file from storage
- Handles errors gracefully (storage unavailable)

**ReceiptsService:**
- `create()` creates receipt with PENDING status
- `create()` validates file type (rejects non-image/PDF)
- `create()` validates file size (rejects > 10MB)
- `findAll()` returns receipts scoped to household
- `findAll()` filters by status
- `findAll()` filters by date range
- `findOne()` returns receipt with items and product relations
- `findOne()` rejects access from another household (403)
- `delete()` works for ADMIN only
- `delete()` removes file from storage

### 3. Backend Unit Tests — OCR Processing (SCRUM-26)

**OcrService:**
- Processes receipt image and returns structured data
- Extracts merchant name, date, line items, totals
- Handles OCR failure gracefully (returns error, doesn't throw)
- Mock processor returns sample data when Document AI not configured

**Receipt Processing Flow:**
- Status transitions: PENDING -> PROCESSING -> COMPLETED
- Status transitions: PENDING -> PROCESSING -> FAILED
- Parsed items are matched to existing products
- Unmatched items create new products in household catalog
- Product stats updated: purchaseCount, lastPurchasedAt, averagePrice, avgDaysBetween
- Raw OCR data stored in receipt.rawOcrData

**Manual Correction:**
- `updateItem()` updates receipt item fields
- `updateItem()` with new productId re-links to different product
- `updateItem()` recalculates product stats when product changes
- Rejects access from another household (403)

### 4. Backend E2E Tests

Create E2E tests in `apps/api/test/` for the full request/response cycle:

**Products E2E:**
1. `GET /categories` returns seeded categories (200)
2. `GET /products` returns empty list for new household (200)
3. `PATCH /products/:id` as ADMIN updates product (200)
4. `PATCH /products/:id` as MEMBER returns 403
5. `GET /products?search=milk` filters correctly
6. `GET /products?categoryId=xxx` filters correctly

**Receipts E2E:**
1. `POST /receipts` with valid image creates receipt (202)
2. `POST /receipts` with invalid file type returns 400
3. `POST /receipts` with oversized file returns 400
4. `GET /receipts` returns receipts for household (200)
5. `GET /receipts/:id` returns receipt with items (200)
6. `PATCH /receipts/:id/items/:itemId` corrects item (200)
7. `DELETE /receipts/:id` as ADMIN deletes (200)
8. `DELETE /receipts/:id` as MEMBER returns 403

**Note:** E2E tests should mock:
- Firebase token verification (same pattern as Sprint 1)
- Cloud Storage (mock upload/download)
- Document AI (mock OCR response with known data)

### 5. Frontend Unit Tests (SCRUM-27)

**Product Components:**
- Product catalog page renders product list
- Product catalog shows empty state when no products
- Category filter chips render and filter on click
- Search input triggers search after debounce
- Product detail page renders product info and purchase history
- Product edit form (ADMIN only) validates and submits
- Product edit hidden for MEMBER role

**Receipt Components:**
- FileUpload component renders with drag-and-drop zone
- FileUpload rejects invalid file types
- FileUpload rejects files > 10MB
- FileUpload shows file preview after selection
- Receipt list page renders receipt cards with status badges
- Receipt list filters by status and date range
- Receipt list shows empty state
- Receipt detail page renders split layout (desktop)
- Receipt detail page renders stacked layout (mobile)
- Receipt item correction modal opens and saves
- Receipt item correction shows original OCR value
- Processing state shows loading indicator

**Product Autocomplete (updated add-item flow):**
- Autocomplete shows suggestions from product catalog
- Selecting a suggestion sets productId and unit
- Free-text entry creates item without product link
- Debounce prevents excessive API calls

### 6. Accessibility Testing

Use Playwright, Lighthouse, and axe-core MCP tools:

**For each new page, verify:**
- Lighthouse accessibility score >= 95
- No WCAG violations from axe-core scan
- All interactive elements have accessible names
- Keyboard navigation works (Tab, Enter, Escape)
- Color contrast meets 4.5:1 minimum
- Focus styles visible
- File upload has proper aria labels
- Receipt image has alt text
- Status badges have aria-label (not just color)

**Pages to audit:**
- `/products` (catalog)
- `/products/[id]` (detail)
- `/receipts` (list)
- `/receipts/[id]` (detail)
- Upload flow (modal/sheet)

### 7. Coverage Targets

- **Backend**: 80% minimum on new code in `apps/api/src/modules/products/` and `apps/api/src/modules/receipts/`
- **Frontend**: 80% minimum on new code in `apps/web/src/`
- Run `pnpm --filter=api test -- --coverage` and `pnpm --filter=web test:coverage`

## Test Commands

```bash
# Run all tests
pnpm test

# Backend tests with coverage
pnpm --filter=api test -- --coverage

# Frontend tests with coverage
pnpm --filter=web test:coverage

# Backend E2E tests
pnpm --filter=api test:e2e

# Start dev server for Playwright/Lighthouse
pnpm dev
```

## Acceptance Criteria

- [ ] All backend unit tests pass
- [ ] All backend E2E tests pass
- [ ] All frontend unit tests pass
- [ ] Backend coverage >= 80% on products and receipts modules
- [ ] Frontend coverage >= 80% on new components
- [ ] No `.skip` or `.only` left in test files
- [ ] Lighthouse accessibility >= 95 on all new pages
- [ ] No critical/serious WCAG violations
- [ ] Test results documented

## After Completion

Create `docs/handoffs/test-results-sprint-2.md` with:
- Pass/fail summary per module
- Coverage numbers
- Accessibility audit results per page
- Issues found (with severity)
- Recommendations for improvement
