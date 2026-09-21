FROM node:20-alpine AS deps
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=1536
ENV DATABASE_URL="postgresql://maferefun:maferefun@127.0.0.1:5432/maferefun"
ENV SESSION_SECRET="build-time-placeholder-not-used-in-runtime"
RUN npx prisma generate
RUN npx next build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["sh", "-c", "i=0; until npx prisma migrate deploy; do i=$((i+1)); echo \"waiting for postgres ($i)\"; if [ \"$i\" -gt 30 ]; then exit 1; fi; sleep 2; done; npx tsx prisma/seed.ts; exec node server.js"]
