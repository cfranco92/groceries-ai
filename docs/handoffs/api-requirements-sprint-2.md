# Handoff: Backend API Implementation — Sprint 2

## Context

Sprint 2 covers Phase 2: Product catalog with categories, receipt upload with Google Cloud Storage, and receipt OCR processing via Google Document AI. The existing API from Sprint 1 has auth, users, households, and lists modules fully implemented. The Prisma schema already defines Product, Category, Receipt, and ReceiptItem models.

## Target Agent

**Backend Developer** (`.claude/agents/backend-developer.md`)

## Jira Workflow

For **each ticket**, follow this workflow:
1. **Start work**: Create branch `feature/SCRUM-XX-short-description` from `main`
2. **Comment on Jira**: Add a comment when starting with your approach
3. **Implement**: One branch and one commit per ticket
4. **Comment on Jira**: Add a comment when done with summary of changes, files modified, and test results
5. **Finish work**: Push branch, mark ticket as done

## Context Files to Read First

1. `CLAUDE.md` — Project conventions, commands, module structure
2. `docs/API_DESIGN.md` — **Primary reference** for Products, Categories, and Receipts endpoint specs
3. `docs/DATA_MODEL.md` — Prisma schema (Product, Category, Receipt, ReceiptItem models)
4. `docs/ARCHITECTURE.md` — Receipt processing pipeline, security (signed URLs)
5. `apps/api/src/prisma/schema.prisma` — Current schema (models already defined)
6. `apps/api/src/modules/` — Existing modules (auth, users, households, lists) for patterns
7. `packages/shared-types/src/` — Existing shared types to extend

## Tickets Covered

| Ticket | Summary | Priority |
|--------|---------|----------|
| SCRUM-24 | Implement Product catalog API with categories | 1 (do first) |
| SCRUM-25 | Implement receipt upload with Cloud Storage integration | 2 |
| SCRUM-26 | Integrate Google Document AI for receipt OCR processing | 3 |

## Implementation Order and Requirements

### Step 1: SCRUM-24 — Product Catalog API with Categories

Build the products and categories modules.

**Requirements:**
- `CategoriesModule` with controller and service:
  - `GET /api/v1/categories` — List all categories (not paginated, small dataset)
  - Categories are seeded (already exist from Sprint 1 seed script)
  - Response: array of `{ id, name, icon, sortOrder }`
- `ProductsModule` with controller and service:
  - `GET /api/v1/products` — Paginated list for user's household
    - Query params: `search` (fuzzy name match), `categoryId` (filter), `page`, `limit`, `sortBy` (name | lastPurchasedAt | purchaseCount)
    - Products scoped to household (use `householdId` from `@CurrentUser()`)
    - Include category relation in response
  - `GET /api/v1/products/:id` — Product detail with purchase history
    - Include: category, recent receipt items (last 10 purchases with date and price)
    - Verify product belongs to user's household
  - `PATCH /api/v1/products/:id` — Update product (ADMIN only)
    - Fields: name, categoryId, defaultUnit
    - Use existing ADMIN guard pattern from households module
  - `GET /api/v1/products/suggestions` — Placeholder (returns empty array for now; full implementation in SCRUM-29)
- Fuzzy name matching service:
  - Create a `ProductMatchingService` that finds existing products by name similarity
  - Use case-insensitive contains match + Levenshtein or similar heuristic
  - This will be used when adding list items and when processing receipts
  - Method signature: `findMatch(householdId: string, name: string): Promise<Product | null>`
- DTOs with class-validator:
  - `QueryProductsDto`: search (optional string), categoryId (optional string), page, limit, sortBy
  - `UpdateProductDto`: name (optional), categoryId (optional), defaultUnit (optional UnitType enum)
- Swagger decorators on all endpoints

**Acceptance Criteria:**
- Products CRUD scoped to household
- Category list returns all seeded categories
- Search by name works (case-insensitive)
- Filter by category works
- Pagination with correct meta
- ADMIN-only update enforced
- ProductMatchingService can find fuzzy matches
- Unit tests for ProductsService and ProductMatchingService
- `pnpm --filter=api lint` passes
- `pnpm --filter=api tsc --noEmit` passes

### Step 2: SCRUM-25 — Receipt Upload with Cloud Storage

Build the receipts module with file upload capability.

**Dependencies:** DevOps must have GCS configuration ready (env vars, bucket). If not available, implement with a local file storage fallback that can be swapped for GCS.

**Requirements:**
- `ReceiptsModule` with controller and service
- `StorageService` (injectable, in a shared `storage` module):
  - `upload(file: Buffer, filename: string, mimeType: string): Promise<string>` — returns storage URL
  - `getSignedUrl(filename: string, expiresInMinutes?: number): Promise<string>` — returns signed URL
  - `delete(filename: string): Promise<void>`
  - Implementation: Google Cloud Storage (`@google-cloud/storage`)
  - Config from env: `GCS_BUCKET_NAME`, `GCP_PROJECT_ID`
  - File key format: `receipts/{householdId}/{uuid}.{ext}`
  - Fallback: if GCS env vars not set, use local `/tmp/uploads` for development
- Receipt endpoints (see `docs/API_DESIGN.md`):
  - `POST /api/v1/receipts` — Multipart file upload
    - Accept: `multipart/form-data` with `file` field
    - File validation: max 10MB, JPEG/PNG/PDF only (use `@nestjs/platform-express` Multer)
    - Optional body fields: `purchaseDate` (ISO string), `merchantName` (string)
    - Upload file to Cloud Storage
    - Create Receipt record with status `PENDING`, imageUrl from storage
    - Return `202 Accepted` with receipt stub (id, status, imageUrl)
  - `GET /api/v1/receipts` — Paginated list for household
    - Query params: `status` (ReceiptStatus), `startDate`, `endDate`, `page`, `limit`
    - Scoped to household
    - Include uploadedBy user relation
    - Image URLs should be signed (not raw storage URLs)
  - `GET /api/v1/receipts/:id` — Receipt detail with items
    - Include: items (with product relation), uploadedBy user
    - Signed image URL
    - Verify receipt belongs to user's household
  - `DELETE /api/v1/receipts/:id` — Delete receipt (ADMIN only)
    - Also delete file from storage
    - Cascade deletes receipt items (Prisma onDelete: Cascade)
- DTOs:
  - `UploadReceiptDto`: purchaseDate (optional), merchantName (optional)
  - `QueryReceiptsDto`: status, startDate, endDate, page, limit

**Acceptance Criteria:**
- File upload works with multipart/form-data
- File validation rejects invalid types and oversized files
- Files stored in GCS (or local fallback)
- Signed URLs work for image access
- Receipt CRUD scoped to household
- ADMIN-only delete enforced
- Unit tests for ReceiptsService and StorageService
- Swagger decorators with file upload documentation

### Step 3: SCRUM-26 — Document AI OCR Processing

Integrate Google Document AI to process uploaded receipts.

**Dependencies:** SCRUM-25 (receipts module must exist). DevOps must configure Document AI processor ID.

**Requirements:**
- `OcrService` (in receipts module or a shared `ocr` module):
  - `processReceipt(imageBuffer: Buffer, mimeType: string): Promise<ParsedReceiptData>`
  - Uses `@google-cloud/documentai` client
  - Config from env: `GCP_PROJECT_ID`, `GOOGLE_DOCUMENT_AI_PROCESSOR_ID`
  - Extract structured data: merchantName, purchaseDate, line items (name, quantity, unitPrice, totalPrice), subtotal, tax, total
  - Return typed `ParsedReceiptData` interface
  - If Document AI env vars not set, provide a mock processor for development that returns sample data
- Receipt processing flow:
  - After upload (or triggered separately), call `processReceipt()`
  - Update receipt status: `PENDING` -> `PROCESSING` -> `COMPLETED` | `FAILED`
  - For each parsed line item:
    1. Use `ProductMatchingService.findMatch()` to find existing product
    2. If no match, create new product in household catalog (category: "Other", default unit from parsed data)
    3. Create `ReceiptItem` linked to receipt and product
  - Update product stats after processing:
    - `purchaseCount` += 1
    - `lastPurchasedAt` = receipt.purchaseDate
    - `averagePrice` = recalculate from all receipt items for this product
    - `avgDaysBetween` = calculate from purchase dates
  - Store raw OCR response in `receipt.rawOcrData` (JSON)
  - Set `receipt.processedAt` on completion
  - On failure: set status to `FAILED`, log error, do NOT throw (receipt record should persist)
- Manual correction endpoint:
  - `PATCH /api/v1/receipts/:id/items/:itemId` — Correct OCR errors
    - Fields: name, quantity, unitPrice, totalPrice, productId (re-link to different product)
    - If productId changes, update old and new product stats
    - Verify receipt belongs to user's household
- Processing strategy:
  - For Sprint 2, process synchronously within the upload request (user waits)
  - The `POST /receipts` endpoint should upload, then process, then return completed receipt
  - Future: move to BullMQ async processing

**Acceptance Criteria:**
- Document AI integration parses receipt images
- Parsed items are matched/created as products
- Product stats update correctly on processing
- Receipt status lifecycle works (PENDING -> PROCESSING -> COMPLETED | FAILED)
- Raw OCR data stored for debugging
- Manual correction endpoint works
- Mock processor works when Document AI env vars not set
- Error handling: failed OCR doesn't crash, receipt gets FAILED status with message
- Unit tests for OcrService (with mocked Document AI client) and product stats calculation
- Unit tests for manual correction flow

## Shared Types

After implementing, export these to `packages/shared-types/src/index.ts`:
- Product, Category, Receipt, ReceiptItem interfaces
- ReceiptStatus enum
- ParsedReceiptData type
- Product suggestion types (placeholder)
- DTO types for create/update operations

## After Completion

Create `docs/handoffs/test-ready-sprint-2-api.md` describing:
- All new endpoints built with their routes
- How to test them (curl examples or Swagger)
- Whether GCS is configured or using local fallback
- Whether Document AI is configured or using mock processor
- Any deviations from API_DESIGN.md spec
- Known limitations or TODOs
