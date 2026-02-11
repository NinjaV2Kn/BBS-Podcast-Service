# 🐳 Docker Setup - BBS Podcast Plattform

## Übersicht

Das Projekt läuft **minimal mit SQLite + lokalen Speicher** out-of-the-box.  
Optional kann PostgreSQL + MinIO für Production aktiviert werden.

---

## 🚀 Schnellstart (Minimal Setup)

```bash
# Services starten
docker-compose up -d

# Status prüfen
docker-compose ps
```

**Zugriff:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

Das ist alles! Keine zusätzliche Konfiguration nötig.

---

## 🗄️ Optional: PostgreSQL Datenbank

### Aktivieren

1. In `docker-compose.yml` das `postgres` Service entkommentieren
2. Backend `DATABASE_URL` auf PostgreSQL setzen:

```yaml
backend:
  environment:
    DATABASE_URL: postgresql://podcast_user:password@postgres:5432/podcasts
```

3. Starten:
```bash
docker-compose up -d
```

Die Datenbank wird automatisch migriert beim Start.

### Daten Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U podcast_user podcasts > backup.sql

# Restore
docker-compose exec -T postgres psql -U podcast_user podcasts < backup.sql
```

---

## ☁️ Optional: MinIO S3 Storage

### Aktivieren

1. In `docker-compose.yml` das `minio` Service entkommentieren
2. Backend S3-Variablen setzen:

```yaml
backend:
  environment:
    S3_ENDPOINT: http://minio:9000
    S3_ACCESS_KEY: minioadmin
    S3_SECRET_KEY: secure-password-here
    S3_BUCKET_PODCASTS: podcasts
    S3_BUCKET_COVERS: covers
```

3. Starten:
```bash
docker-compose up -d
```

4. MinIO Console öffnen: http://localhost:9001
   - Login: minioadmin / your-password

### Buckets erstellen

Via Console oder CLI:
```bash
docker-compose exec minio mc mb minio/podcasts
docker-compose exec minio mc mb minio/covers
```

---

## 🔧 Konfiguration

### Umgebungsvariablen

Erstelle eine `.env.docker` Datei (optional):

```bash
# Required
JWT_SECRET=your-long-random-string-here

# Optional - PostgreSQL
POSTGRES_PASSWORD=your-secure-password

# Optional - MinIO
MINIO_PASSWORD=your-secure-password
```

Dann starten mit:
```bash
docker-compose --env-file .env.docker up -d
```

---

## 📊 Monitoring

```bash
# Logs anzeigen (alle)
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Frontend
docker-compose logs -f frontend

# Nur Datenbank
docker-compose logs -f postgres
```

---

## 🧹 Wartung

### Containers neustarten
```bash
docker-compose restart
```

### Alles löschen und neu starten
```bash
# Nur Containers (Daten bleiben)
docker-compose down

# Alles inkl. Daten (VORSICHT!)
docker-compose down -v
```

### Database Migrations
```bash
# Manuell ausführen
docker-compose exec backend npx prisma migrate deploy

# Prisma Studio öffnen
docker-compose exec backend npx prisma studio
```

---

## 🌐 Production Deployment

### Environment Setup

1. `.env` Datei mit Production-Werten erstellen:

```bash
JWT_SECRET=generate-very-long-random-secret-string
POSTGRES_PASSWORD=very-secure-database-password
MINIO_PASSWORD=very-secure-minio-password
```

2. `docker-compose.yml` anpassen:
   - Alle Services uncommentieren
   - Ports anpassen (z.B. nur 8080 & 3000 von außen)
   - Health checks prüfen

3. Starten:
```bash
docker-compose --env-file .env up -d
```

### Reverse Proxy (Nginx)

Beispiel für Production mit Domain:

```nginx
upstream podcast_api {
    server backend:8080;
}

upstream podcast_frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name podcast.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name podcast.example.com;

    ssl_certificate /etc/letsencrypt/live/podcast.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/podcast.example.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://podcast_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://podcast_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Volume Backups

```bash
# PostgreSQL Daten backup
docker run --rm -v podcast-service_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/db-backup.tar.gz -C /data .

# MinIO Daten backup
docker run --rm -v podcast-service_minio_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/minio-backup.tar.gz -C /data .
```

---

## ❓ Troubleshooting

### Backend connection refused
```bash
# Check ob Datenbank ready ist
docker-compose logs postgres

# Manuell Migrationen ausführen
docker-compose exec backend npx prisma migrate deploy
```

### MinIO connection error
```bash
# Check MinIO Status
docker-compose logs minio

# Restart MinIO
docker-compose restart minio
```

### Port already in use
Ändere in `docker-compose.yml`:
```yaml
ports:
  - "8888:8080"  # Außen:Innen
```

### Upload fehlgeschlagen
```bash
# Check permission auf uploads folder
docker-compose exec backend ls -la /app/uploads

# Restart backend
docker-compose restart backend
```

---

## 📚 Weitere Ressourcen

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL: https://hub.docker.com/_/postgres
- MinIO: https://hub.docker.com/r/minio/minio
