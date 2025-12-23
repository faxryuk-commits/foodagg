# ===========================================
# Merchant App Dockerfile (Next.js)
# ===========================================

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/merchant-app/package.json ./apps/merchant-app/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/merchant-app/node_modules ./apps/merchant-app/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY apps/merchant-app ./apps/merchant-app
COPY packages/shared ./packages/shared
COPY tsconfig.json ./

WORKDIR /app/apps/merchant-app
RUN pnpm build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/merchant-app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/merchant-app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/merchant-app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

