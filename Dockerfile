FROM node:22.16

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Prisma generate NÃO deve depender de DATABASE_URL
#RUN npx prisma generate

RUN npm run build

CMD ["npm", "run", "start"]
