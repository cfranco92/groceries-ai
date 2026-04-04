# GroceriesAI - Technical Architecture

## System Overview

GroceriesAI follows a client-server architecture with a Next.js frontend communicating with a NestJS REST API. The system leverages Google Cloud Platform services for authentication, file storage, and document processing.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Next.js Web  │    │ React Native │    │  Future PWA  │      │
│  │   (App Router)│    │   (Expo)     │    │              │      │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
└─────────┼───────────────────┼───────────────────┼──────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FIREBASE AUTH                                │
│              (JWT Token Verification)                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NESTJS API (REST)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │   Auth    │ │  Lists   │ │ Receipts │ │ Insights │          │
│  │  Module   │ │  Module  │ │  Module  │ │  Module  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐           │
│  │  Users   │ │Households│ │      Products        │           │
│  │  Module  │ │  Module  │ │       Module         │           │
│  └──────────┘ └──────────┘ └──────────────────────┘           │
└────────┬──────────────┬──────────────┬─────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌──────────────┐ ┌────────────┐ ┌─────────────────┐
│  PostgreSQL  │ │  Cloud     │ │  Document AI    │
│  (Prisma)    │ │  Storage   │ │  (Receipt OCR)  │
└──────────────┘ └────────────┘ └─────────────────┘
```

## Authentication Flow

1. User signs in via Firebase Auth on the client (Google provider or email/password).
2. Client receives a Firebase ID token (JWT).
3. Every API request includes the token in the `Authorization: Bearer <token>` header.
4. NestJS `AuthGuard` validates the token using Firebase Admin SDK.
5. The guard extracts the Firebase UID and attaches the user context to the request.
6. If the user does not exist in PostgreSQL, a record is created on first authenticated request (auto-provisioning).

```
Client                    Firebase Auth              NestJS API              PostgreSQL
  │                            │                        │                       │
  │── signInWithPopup() ──────►│                        │                       │
  │◄── ID Token (JWT) ────────│                        │                       │
  │                            │                        │                       │
  │── GET /api/lists ──────────┼───────────────────────►│                       │
  │   (Bearer token)           │                        │── verifyIdToken() ───►│
  │                            │                        │◄── decoded token ─────│
  │                            │                        │                       │
  │                            │                        │── findOrCreate() ────►│
  │                            │                        │◄── user record ───────│
  │                            │                        │                       │
  │◄── JSON response ─────────┼────────────────────────│                       │
```

## Receipt Processing Pipeline

1. User uploads a receipt image from the client.
2. The API receives the image via multipart form upload.
3. The image is stored in Google Cloud Storage with a unique key.
4. The receipt record is created in PostgreSQL with status `PROCESSING`.
5. A background job sends the image to Google Document AI for OCR.
6. Document AI returns structured data: merchant name, date, line items (name, quantity, price), subtotal, tax, and total.
7. The API parses the response, creates/matches products in the catalog, and associates them with the receipt.
8. Receipt status is updated to `COMPLETED` (or `FAILED` if OCR fails).

```
Client           NestJS API          Cloud Storage       Document AI       PostgreSQL
  │                  │                     │                  │                │
  │── POST /receipts ►│                     │                  │                │
  │   (image file)   │── upload image ────►│                  │                │
  │                  │◄── storage URL ─────│                  │                │
  │                  │── create receipt ───┼──────────────────┼───────────────►│
  │                  │   (PROCESSING)      │                  │                │
  │◄── 202 Accepted ─│                     │                  │                │
  │                  │                     │                  │                │
  │                  │── process image ────┼─────────────────►│                │
  │                  │◄── structured data ─┼──────────────────│                │
  │                  │                     │                  │                │
  │                  │── save items ───────┼──────────────────┼───────────────►│
  │                  │── update status ────┼──────────────────┼───────────────►│
  │                  │   (COMPLETED)       │                  │                │
```

### Background Processing Strategy

For Phase 1, receipt processing is handled synchronously within the API request (the user waits for processing). In Phase 2, we will introduce a proper job queue using **BullMQ** (Redis-backed) for async processing:

- Receipt upload returns immediately with `202 Accepted`
- A worker processes the receipt in the background
- Client polls for status or receives updates via WebSocket
- Failed jobs are retried up to 3 times with exponential backoff

## Household & Multi-User Model

The application is designed around the concept of a **Household** - a group of users (typically a family) who share shopping lists and data.

- A user belongs to exactly one household (for simplicity in Phase 1).
- Each household has one `ADMIN` (the creator) and one or more `MEMBER` roles.
- The admin can invite members via email or a shareable invite code.
- All lists, receipts, and products are scoped to the household.
- Authorization checks always verify household membership before granting access.

## Deployment Architecture (GCP)

### Phase 1 - Simple Deployment

- **Frontend**: Vercel (natural fit for Next.js, free tier is generous)
- **Backend**: Cloud Run (containerized NestJS, scales to zero)
- **Database**: Cloud SQL for PostgreSQL (smallest instance)
- **Storage**: Cloud Storage (standard bucket)
- **Document AI**: Pay-per-use API

### Phase 2 - Scaled Deployment

- **Redis**: Memorystore for Redis (for BullMQ job queue)
- **Monitoring**: Cloud Monitoring + structured logging
- **CDN**: Vercel Edge Network (automatic with Vercel)

## Security Considerations

- All API endpoints require authentication (except health check).
- Firebase tokens are verified on every request using Firebase Admin SDK.
- File uploads are validated: max size 10MB, allowed types (JPEG, PNG, PDF).
- Cloud Storage URLs are signed (not public) with expiration.
- SQL injection is prevented by Prisma's parameterized queries.
- CORS is configured to allow only the frontend origin.
- Rate limiting is applied to sensitive endpoints (auth, uploads).
- Environment variables are used for all secrets - never committed to the repo.
- Helmet middleware is enabled for HTTP security headers.

## Error Handling Strategy

The API uses NestJS exception filters with a consistent error response format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "email must be a valid email address"
    }
  ],
  "timestamp": "2026-04-04T12:00:00.000Z",
  "path": "/api/v1/users"
}
```

All API routes are prefixed with `/api/v1` to support future versioning.

## Performance Considerations

- Database queries use Prisma's `select` and `include` to avoid over-fetching.
- Pagination is mandatory for all list endpoints (cursor-based preferred).
- Images are compressed client-side before upload (max 2048px width).
- API responses are cached where appropriate (product catalog, categories).
- Database indexes are defined in the Prisma schema for common query patterns.
