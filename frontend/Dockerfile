# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files (from frontend directory, since build context is repo root)
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json frontend/vite.config.ts frontend/postcss.config.js frontend/tailwind.config.js ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/src/ ./src/
COPY frontend/index.html ./
COPY frontend/public/ ./public/ 2>/dev/null || true

# Build the application
RUN npm run build

# Runtime stage - nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copy nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
  listen 3000 default_server;
  server_name _;

  # Gzip compression
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
  gzip_vary on;
  gzip_min_length 1024;

  # SPA routing
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
    expires 1h;
    add_header Cache-Control "public, immutable";
  }

  # API proxy
  location /api/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 90;
  }

  # Health check endpoint
  location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
  }
}
EOF

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx user
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Fix permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/health || exit 1

EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
