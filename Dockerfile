FROM node:22.16

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# COPIA O .env PARA DENTRO DA IMAGEM
COPY .env .env

RUN npm run build

CMD ["npm", "run", "start"]
