// GroceriesAI Shared Types
// This package is the source of truth for data interfaces shared between frontend and backend.
// All types here should match the Prisma schema in apps/api/src/prisma/schema.prisma

// ─── Enums ───────────────────────────────────────────────

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum ListStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum ReceiptStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum UnitType {
  UNIT = 'UNIT',
  KG = 'KG',
  LB = 'LB',
  G = 'G',
  L = 'L',
  ML = 'ML',
  OZ = 'OZ',
  DOZEN = 'DOZEN',
  PACK = 'PACK',
}

// ─── User ────────────────────────────────────────────────

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  householdId: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// ─── Household ───────────────────────────────────────────

export interface Household {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  displayName: string | null;
  email: string;
  role: UserRole;
}

export interface HouseholdInvite {
  id: string;
  householdId: string;
  email: string;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}

// ─── Shopping List ───────────────────────────────────────

export interface ShoppingList {
  id: string;
  name: string;
  status: ListStatus;
  householdId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
  isChecked: boolean;
  sortOrder: number;
  listId: string;
  productId: string | null;
  addedById: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Product ─────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  householdId: string;
  defaultUnit: UnitType;
  avgPrice: number | null;
  lastPurchasedAt: string | null;
  purchaseCount: number;
  avgDaysBetweenPurchases: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  sortOrder?: number;
}

// ─── Receipt ─────────────────────────────────────────────

export interface Receipt {
  id: string;
  householdId: string;
  userId: string;
  imageUrl: string;
  merchantName: string | null;
  purchaseDate: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  status: ReceiptStatus;
  processedAt: string | null;
  rawOcrData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptItem {
  id: string;
  receiptId: string;
  productId: string | null;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

// ─── Receipt DTOs ───────────────────────────────────────

export interface UploadReceiptInput {
  purchaseDate?: string;
  merchantName?: string;
}

export interface QueryReceiptsInput {
  status?: ReceiptStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

// ─── API Response Types ──────────────────────────────────

export interface ApiResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

// ─── Parsed Receipt (OCR) ───────────────────────────────

export interface ParsedLineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ParsedReceiptData {
  merchantName: string | null;
  purchaseDate: string | null;
  items: ParsedLineItem[];
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  rawResponse: Record<string, unknown>;
}

export interface UpdateReceiptItemInput {
  name?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  productId?: string;
}

// ─── Insights ────────────────────────────────────────────

export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  totalSpent: number;
  itemCount: number;
}

export interface FrequentItem {
  productId: string;
  productName: string;
  purchaseCount: number;
  avgDaysBetweenPurchases: number;
  daysSinceLastPurchase: number;
  confidence: number;
}

export interface RestockRecommendation {
  productId: string;
  productName: string;
  categoryName: string;
  avgDaysBetweenPurchases: number;
  daysSinceLastPurchase: number;
  urgency: 'high' | 'medium' | 'low';
  confidence: number;
}
