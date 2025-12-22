# =========================
# STAGE 1 — BUILD
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# Dependências necessárias para Prisma
RUN apk add --no-cache openssl libc6-compat

# Copia arquivos de dependência
COPY package.json package-lock.json ./

# Instala dependências
RUN npm ci

# Copia o resto do projeto
COPY . .

# Gera Prisma Client
RUN npx prisma generate

# Build do TypeScript
RUN npm run build


# =========================
# STAGE 2 — RUNTIME
# =========================
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

# Copia apenas o necessário
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# Segurança básica
RUN addgroup -S app && adduser -S app -G app
USER app

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
