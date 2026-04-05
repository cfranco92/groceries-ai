# Handoff: Infrastructure & DevOps — Sprint 2

## Context

Sprint 2 introduces Google Cloud Platform integrations: Cloud Storage for receipt images and Document AI for OCR processing. The monorepo, CI pipeline, Docker Compose, and env management are already in place from Sprint 1.

## Target Agent

**DevOps Engineer** (`.claude/agents/devops-engineer.md`)

## Jira Workflow

This agent does not own a dedicated Jira ticket for Sprint 2. The infra work supports SCRUM-25 and SCRUM-26. Comment on those tickets if you make infra changes that affect them.

## Context Files to Read First

1. `CLAUDE.md` — Project conventions
2. `docs/ARCHITECTURE.md` — GCS, Document AI, deployment architecture
3. `.claude/rules/devops-deployment.md` — CI/CD rules
4. `docker-compose.yml` — Current local services
5. `apps/api/.env` and `apps/api/.env.example` — Current env vars
6. `.github/workflows/ci.yml` — Current CI pipeline

## What Already Exists

- Docker Compose: PostgreSQL (port 5433) + Redis (port 6379)
- CI pipeline: lint -> type-check -> test -> build
- `.env.example` files for both apps
- `apps/api/.env` with database and Firebase credentials

## Requirements

### 1. Google Cloud Storage Configuration

**Environment variables** (add to `apps/api/.env.example` if not present):
```
GCS_BUCKET_NAME=groceries-ai-receipts
GCP_PROJECT_ID=<project-id>
GOOGLE_APPLICATION_CREDENTIALS=<path-to-service-account-key>
```

**Verify in `.env.example`:**
- `GCS_BUCKET_NAME` is listed
- `GCP_PROJECT_ID` is listed
- Document how to set up a GCS bucket for local development

**For local dev without GCS:**
- The backend developer will implement a local file storage fallback
- No additional infra needed; just ensure `/tmp/uploads` is writable

### 2. Google Document AI Configuration

**Environment variables** (add to `apps/api/.env.example`):
```
GOOGLE_DOCUMENT_AI_PROCESSOR_ID=<processor-id>
GOOGLE_DOCUMENT_AI_LOCATION=us  # or eu
```

**Documentation:**
- Add a section to `apps/api/.env.example` explaining how to:
  1. Create a Document AI processor in GCP Console
  2. Use the "Expense Parser" processor type
  3. Get the processor ID
  4. Set up authentication (service account key)

### 3. CI Pipeline Updates

Update `.github/workflows/ci.yml` if needed:

- **New dependencies**: The backend will add `@google-cloud/storage` and `@google-cloud/documentai`. These are npm packages, so `pnpm install --frozen-lockfile` will handle them.
- **Test environment**: Backend unit tests mock GCP services, so no GCP credentials needed in CI.
- **Build environment**: Ensure `pnpm build` passes with the new modules. If the build requires GCP env vars to be present (even if empty), add them as CI env defaults:
  ```yaml
  env:
    GCS_BUCKET_NAME: test-bucket
    GCP_PROJECT_ID: test-project
    GOOGLE_DOCUMENT_AI_PROCESSOR_ID: test-processor
  ```
- **No service containers needed** for Sprint 2 (GCP calls are mocked in tests)

### 4. Docker Compose — No Changes Expected

Current setup is sufficient. Redis is available for future BullMQ async processing (Sprint 3+).

### 5. Storage Security Notes

Document these security requirements for the backend developer:
- GCS bucket should NOT have public access
- All image access must go through signed URLs with expiration (15-60 minutes)
- File uploads must be validated: max 10MB, JPEG/PNG/PDF only
- File keys should include householdId for logical separation: `receipts/{householdId}/{uuid}.{ext}`
- Service account should have minimal permissions: `storage.objects.create`, `storage.objects.get`, `storage.objects.delete` on the specific bucket

## Acceptance Criteria

- [ ] `.env.example` updated with GCS and Document AI variables
- [ ] CI pipeline passes with new backend dependencies
- [ ] CI has dummy env vars for GCP services so build doesn't fail
- [ ] Security requirements documented
- [ ] No secrets committed

## After Completion

Create `docs/handoffs/infra-ready-sprint-2.md` with:
- What was configured
- How to set up GCP credentials locally
- CI changes made
- Any manual steps needed
