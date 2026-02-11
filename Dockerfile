# Build both frontend and backend in one image
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
COPY frontend/tsconfig*.json frontend/vite.config.ts frontend/postcss.config.js frontend/tailwind.config.js ./

RUN npm ci

COPY frontend/src/ ./src/
COPY frontend/index.html ./

RUN npm run build

# Build backend stage
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/prisma/ ./prisma/

RUN npm ci

COPY backend/src/ ./src/

RUN npm run prisma:generate && npm run build

# Final runtime stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for signal handling and curl for health checks
RUN apk add --no-cache dumb-init curl

# Copy backend files
COPY backend/package*.json ./backend/
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copy frontend build output
COPY --from=frontend-builder /app/frontend/dist ./backend/dist/public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create uploads directory
RUN mkdir -p /app/backend/uploads && chmod 755 /app/backend/uploads

# Fix permissions
RUN chown -R nodejs:nodejs /app

USER nodejs

WORKDIR /app/backend

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "start"]
