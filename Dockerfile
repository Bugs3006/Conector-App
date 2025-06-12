FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production
ENV SHOPIFY_APP_URL=https://conector-app.onrender.com  # 👈 Replace with your Render domain

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force
RUN npm remove @shopify/cli

COPY . .

RUN npm run build

CMD ["node", "server.js"]  # 👈 Or use npm run docker-start if you prefer
