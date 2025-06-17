# Step 1: Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy full app
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the Remix app
RUN npm run build


# Step 2: Run Stage
FROM node:20-alpine AS run

WORKDIR /app

# Copy only what's needed to run
COPY --from=build /app ./

# Prisma client is already generated
EXPOSE 3000

# Start your server
CMD ["node", "server.js"]
