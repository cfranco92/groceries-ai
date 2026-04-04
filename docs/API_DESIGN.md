# GroceriesAI - REST API Design

## Base URL

```
Development: http://localhost:3001/api/v1
Production:  https://api.groceries-ai.app/api/v1
```

All endpoints require authentication via Firebase JWT token in the `Authorization` header unless marked as `[Public]`.

## Common Response Formats

### Success Response

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-04-04T12:00:00.000Z"
  }
}
```

### Paginated Response

```json
{
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "hasNextPage": true,
    "timestamp": "2026-04-04T12:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [ ... ],
  "timestamp": "2026-04-04T12:00:00.000Z",
  "path": "/api/v1/..."
}
```

## Pagination

All list endpoints support pagination via query parameters:

- `page` (default: 1) - page number
- `limit` (default: 20, max: 100) - items per page
- `sortBy` (varies) - field to sort by
- `sortOrder` (default: "desc") - "asc" or "desc"

---

## Endpoints

### Auth

#### `POST /auth/register`

Register a new user after Firebase authentication. Called on first login.

**Body:**

```json
{
  "firebaseUid": "string (from Firebase token)",
  "email": "string",
  "displayName": "string (optional)"
}
```

**Response:** `201 Created` → User object

**Notes:** This is called automatically by the frontend after Firebase sign-in if the user doesn't exist in the database yet. The `AuthGuard` handles auto-provisioning, so this endpoint may be implicit rather than explicit.

---

### Users

#### `GET /users/me`

Get the authenticated user's profile, including household info.

**Response:** `200 OK`

```json
{
  "data": {
    "id": "cuid",
    "email": "user@example.com",
    "displayName": "Carlos Franco",
    "avatarUrl": "https://...",
    "role": "ADMIN",
    "household": {
      "id": "cuid",
      "name": "Casa Franco"
    },
    "createdAt": "2026-04-04T12:00:00.000Z"
  }
}
```

#### `PATCH /users/me`

Update the authenticated user's profile.

**Body:**

```json
{
  "displayName": "string (optional)",
  "avatarUrl": "string (optional)"
}
```

---

### Households

#### `POST /households`

Create a new household. The creating user becomes ADMIN.

**Body:**

```json
{
  "name": "string"
}
```

**Response:** `201 Created` → Household object with the user as ADMIN

**Business Rules:**

- A user can only belong to one household
- If the user already has a household, returns `409 Conflict`

#### `GET /households/me`

Get the authenticated user's household with members.

**Response:** `200 OK`

```json
{
  "data": {
    "id": "cuid",
    "name": "Casa Franco",
    "members": [
      {
        "id": "cuid",
        "displayName": "Carlos",
        "email": "carlos@example.com",
        "role": "ADMIN",
        "avatarUrl": "https://..."
      },
      {
        "id": "cuid",
        "displayName": "Alejandro",
        "email": "alejandro@example.com",
        "role": "MEMBER",
        "avatarUrl": null
      }
    ],
    "createdAt": "2026-04-04T12:00:00.000Z"
  }
}
```

#### `PATCH /households/me`

Update household details. **ADMIN only.**

#### `POST /households/me/invite`

Generate an invite for the household. **ADMIN only.**

**Body:**

```json
{
  "email": "string (optional - for targeted invite)"
}
```

**Response:** `201 Created`

```json
{
  "data": {
    "inviteCode": "ABC123XY",
    "expiresAt": "2026-04-11T12:00:00.000Z"
  }
}
```

#### `POST /households/join`

Join a household using an invite code.

**Body:**

```json
{
  "inviteCode": "ABC123XY"
}
```

#### `GET /households/me/invites`

List all invites for the household. **ADMIN only.**

**Response:** `200 OK` → Array of HouseholdInvite objects (code, email, status, expiresAt)

#### `DELETE /households/me/invites/:id`

Cancel a pending invite. **ADMIN only.**

**Response:** `204 No Content`

#### `DELETE /households/me/members/:userId`

Remove a member from the household. **ADMIN only.**

---

### Shopping Lists

#### `GET /lists`

Get all shopping lists for the user's household.

**Query params:** `status` (ACTIVE | COMPLETED | ARCHIVED), `page`, `limit`

**Response:** `200 OK` → Paginated array of ShoppingList objects (without items)

#### `POST /lists`

Create a new shopping list.

**Body:**

```json
{
  "name": "string"
}
```

#### `GET /lists/:id`

Get a single list with all its items.

**Response:** `200 OK`

```json
{
  "data": {
    "id": "cuid",
    "name": "Weekly Groceries",
    "status": "ACTIVE",
    "createdBy": {
      "id": "cuid",
      "displayName": "Carlos"
    },
    "items": [
      {
        "id": "cuid",
        "name": "Whole Milk",
        "quantity": 2,
        "unit": "UNIT",
        "isChecked": false,
        "product": {
          "id": "cuid",
          "category": { "id": "cuid", "name": "Dairy", "icon": "🥛" },
          "averagePrice": 3.5
        },
        "addedBy": { "id": "cuid", "displayName": "Alejandro" },
        "notes": "Brand X preferred",
        "sortOrder": 0
      }
    ],
    "createdAt": "2026-04-04T12:00:00.000Z"
  }
}
```

#### `PATCH /lists/:id`

Update list details (name, status).

**Body:**

```json
{
  "name": "string (optional)",
  "status": "ACTIVE | COMPLETED | ARCHIVED (optional)"
}
```

#### `DELETE /lists/:id`

Soft-delete a shopping list. **Creator or ADMIN only.**

---

### List Items

#### `POST /lists/:listId/items`

Add an item to a shopping list.

**Body:**

```json
{
  "name": "string",
  "quantity": 1,
  "unit": "UNIT",
  "productId": "string (optional - if matching an existing product)",
  "notes": "string (optional)"
}
```

**Business Rules:**

- If `productId` is not provided, the system attempts fuzzy matching against the household's product catalog.
- If a match is found, the `productId` is set automatically.
- If no match, the item is created without a product association.

#### `PATCH /lists/:listId/items/:itemId`

Update an item (quantity, checked status, notes, etc.).

**Body:**

```json
{
  "name": "string (optional)",
  "quantity": "number (optional)",
  "unit": "UnitType (optional)",
  "isChecked": "boolean (optional)",
  "notes": "string (optional)",
  "sortOrder": "number (optional)"
}
```

#### `PATCH /lists/:listId/items/reorder`

Bulk reorder items in a list.

**Body:**

```json
{
  "items": [
    { "id": "cuid", "sortOrder": 0 },
    { "id": "cuid", "sortOrder": 1 }
  ]
}
```

#### `DELETE /lists/:listId/items/:itemId`

Remove an item from a list. (Hard delete - no soft delete for items.)

---

### Products

#### `GET /products`

Get the household's product catalog.

**Query params:** `search`, `categoryId`, `page`, `limit`, `sortBy` (name | lastPurchasedAt | purchaseCount)

#### `GET /products/:id`

Get product details with purchase history.

#### `PATCH /products/:id`

Update product details. **ADMIN only.**

**Body:**

```json
{
  "name": "string (optional)",
  "categoryId": "string (optional)",
  "defaultUnit": "UnitType (optional)"
}
```

**UnitType values:** `UNIT`, `KG`, `LB`, `G`, `L`, `ML`, `OZ`, `DOZEN`, `PACK`

#### `GET /products/suggestions`

Get restocking suggestions based on purchase patterns.

**Response:** `200 OK`

```json
{
  "data": [
    {
      "product": {
        "id": "cuid",
        "name": "Whole Milk",
        "category": { "name": "Dairy" }
      },
      "reason": "Usually purchased every 7 days. Last purchased 8 days ago.",
      "confidence": 0.85,
      "avgDaysBetween": 7,
      "daysSinceLastPurchase": 8,
      "averagePrice": 3.5
    }
  ]
}
```

---

### Receipts

#### `POST /receipts`

Upload a receipt image for processing.

**Content-Type:** `multipart/form-data`

**Body:**

- `file`: image file (JPEG, PNG, or PDF, max 10MB)
- `purchaseDate`: string (optional, ISO date)
- `merchantName`: string (optional)

**Response:** `202 Accepted`

```json
{
  "data": {
    "id": "cuid",
    "status": "PENDING",
    "imageUrl": "https://storage.googleapis.com/..."
  }
}
```

**Status lifecycle:** `PENDING` → `PROCESSING` → `COMPLETED` | `FAILED`

```json
// FAILED receipts include an error message:
{
  "data": {
    "id": "cuid",
    "status": "FAILED",
    "error": "Could not extract text from image. Please upload a clearer photo."
  }
}
```

#### `GET /receipts`

Get all receipts for the household.

**Query params:** `status`, `startDate`, `endDate`, `page`, `limit`

#### `GET /receipts/:id`

Get receipt details with parsed items.

**Response:** `200 OK`

```json
{
  "data": {
    "id": "cuid",
    "merchantName": "Supermarket XYZ",
    "purchaseDate": "2026-04-03",
    "subtotal": 45.5,
    "tax": 3.64,
    "total": 49.14,
    "status": "COMPLETED",
    "imageUrl": "https://...",
    "items": [
      {
        "id": "cuid",
        "name": "Whole Milk 1L",
        "quantity": 2,
        "unitPrice": 3.5,
        "totalPrice": 7.0,
        "product": { "id": "cuid", "name": "Whole Milk" }
      }
    ],
    "uploadedBy": { "id": "cuid", "displayName": "Carlos" },
    "processedAt": "2026-04-03T15:30:00.000Z"
  }
}
```

#### `PATCH /receipts/:id/items/:itemId`

Manually correct a parsed receipt item (fix OCR errors).

**Body:**

```json
{
  "name": "string (optional)",
  "quantity": "number (optional)",
  "unitPrice": "number (optional)",
  "totalPrice": "number (optional)",
  "productId": "string (optional - re-link to a different product)"
}
```

**Response:** `200 OK` → Updated ReceiptItem

#### `DELETE /receipts/:id`

Delete a receipt and its items. **ADMIN only.**

---

### Insights

#### `GET /insights/spending`

Get spending analytics for the household.

**Query params:** `period` (week | month | quarter | year), `startDate`, `endDate`

**Response:** `200 OK`

```json
{
  "data": {
    "totalSpent": 523.4,
    "receiptCount": 12,
    "averagePerReceipt": 43.62,
    "byCategory": [
      { "category": "Dairy", "total": 85.2, "percentage": 16.3 },
      { "category": "Meat & Fish", "total": 120.0, "percentage": 22.9 }
    ],
    "trend": [
      { "date": "2026-03-04", "total": 52.3 },
      { "date": "2026-03-11", "total": 48.9 }
    ]
  }
}
```

#### `GET /insights/frequent-items`

Get the most frequently purchased items.

**Query params:** `limit` (default: 10)

**Response:** `200 OK`

````json
{
  "data": [
    {
      "product": {
        "id": "cuid",
        "name": "Whole Milk",
        "category": { "name": "Dairy", "icon": "🥛" }
      },
      "purchaseCount": 24,
      "lastPurchasedAt": "2026-04-01T10:00:00.000Z",
      "averagePrice": 3.50
    }
  ]
}

---

### Categories

#### `GET /categories`
Get all product categories. Used for filtering and display.

**Response:** `200 OK` → Array of Category objects (not paginated, small dataset)

---

### Health

#### `GET /health` `[Public]`
Health check endpoint for load balancers and monitoring.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-04-04T12:00:00.000Z"
}
````
