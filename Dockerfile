# ---------- Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Dependências
COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

# Código
COPY tsconfig.json ./
COPY constants.json ./constants.json
COPY src ./src

# Build TypeScript (gera /build)
RUN npm run build


# ---------- Runtime ----------
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

# Apenas o necessário para rodar
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/constants.json ./constants.json
COPY --from=builder /app/prisma ./prisma

# Entry point
CMD ["node", "build/index.js"]
