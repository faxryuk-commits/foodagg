# ===========================================
# API Dockerfile (Multi-stage build)
# ===========================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/api/package.json ./packages/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

# Copy source
COPY packages/api ./packages/api
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared
COPY tsconfig.json ./

# Generate Prisma client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build API
WORKDIR /app/packages/api
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 api
USER api

# Copy built files
COPY --from=builder --chown=api:nodejs /app/packages/api/dist ./dist
COPY --from=builder --chown=api:nodejs /app/packages/api/node_modules ./node_modules
COPY --from=builder --chown=api:nodejs /app/packages/database/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=api:nodejs /app/packages/database/prisma ./prisma

EXPOSE 4000

CMD ["node", "dist/index.js"]

