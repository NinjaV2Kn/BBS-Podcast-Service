# 🛠️ Architektur & Cleanup Referenz

## Was wurde entfernt/vereinfacht

Diese Dokumentation erklärt die Minimalisierung des Projekts für Production-Readiness.

---

## ❌ Gelöschte/Deaktivierte Features

### 1. YouTube Integration
**Status:** Entfernt aus Core  
**Grund:** Optional, komplex, nur mit API Key brauchbar  
**Dateien (existieren noch, aber nicht verwendet):**
- `backend/src/routes/youtube.ts` - YouTube OAuth Endpoints
- `backend/src/utils/youtube.ts` - ffmpeg video conversion
- `backend/src/middleware/auth.ts` - HAT YouTube Checks (entfernt)
- Prisma `YouTubeAccount` Model - Entfernt

**Falls nötig später, könnten diese wieder aktiviert werden:**
```bash
git log --oneline | grep youtube
git show <commit-hash>  # Letzte YouTube Implementation
```

### 2. Dependencies entfernt
- `ffmpeg-static` - Nicht mehr nötig
- `fluent-ffmpeg` - Nicht mehr nötig
- `googleapis` - Nicht mehr nötig  
- `@types/fluent-ffmpeg` - Nicht mehr nötig

```bash
npm install # Nach Änderungen package.json
```

---

## ✅ Vereinfachte Architektur

### Minimaler Stack (jetzt default)

```
Frontend (React/Vite)
    ↓ HTTP
Backend (Express/TS)
    ├─ SQLite (default)
    └─ Local Storage (default)
```

### Produktiver Stack (optional)

```
Frontend (React/Vite)
    ↓ HTTP
Backend (Express/TS)
    ├─ PostgreSQL (optional)
    ├─ MinIO/S3 (optional)
    └─ Local Storage (fallback)
```

---

## 🔄 Optionale Services

### PostgreSQL
**Aktivieren in docker-compose.yml:**
```yaml
postgres:
  # Uncomment all lines
```

**Dann in backend environment:**
```yaml
DATABASE_URL: postgresql://user:pw@postgres:5432/podcasts
```

**Migration beim Start automatisch!**

### MinIO S3
**Aktivieren in docker-compose.yml:**
```yaml
minio:
  # Uncomment all lines
```

**Dann in backend environment:**
```yaml
S3_ENDPOINT: http://minio:9000
S3_ACCESS_KEY: minioadmin
S3_SECRET_KEY: password
S3_BUCKET_PODCASTS: podcasts
```

**Buckets müssen manuell erstellt werden!**

---

## 📊 Prisma Schema Änderungen

### Removed Models:
```prisma
// ENTFERNT - war für YouTube User Accounts
model YouTubeAccount {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(...)
  channelId       String    @unique
  accessToken     String
  // ...
}
```

### Simplified Models:
```prisma
// VORHER:
model Episode {
  youtubeVideoId String?  // ENTFERNT
  // ...
}

// JETZT:
model Episode {
  title       String      // Nur essenzielle Felder
  description String?
  audioUrl    String      // S3 oder local
  // ...
}
```

---

## 🗄️ Datenbank Kompatibilität

### SQLite (default)
- ✅ Zero Setup
- ✅ Perfekt für Development & Small Deployments
- ❌ Nur single-process
- ❌ Fallback auf file:./dev.db

### PostgreSQL (optional)
- ✅ Multi-process ready
- ✅ Volltext-Suche möglich
- ✅ Bessere Concurrency
- ❌ Extra Docker Service nötig

**Prisma** wechselt automatisch zwischen SQLite & PostgreSQL basierend auf `DATABASE_URL`!

---

## 💾 Storage Optionen

### Local Storage (default)
```
Backend Ordner: ./uploads/
Zugenaesslich: http://localhost:8080/uploads/file/...
Pro: Zero Setup, schnell für Development
Cons: Single-server only
```

### MinIO S3 (optional)
```
Bucket: minio/podcasts
Accesskey: api/minio/presigned-urls
Pro: Multi-server, skalierbar, Cloud-Ready
Cons: Extra Service
```

**Fallback:** Wenn S3_ENDPOINT nicht konfiguriert, verwendet Backend automatisch local Storage!

---

## ✅ Essenzielle Features (behalten)

- ✅ Authentication (JWT + Argon2)
- ✅ Episode Upload & Management
- ✅ Podcast CRUD
- ✅ RSS Feed Generation (static & dynamic)
- ✅ Play Tracking (GDPR-compliant)
- ✅ Analytics Dashboard
- ✅ CORS & Security (helmet)

---

## 🚀 Deployment Szenarien

### 1. Minimal (Laptop/Small Server)
```bash
docker-compose up -d
# SQLite + local uploads
# Perfect for: Hobby projects, Testing
```

### 2. Production (Single Server)
```bash
# Uncomment PostgreSQL + MinIO in docker-compose.yml
docker-compose up -d
# Perfect for: Small teams, Self-hosted
```

### 3. Cloud (Managed Services)
```bash
docker-compose.yml:
  - Remove postgres & minio
  
Set environment:
  - DATABASE_URL=managed-postgres-cloud-uri
  - S3_ENDPOINT=aws-s3-or-azure-blob
  
# Perfect for: Scalability, AWS/Azure/DO
```

---

## 📝 Checkliste für Production

- [ ] JWT_SECRET changed (not default)
- [ ] DATABASE_URL configured (or PostgreSQL uncommented)
- [ ] S3_* configured (or local uploads tested)
- [ ] FRONTEND_URL set to production domain
- [ ] Logs monitored regularly
- [ ] Backups scheduled (if PostgreSQL)
- [ ] HTTPS/SSL configured (reverse proxy)
- [ ] Rate limiting considered
- [ ] CORS origins restricted

---

## 🔍 Archiv: Features für später

Falls man YouTube später wieder braucht:

```bash
# Branch mit YouTube code erstellen
git checkout -b feature/youtube-integration

# Original Implementation anschauen
git log --grep="youtube" --oneline
git show <commit>

# oder: utils/youtube.ts als referenz behalten
# Es ist noch vorhanden aber nicht verwendet
```

---

## 📚 Weitere Ressourcen

- [DOCKER-SIMPLE.md](./DOCKER-SIMPLE.md) - Docker Setup
- [README.md](./README.md) - Main Dokumentation
- [BACKLOG.md](./BACKLOG.md) - Feature Backlog
- [Prisma Docs](https://www.prisma.io/docs/) - Database ORM
