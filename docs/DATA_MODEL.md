# GroceriesAI - Data Model

## Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    User      │       │    Household     │       │  HouseholdInvite │
│──────────────│       │──────────────────│       │──────────────────│
│ id           │──┐    │ id               │◄──────│ householdId      │
│ firebaseUid  │  │    │ name             │       │ email            │
│ email        │  ├───►│ createdAt        │       │ inviteCode       │
│ displayName  │  │    │ updatedAt        │       │ status           │
│ avatarUrl    │  │    └────────┬─────────┘       │ expiresAt        │
│ householdId  │──┘             │                 └──────────────────┘
│ role         │                │
│ createdAt    │                │
│ updatedAt    │                │
└──────────────┘                │
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  ShoppingList    │  │    Product       │  │    Receipt       │
│──────────────────│  │──────────────────│  │──────────────────│
│ id               │  │ id               │  │ id               │
│ householdId      │  │ householdId      │  │ householdId      │
│ name             │  │ name             │  │ userId           │
│ status           │  │ category         │  │ imageUrl         │
│ createdById      │  │ defaultUnit      │  │ merchantName     │
│ completedAt      │  │ averagePrice     │  │ purchaseDate     │
│ createdAt        │  │ lastPurchasedAt  │  │ subtotal         │
│ updatedAt        │  │ purchaseCount    │  │ tax              │
│ deletedAt        │  │ avgDaysBetween   │  │ total            │
└────────┬─────────┘  │ createdAt        │  │ status           │
         │            │ updatedAt        │  │ processedAt      │
         │            └────────┬─────────┘  │ rawOcrData       │
         │                     │            │ createdAt        │
         ▼                     │            │ updatedAt        │
┌──────────────────┐           │            └────────┬─────────┘
│  ListItem        │           │                     │
│──────────────────│           │                     ▼
│ id               │           │           ┌──────────────────┐
│ listId           │           │           │  ReceiptItem     │
│ productId        │───────────┤           │──────────────────│
│ name             │           │           │ id               │
│ quantity         │           │           │ receiptId        │
│ unit             │           │           │ productId        │──────┘
│ isChecked        │           │           │ name             │
│ addedById        │           │           │ quantity         │
│ notes            │           │           │ unitPrice        │
│ sortOrder        │           │           │ totalPrice       │
│ createdAt        │           │           │ createdAt        │
│ updatedAt        │           │           └──────────────────┘
└──────────────────┘           │
                               │
                    ┌──────────┴─────────┐
                    │   Category         │
                    │────────────────────│
                    │ id                 │
                    │ name               │
                    │ icon               │
                    │ sortOrder          │
                    │ createdAt          │
                    └────────────────────┘
```

## Prisma Schema

This is the reference schema. The actual `schema.prisma` file should match this spec.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ──────────────────────────────────────────────

enum UserRole {
  ADMIN
  MEMBER
}

enum ListStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum ReceiptStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  CANCELLED
}

enum UnitType {
  UNIT
  KG
  LB
  G
  L
  ML
  OZ
  DOZEN
  PACK
}

// ─── MODELS ─────────────────────────────────────────────

model User {
  id           String   @id @default(cuid())
  firebaseUid  String   @unique @map("firebase_uid")
  email        String   @unique
  displayName  String?  @map("display_name")
  avatarUrl    String?  @map("avatar_url")
  role         UserRole @default(MEMBER)
  householdId  String?  @map("household_id")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  household    Household?     @relation(fields: [householdId], references: [id])
  createdLists ShoppingList[] @relation("ListCreator")
  addedItems   ListItem[]     @relation("ItemAdder")
  receipts     Receipt[]

  @@map("users")
}

model Household {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  members  User[]
  lists    ShoppingList[]
  products Product[]
  receipts Receipt[]
  invites  HouseholdInvite[]

  @@map("households")
}

model HouseholdInvite {
  id          String       @id @default(cuid())
  householdId String       @map("household_id")
  email       String?
  inviteCode  String       @unique @map("invite_code")
  status      InviteStatus @default(PENDING)
  expiresAt   DateTime     @map("expires_at")
  createdAt   DateTime     @default(now()) @map("created_at")
  updatedAt   DateTime     @updatedAt @map("updated_at")

  household Household @relation(fields: [householdId], references: [id])

  @@map("household_invites")
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  icon      String?
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")

  products Product[]

  @@map("categories")
}

model Product {
  id              String    @id @default(cuid())
  householdId     String    @map("household_id")
  name            String
  categoryId      String?   @map("category_id")
  defaultUnit     UnitType  @default(UNIT) @map("default_unit")
  averagePrice    Decimal?  @map("average_price") @db.Decimal(10, 2)
  lastPurchasedAt DateTime? @map("last_purchased_at")
  purchaseCount   Int       @default(0) @map("purchase_count")
  avgDaysBetween  Float?    @map("avg_days_between_purchases")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  household    Household     @relation(fields: [householdId], references: [id])
  category     Category?     @relation(fields: [categoryId], references: [id])
  listItems    ListItem[]
  receiptItems ReceiptItem[]

  @@unique([householdId, name])
  @@index([householdId])
  @@index([categoryId])
  @@index([lastPurchasedAt])
  @@map("products")
}

model ShoppingList {
  id          String     @id @default(cuid())
  householdId String     @map("household_id")
  name        String
  status      ListStatus @default(ACTIVE)
  createdById String     @map("created_by_id")
  completedAt DateTime?  @map("completed_at")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")
  deletedAt   DateTime?  @map("deleted_at")

  household Household @relation(fields: [householdId], references: [id])
  createdBy User      @relation("ListCreator", fields: [createdById], references: [id])
  items     ListItem[]

  @@index([householdId])
  @@index([status])
  @@map("shopping_lists")
}

model ListItem {
  id        String   @id @default(cuid())
  listId    String   @map("list_id")
  productId String?  @map("product_id")
  name      String
  quantity  Decimal  @default(1) @db.Decimal(10, 2)
  unit      UnitType @default(UNIT)
  isChecked Boolean  @default(false) @map("is_checked")
  addedById String   @map("added_by_id")
  notes     String?
  sortOrder Int      @default(0) @map("sort_order")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  list    ShoppingList @relation(fields: [listId], references: [id], onDelete: Cascade)
  product Product?     @relation(fields: [productId], references: [id])
  addedBy User         @relation("ItemAdder", fields: [addedById], references: [id])

  @@index([listId])
  @@map("list_items")
}

model Receipt {
  id           String        @id @default(cuid())
  householdId  String        @map("household_id")
  userId       String        @map("user_id")
  imageUrl     String        @map("image_url")
  merchantName String?       @map("merchant_name")
  purchaseDate DateTime?     @map("purchase_date")
  subtotal     Decimal?      @db.Decimal(10, 2)
  tax          Decimal?      @db.Decimal(10, 2)
  total        Decimal?      @db.Decimal(10, 2)
  status       ReceiptStatus @default(PENDING)
  processedAt  DateTime?     @map("processed_at")
  rawOcrData   Json?         @map("raw_ocr_data")
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  household Household     @relation(fields: [householdId], references: [id])
  user      User          @relation(fields: [userId], references: [id])
  items     ReceiptItem[]

  @@index([householdId])
  @@index([userId])
  @@index([purchaseDate])
  @@map("receipts")
}

model ReceiptItem {
  id         String  @id @default(cuid())
  receiptId  String  @map("receipt_id")
  productId  String? @map("product_id")
  name       String
  quantity   Decimal @default(1) @db.Decimal(10, 2)
  unitPrice  Decimal @map("unit_price") @db.Decimal(10, 2)
  totalPrice Decimal @map("total_price") @db.Decimal(10, 2)
  createdAt  DateTime @default(now()) @map("created_at")

  receipt Receipt  @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id])

  @@index([receiptId])
  @@map("receipt_items")
}
```

## Key Design Decisions

### Product Catalog is Per-Household

Each household has its own product catalog. When a product is added to a list or parsed from a receipt, the system tries to match it against existing products in that household's catalog (fuzzy matching by name). If no match is found, a new product is created.

### Purchase Analytics on Product

The `Product` model stores aggregated purchase data directly (`averagePrice`, `purchaseCount`, `avgDaysBetween`, `lastPurchasedAt`). These are updated each time a receipt containing that product is processed. This denormalization avoids expensive aggregate queries when generating recommendations.

### Soft Deletes for Lists

Shopping lists use soft deletes (`deletedAt`) so that historical data and analytics are preserved even when users "delete" old lists. Products and receipts do not support soft deletes since they represent factual purchase history.

### ListItem Has Both `name` and `productId`

A list item always has a `name` (what the user typed) and optionally a `productId` (if it was matched to a known product). This allows users to add free-text items without requiring a product match, while still enabling analytics when a match exists.

## Indexes

The schema includes indexes optimized for the most common query patterns:

- `products.householdId` - all products in a household
- `products.categoryId` - products by category
- `products.lastPurchasedAt` - for recommendation queries ("not purchased recently")
- `shopping_lists.householdId` - all lists in a household
- `shopping_lists.status` - active vs completed lists
- `list_items.listId` - all items in a list
- `receipts.householdId` - all receipts in a household
- `receipts.userId` - receipts by uploader
- `receipts.purchaseDate` - receipt history queries
- `receipt_items.receiptId` - all items in a receipt

## Seed Data

The database seed script (`prisma/seed.ts`) should create:

1. Default categories: Fruits & Vegetables, Dairy, Meat & Fish, Bakery, Beverages, Snacks, Cleaning, Personal Care, Frozen, Canned Goods, Grains & Pasta, Condiments, Other.
2. A demo household with sample data for development/testing.
