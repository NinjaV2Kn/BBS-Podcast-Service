# 🚀 Docker Deployment Guide

Produktionsreife Anleitung für die Podcast-Plattform mit Docker Compose.

---

## 📋 Inhaltsverzeichnis

1. [Quickstart](#quickstart)
2. [Konfiguration](#konfiguration)
3. [Deployment](#deployment)
4. [Monitoring & Wartung](#monitoring--wartung)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Topics](#advanced-topics)

---

## Quickstart

### Ein-Liner Start (für Demo/Testing)

```bash
# Repository klonen
git clone <repo-url> && cd BBS-Podcast-Service

# Environment vorbereiten
cp .env.example .env

# Alles starten
docker-compose up -d

# Status prüfen
docker-compose ps
```

**Services sofort verfügbar:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- MinIO Console: http://localhost:9001

---

## Konfiguration

### 1. Environment-Datei erstellen

```bash
cp .env.example .env
```

### 2. Sichere Secrets generieren

```bash
# JWT Secret (32 bytes)
openssl rand -base64 32

# Datenbank Password
openssl rand -base64 16

# MinIO Password
openssl rand -base64 16
```

### 3. .env aktualisieren

```env
# Kritisch für Security!
JWT_SECRET=<generated-32-byte-value>
POSTGRES_PASSWORD=<generated-16-byte-value>
MINIO_ROOT_PASSWORD=<generated-16-byte-value>

# Domain/URL anpassen
FRONTEND_URL=http://your-domain.com:3000

# Optional: Remote Pi konfigurieren
# DATABASE_URL=postgresql://user:pass@<pi-ip>:5432/podcasts
```

---

## Deployment

### Option A: Single-Machine Deployment (Recommended)

Alles auf einem Server laufen lassen.

```bash
# 1. Vorbereitung
docker-compose down  # Falls vorher lief
docker system prune  # Cleanup

# 2. Build & Start
docker-compose build --no-cache
docker-compose up -d

# 3. Database-Setup
docker-compose exec backend npx prisma migrate deploy

# 4. Verification
docker-compose ps
curl http://localhost:8080/health
curl http://localhost:3000
```

### Option B: Production mit Reverse Proxy (Nginx)

Für echte Production mit SSL/TLS.

**nginx.conf:**

```nginx
upstream backend {
  server backend:8080;
}

upstream frontend {
  server frontend:3000;
}

server {
  listen 80;
  server_name podcast.example.com;

  # Redirect to HTTPS
  location / {
    return 301 https://$server_name$request_uri;
  }
}

server {
  listen 443 ssl http2;
  server_name podcast.example.com;

  ssl_certificate /etc/letsencrypt/live/podcast.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/podcast.example.com/privkey.pem;

  # Frontend
  location / {
    proxy_pass http://frontend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # API
  location /api/ {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }

  # MinIO (optional)
  location /minio/ {
    proxy_pass http://minio:9001/;
    proxy_set_header Host $host;
  }
}
```

### Option C: Kubernetes Deployment

Für großer Scale (optional).

```bash
# Helm Chart verwenden (müsste erstellt werden)
# helm install podcast ./chart -f values-prod.yaml
```

---

## Monitoring & Wartung

### Health Status prüfen

```bash
# Alle Services
docker-compose ps

# Detaillierte Logs
docker-compose logs

# Nur Fehler
docker-compose logs | grep ERROR

# Spezifischer Service
docker-compose logs -f backend
```

### Datenbank-Backup

```bash
# PostgreSQL Dump
docker-compose exec postgres pg_dump \
  -U podcast_user -d podcasts \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
docker-compose exec -T postgres \
  psql -U podcast_user -d podcasts < backup_20250211.sql
```

### MinIO Objekte auflisten

```bash
docker-compose exec minio mc ls minio/podcasts
```

### Service neustarten

```bash
# Nur Backend
docker-compose restart backend

# Nur DB
docker-compose restart postgres

# Alle
docker-compose restart
```

---

## Troubleshooting

### "Container exits immediately"

```bash
# Logs anschauen
docker-compose logs backend

# Häufige Ursachen:
# 1. Environment-Variablen falsch
# 2. Port bereits belegt
# 3. Database-Connection fehlgeschlagen
```

### "Cannot connect to database"

```bash
# Postgres Status
docker-compose exec postgres pg_isready

# Logs
docker-compose logs postgres

# Ggf. Migration erneut versuchen
docker-compose exec backend npx prisma migrate deploy
```

### "MinIO bucket not found"

```bash
# In MinIO Console erstellen:
# http://localhost:9001 → Create Bucket → "podcasts"

# Oder CLI:
docker-compose exec minio \
  mc mb minio/podcasts
```

### "CORS errors"

```bash
# Prüfe FRONTEND_URL & .env
echo $FRONTEND_URL

# Backend neustarten nach .env-Änderung
docker-compose restart backend
```

### "Upload fails"

```bash
# MinIO Logs
docker-compose logs minio

# S3 Credentials prüfen
docker-compose exec backend env | grep S3_
```

---

## Advanced Topics

### Custom Environment per Environment

**production.env:**
```env
NODE_ENV=production
# ... production values
```

**Start mit Custom Env:**
```bash
docker-compose --env-file production.env up -d
```

### Volume Management

```bash
# Alle Volumes auflisten
docker volume ls

# Volume inspect
docker volume inspect podcast_postgres_data

# Manuell mounten
docker run -v postgres_data:/data alpine ls -la /data
```

### Updates durchführen

```bash
# Code pullen
git pull origin main

# Images neu bauen
docker-compose build --no-cache

# Services aktualisieren
docker-compose up -d

# Migrations ausführen falls nötig
docker-compose exec backend npx prisma migrate deploy
```

### Secrets Management (für Production)

```bash
# Statt .env verwenden
docker secret create jwt_secret -  # Interaktiv eingeben

# In docker-compose.yml
secrets:
  jwt_secret:
    external: true

services:
  backend:
    secrets:
      - jwt_secret
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret
```

### Performance Tuning

```yaml
# docker-compose.mem-limit.yml
version: '3.8'
services:
  backend:
    mem_limit: 512m
    memswap_limit: 1g
  postgres:
    mem_limit: 1g
```

---

## 📊 Monitoring (Optional)

### Mit Prometheus + Grafana

```bash
# Services starten
docker run -d --name prometheus \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  -p 9090:9090 prom/prometheus

docker run -d --name grafana \
  -p 3001:3000 grafana/grafana
```

### Einfaches Health-Monitoring

```bash
#!/bin/bash
# health-check.sh

backends=(
  "http://localhost:8080/health"
  "http://localhost:3000"
)

for endpoint in "${backends[@]}"; do
  response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")
  if [[ $response == "200" ]]; then
    echo "✓ $endpoint - OK"
  else
    echo "✗ $endpoint - FAILED ($response)"
  fi
done
```

---

## 🔒 Security Checklist

- [ ] JWT_SECRET ist stark & zufällig
- [ ] Alle Passwörter sind geändert
- [ ] .env ist in .gitignore
- [ ] CORS nur für vertraute Domains
- [ ] SSL/TLS aktiviert (HTTPS)
- [ ] Firewall ports eingeschränkt
- [ ] Regular backups scheduled
- [ ] Logs monitored
- [ ] Container images signiert
- [ ] Regular updates durchgeführt

---

## 📞 Support

Bei Fragen:
1. Logs prüfen: `docker-compose logs -f`
2. Health endpoints: `/health`, `/ready`
3. Issue auf GitHub eröffnen
4. Dokumentation lesen: README.md & BACKLOG.md

**Notfall-Kill (falls alles hängt):**
```bash
docker-compose kill
docker system prune -a
docker-compose up -d
```

---

Generated: 2025-02-11 | Version: 1.0.0
