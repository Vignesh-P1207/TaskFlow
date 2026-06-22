FROM node:20-alpine

# Install OpenSSL (Required by Prisma on Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy Prisma schema and generate the database client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the application source code
COPY src ./src

# Set Node environment to production for performance optimizations
ENV NODE_ENV=production

# Expose the backend port
EXPOSE 5000

# Start script: Automatically deploy pending migrations and start the Express server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
