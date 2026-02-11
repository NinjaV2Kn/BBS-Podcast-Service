# Docker Setup für BBS Podcast Plattform

## Übersicht

Das Projekt ist vollständig containerisiert mit Docker und kann mit `docker-compose` gestartet werden. Das Setup beinhaltet:

- **Backend**: Node.js/Express API (Port 8080)
- **Frontend**: React/Vite mit Nginx (Port 3000)
- **Database**: PostgreSQL (Port 5432)
- **Storage**: MinIO S3-kompatibel (Port 9000 & 9001)

## Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0

## Installation

### 1. Environment Variablen

Erstelle eine `.env.docker` Datei im Root-Verzeichnis:

```bash
# YouTube Integration (optional)
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CLIENT_ID=your-client-id
YOUTUBE_CLIENT_SECRET=your-client-secret

# Database (optional, standard: podcast_password_change_me)
# POSTGRES_PASSWORD=your-secure-password

# MinIO (optional, standard: minioadmin_password_change_me)
# MINIO_PASSWORD=your-secure-password
```

### 2. Build & Start

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Zugang

Nach dem Start sind folgende Services erreichbar:

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8080 | - |
| MinIO Console | http://localhost:9001 | minioadmin / minioadmin_password_change_me |
| PostgreSQL | localhost:5432 | podcast_user / podcast_password_change_me |

## Datenbank Migrations

Migrations werden automatisch beim Start ausgeführt. Falls manuell nötig:

```bash
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma studio
```

## MinIO Setup

MinIO wird automatisch gestartet. Standardbucket erstellen:

```bash
# Auf MinIO Console zugreifen: http://localhost:9001
# Login mit minioadmin / minioadmin_password_change_me
# Buckets erstellen: "podcasts" und "covers"
```

Oder via CLI:

```bash
docker-compose exec minio mc mb minio/podcasts
docker-compose exec minio mc mb minio/covers
```

## Produktion

### Production-Variablen

Für Production sollten folgende Variablen in einer `.env.prod` gesetzt werden:

```bash
NODE_ENV=production

# Database
POSTGRES_USER=podcast_user
POSTGRES_PASSWORD=VERY_SECURE_PASSWORD_HERE
POSTGRES_DB=podcasts

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=VERY_SECURE_PASSWORD_HERE
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=VERY_SECURE_PASSWORD_HERE

# Security
JWT_SECRET=GENERATE_REALLY_LONG_RANDOM_STRING_HERE
YOUTUBE_API_KEY=your-production-key

# Domain (anpassen!)
FRONTEND_URL=https://your-domain.com
YOUTUBE_REDIRECT_URL=https://your-domain.com/api/youtube/callback
```

### Reverse Proxy (nginx)

Beispiel-Konfiguration für Production:

```nginx
upstream backend {
    server backend:8080;
}

upstream frontend {
    server frontend:3000;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP zu HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # MinIO (optional, für direkte Datei-Zugriffe)
    location /uploads/ {
        proxy_pass http://minio:9000;
    }
}
```

## Problembehebung

### Logs anzeigen

```bash
# Alle Logs
docker-compose logs -f

# Nur Backend
docker-compose logs -f backend

# Nur Frontend
docker-compose logs -f frontend

# Nur Database
docker-compose logs -f postgres
```

### Services neu starten

```bash
# Alles neu starten
docker-compose restart

# Nur Backend
docker-compose restart backend

# Nur Frontend
docker-compose restart frontend
```

### Daten löschen und neustarten

```bash
# Alle Container und Volumes löschen (WARNUNG: Löscht alle Daten!)
docker-compose down -v

# Alles neu starten
docker-compose up -d
```

### Port-Konflikte

Falls Ports bereits belegt sind, in `docker-compose.yml` ändern:

```yaml
ports:
  - "8080:8080"  # Außen:Innen. 8080 nach 9000 ändern für Außen
```

### Database Connection Error

Falls Backend nicht mit DB verbinden kann:

```bash
# DB Health-Status prüfen
docker-compose ps postgres

# DB Logs anzeigen
docker-compose logs postgres

# DB Container neu starten
docker-compose restart postgres
```

## Performance Tipps

1. **Volumes für Daten verwenden**:
   ```bash
   docker volume ls
   docker volume inspect podcast-service_postgres_data
   ```

2. **Resource Limits setzen** (in docker-compose.yml):
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

3. **Production-Optimierung**:
   - Nur notwendige Dependencies installieren
   - Multi-stage Builds verwenden (bereits implementiert)
   - Security-Scanner nutzen: `docker scan`

## YouTube Integration

Nach erfolgreichem Start:

1. Admin-Panel: http://localhost:3000
2. Episode hochladen
3. Global RSS Feed registrieren bei YouTube: `http://localhost:8080/feeds/all.xml`

## Backup & Restore

### Datenbank Backup

```bash
# Backup erstellen
docker-compose exec postgres pg_dump -U podcast_user podcasts > backup.sql

# Restore
docker-compose exec -T postgres psql -U podcast_user podcasts < backup.sql
```

### MinIO Daten Backup

```bash
# Alle Daten kopieren
docker cp podcast-minio:/minio_data ./minio_backup
```

## Clean Up

```bash
# nur Containers löschen (Daten bleiben)
docker-compose down

# Alles löschen inkl. Volumes (VORSICHT!)
docker-compose down -v

# Alle Images löschen
docker-compose down --rmi all
```

## Weitere Ressourcen

- [Docker Dokumentation](https://docs.docker.com/)
- [Docker Compose Dokumentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [MinIO Docker Image](https://hub.docker.com/r/minio/minio)
