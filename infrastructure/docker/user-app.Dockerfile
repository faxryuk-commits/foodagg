# ===========================================
# User App Dockerfile (Next.js)
# ===========================================

FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/user-app/package.json ./apps/user-app/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@8 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/user-app/node_modules ./apps/user-app/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY apps/user-app ./apps/user-app
COPY packages/shared ./packages/shared
COPY tsconfig.json ./

WORKDIR /app/apps/user-app
RUN pnpm build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/user-app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/user-app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/user-app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

