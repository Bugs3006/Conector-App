FROM node:18-alpine
RUN apk add --no-cache openssl

WORKDIR /app
EXPOSE 8081

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Optionally remove CLI tools for production
RUN npm remove @shopify/cli || true

COPY . .

RUN npm run build

CMD ["node", "server.js"]
