# Step 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Step 2: Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=build /app /app

# Set environment variables here if needed
ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start"]
