# Infrastructure Ready — Sprint 2

## What Was Configured

### 1. Environment Variables (`apps/api/.env.example`)

Added the following GCP variables for Sprint 2 receipt processing:

| Variable | Purpose |
|---|---|
| `GCP_PROJECT_ID` | GCP project identifier (already existed) |
| `GCS_BUCKET_NAME` | Cloud Storage bucket for receipt images (already existed) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account key JSON file (new) |
| `GOOGLE_DOCUMENT_AI_PROCESSOR_ID` | Document AI processor ID (already existed) |
| `GOOGLE_DOCUMENT_AI_LOCATION` | Document AI region — `us` or `eu` (new) |

### 2. CI Pipeline (`.github/workflows/ci.yml`)

Added dummy GCP env vars to the build step so `pnpm build` succeeds without real credentials:

```yaml
GCS_BUCKET_NAME: test-bucket
GCP_PROJECT_ID: test-project
GOOGLE_DOCUMENT_AI_PROCESSOR_ID: test-processor
GOOGLE_DOCUMENT_AI_LOCATION: us
```

No GCP credentials are needed in CI — all GCP calls are mocked in tests.

### 3. Docker Compose — No Changes

Current setup (PostgreSQL + Redis) is sufficient for Sprint 2. Redis remains available for BullMQ in Sprint 3+.

## How to Set Up GCP Credentials Locally

### Step 1: Create a GCP Service Account

1. Go to [GCP Console > IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Create a service account (e.g., `groceries-ai-dev`)
3. Grant the following roles:
   - `Storage Object Admin` on the receipts bucket (or custom role with `storage.objects.create`, `storage.objects.get`, `storage.objects.delete`)
   - `Document AI Editor`
4. Create a JSON key and download it
5. Set `GOOGLE_APPLICATION_CREDENTIALS` in `apps/api/.env` to the path of the downloaded key file

### Step 2: Create a Cloud Storage Bucket

1. Go to [GCP Console > Cloud Storage](https://console.cloud.google.com/storage)
2. Create a bucket named `groceries-ai-receipts` (or your preferred name)
3. **Disable public access** — all access must go through signed URLs
4. Set `GCS_BUCKET_NAME` in `apps/api/.env`

### Step 3: Create a Document AI Processor

1. Go to [GCP Console > Document AI](https://console.cloud.google.com/ai/document-ai)
2. Enable the Document AI API if not already enabled
3. Create a processor using the **Expense Parser** type
4. Copy the processor ID
5. Set `GOOGLE_DOCUMENT_AI_PROCESSOR_ID` in `apps/api/.env`
6. Set `GOOGLE_DOCUMENT_AI_LOCATION` to the region (`us` or `eu`)

### Local Dev Without GCS

The backend implements a local file storage fallback. Ensure `/tmp/uploads` is writable. No GCP credentials are needed for local development if using the fallback.

## Security Requirements for Backend Developer

These requirements apply to the GCS and receipt upload implementation:

- **No public bucket access** — GCS bucket must not have public access enabled
- **Signed URLs** — All image access must use signed URLs with 15-60 minute expiration
- **Upload validation** — Max file size: 10MB. Allowed types: JPEG, PNG, PDF only
- **File key structure** — Use `receipts/{householdId}/{uuid}.{ext}` for logical separation
- **Minimal IAM permissions** — Service account should only have: `storage.objects.create`, `storage.objects.get`, `storage.objects.delete` on the specific bucket

## Known Issues

### Node.js 20 Deprecation in GitHub Actions (SCRUM-37)

GitHub Actions is deprecating Node.js 20 on runners:

- **June 2, 2026** — Actions forced to Node.js 24 by default
- **September 16, 2026** — Node.js 20 removed entirely

The CI pipeline currently uses `node-version: '20'`. This needs to be upgraded to Node.js 24 before the deadline. Tracked in [SCRUM-37](https://fcode.atlassian.net/browse/SCRUM-37).

## Manual Steps Needed

1. Each developer must create their own GCP service account key for local development
2. GCS bucket must be created manually in GCP Console (one-time setup)
3. Document AI processor must be created manually in GCP Console (one-time setup)
4. No secrets should be committed — all credentials go in `apps/api/.env` (gitignored)
