# Step 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
COPY .env .env  # <-- ✅ add this to ensure DATABASE_URL is available

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build
