# ── Stage 1 : Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Dépendances
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production=false

# Build TypeScript
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# Générer le client Prisma
RUN npx prisma generate

# ── Stage 2 : Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Sécurité : utilisateur non-root
RUN addgroup -S avs && adduser -S avs -G avs

# Copie uniquement le nécessaire
COPY --from=builder /app/dist             ./dist
COPY --from=builder /app/node_modules     ./node_modules
COPY --from=builder /app/prisma           ./prisma
COPY package.json ./

USER avs
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]
