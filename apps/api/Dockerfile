# ─── Build Stage ──────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/utils/package.json ./packages/utils/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api/ ./apps/api/
COPY packages/ ./packages/
COPY tsconfig.base.json ./

# Generate Prisma client and build
RUN pnpm --filter=api prisma generate
RUN pnpm --filter=api build

# ─── Production Stage ────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

ENV NODE_ENV=production

# Copy built application
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/src/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/main"]
