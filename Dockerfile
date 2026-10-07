# Multi-stage Dockerfile optimized for Northflank deployment
# Stage 1: Build Vite frontend application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definition
COPY package*.json ./

# Install dependencies (including devDependencies required for vite build)
RUN npm install --legacy-peer-deps

# Copy application source code
COPY . .

# Build production assets (outputs to /app/dist)
RUN npm run build

# Stage 2: Production lightweight runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy built distribution files and Express server
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Expose container port (Northflank binds to $PORT or default 3000)
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/healthz || exit 1

# Start the Node.js production server
CMD ["node", "server.js"]
