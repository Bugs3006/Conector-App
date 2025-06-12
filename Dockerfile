# Use a Node base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm install --omit=dev && npm cache clean --force

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start your app
CMD ["npm", "run", "start"]
