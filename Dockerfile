# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY package-lock.json ./

# Install production dependencies only
RUN npm install --omit=dev && npm cache clean --force

# Copy rest of the application
COPY . .

# Build the app (Remix & Prisma migrations)
RUN npm run setup && npm run build

# Set environment variables (Optional: override in Render or Vercel dashboard)
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the app
CMD ["npm", "run", "start"]
