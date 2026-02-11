# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (from backend directory, since build context is repo root)
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Copy prisma schema - this is required for build
COPY backend/prisma/ ./prisma/

# Install all dependencies
RUN npm ci

# Copy source code
COPY backend/src/ ./src/

# Generate Prisma client
RUN npm run prisma:generate

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling and curl for health checks
RUN apk add --no-cache dumb-init curl

# Copy built application and dependencies from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Health check for Docker
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "run", "start"]
