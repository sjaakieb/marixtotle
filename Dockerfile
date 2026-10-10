# CapRover / Coolify ready - Next.js standalone
FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app
# better-sqlite3 ships no prebuilt binary for node:24-alpine, so it compiles
# from source via node-gyp (needs Python + a C++ toolchain, deps stage only).
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs \
  && mkdir -p /app/data && chown nextjs:nodejs /app/data
# SQLite lives at /app/data/app.db — mount a persistent volume here
# (CapRover: Persistent Directory, Coolify: Storage volume) so reports
# and admin users survive redeploys.
VOLUME /app/data
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
