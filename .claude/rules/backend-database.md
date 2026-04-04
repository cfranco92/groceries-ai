---
scope: apps/api/src/prisma/**
---

# Database & Prisma Rules

- Always create a migration for schema changes: `pnpm --filter=api prisma migrate dev --name descriptive_name`
- Never modify the database directly — all changes through Prisma migrations
- Use snake_case for PostgreSQL table/column names (Prisma `@@map` and `@map`)
- Use camelCase for Prisma model field names
- Every model must have `createdAt` and `updatedAt` fields
- Use soft deletes (`deletedAt` nullable timestamp) for: User, Household, ShoppingList, Product
- Use `cuid()` for all primary key IDs
- Add indexes on all foreign keys and frequently queried columns
- After schema changes, run `pnpm --filter=api prisma generate` to update the client
