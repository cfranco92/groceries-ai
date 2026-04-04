---
scope: .github/workflows/**
---

# CI/CD & Deployment Rules

- Use `pnpm install --frozen-lockfile` in CI (never plain `pnpm install`)
- Pin all action versions: `actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v3`
- Node.js version: 20 (LTS)
- pnpm version: 9
- Pipeline order: lint → type-check → test → build
- Use `concurrency` groups to cancel in-progress runs for the same branch
- Never commit or log secrets
- Docker images: use specific tags, never `:latest`
- All secrets via GitHub Secrets or GCP Secret Manager
