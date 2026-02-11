# Update Guide - v1.1 (Production Ready)

## Was hat sich geändert?

Diese Version vereinfacht das Projekt für Production-Readiness mit optionalen Service-Integration.

### 📝 Summary

| Feature | Vorher | Nachher |
|---------|---------|---------|
| **Default DB** | Komplekt Postgres Anforderung | SQLite (lokal) |
| **Default Storage** | MinIO Anforderung | Lokale Dateien |
| **YouTube** | Core Feature | Entfernt |
| **Dependencies** | Viele optionale | Nur essenzielle |
| **Docker** | Alle Services required | Services optional |
| **Setup Komplexität** | Hoch (Pi nötig) | Minimal (Docker) |

---

## 🔄 Upgrade Schritte

Wenn du ein bestehendes Projekt migrieren möchtest:

### 1. Code aktualisieren

```bash
git pull origin main
npm install  # Dependencies neu installieren
```

### 2. Migration durchführen

**Wenn du SQLite nutzen möchtest (empfohlen):**
```bash
cd backend
npx prisma migrate dev
```

**Wenn du PostgreSQL behältst:**
- .env Datei unverändert lassen
- DATABASE_URL bleibt postgresql://...
- npx prisma migrate deploy
- Fertig!

### 3. Alte Dateien (optional löschen)

Diese Dateien werden nicht mehr verwendet, können aber für Reference behalten bleiben:

```bash
# Optional - YouTube Integration backup
# backend/src/routes/youtube.ts
# backend/src/utils/youtube.ts

# Nicht nötig - aber können gelöscht werden:
# rm backend/src/routes/youtube.ts
# rm backend/src/utils/youtube.ts
```

### 4. Environment updaten

Alte `.env` mit PostgreSQL funktioniert weiterhin!  
Oder zu SQLite wechseln:

```bash
# Alte version
DATABASE_URL=postgresql://user:pw@host:5432/podcasts

# Neue version (optional)
DATABASE_URL=file:./dev.db
```

### 5. Docker aktualisieren

Alter docker-compose.yml:
- ❌ Funktioniert nicht mehr (PostgreSQL + MinIO)

Neue docker-compose.yml:
- ✅ Minimal (nur Backend + Frontend)
- ✅ Kann PostgreSQL + MinIO uncommentieren

**Upgrade:**
```bash
# Alten Container stoppen
docker-compose down

# Neue docker-compose.yml ist im Repo
git pull
docker-compose up -d
```

---

## ✅ Nach dem Upgrade testen

```bash
# 1. Frontend & API sollten funktionieren
curl http://localhost:8080/health
# Output: {"status":"ok",...}

# 2. Episode hochladen
# - Login auf http://localhost:3000
# - Test Episode hochladen
# - Sollte in ./backend/uploads/ landen

# 3. RSS Feed
# - Öffne http://localhost:8080/feeds/all.xml
# - Sollte valides XML sein

# 4. Analytics
# - Dashboard öffnen
# - Sollte Play-Statistiken zeigen
```

---

## ⚠️ Breaking Changes

### YouTube Integration entfernt
- ❌ `/api/youtube/auth` nicht mehr vorhanden
- ❌ YouTube OAuth nicht mehr supportet
- ❌ `YouTubeAccount` Prisma Model gelöscht
- ⚠️ Falls du YouTube brauchst, siehe ARCHITECTURE.md

### Dependencies entfernt
```bash
# Diese sind nicht mehr installiert:
# - ffmpeg-static
# - fluent-ffmpeg
# - googleapis

# Falls du sie brauchst:
npm install ffmpeg-static fluent-ffmpeg
```

### .env hat sich geändert
```bash
# ENTFERNT:
YOUTUBE_API_KEY=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URL=

# Neue defaults:
# S3_ENDPOINT, S3_ACCESS_KEY optional
# DATABASE_URL kann SQLite sein
```

---

## 🚀 Neue Features

### 1. SQLite Default
```bash
# Kein Setup mehr nötig!
npm run dev
# SQLite database wird automatisch erstellt
```

### 2. Lokaler Upload
```bash
# Wenn kein S3_ENDPOINT konfiguriert:
# Dateien gehen in ./backend/uploads/
# Automatischer Fallback!
```

### 3. Optional Services in Docker
```bash
# Vollständig konfigurierbar
# PostgreSQL: uncomment + set DATABASE_URL
# MinIO: uncomment + set S3_* vars
```

### 4. Bessere .docker Beispiele
```bash
# .env.docker.example hat jetzt nur essenzielle Variablen
# Alle optionalen sind commented
```

---

## 📊 Performance

### Vorher (mit Remote Pi)
- Network latency
- Multiple services zu starten
- Komplexes Setup

### Nachher (lokal)
- Keine network latency
- Ein `docker-compose up` reicht
- Production-ready mit Postgres optional

---

## 🆘 Probleme beim Upgrade?

### Migration schlägt fehl
```bash
cd backend
# ORM neu generieren
npx prisma generate

# Fresh migration
npx prisma migrate reset
# ⚠️ Löscht alle Daten! Erst backup!
```

### Alte Docker Container funktionieren nicht
```bash
# Komplett fresh start
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### YouTube Imports fehlen
```bash
# Frontend braucht kein YouTube mehr
# Falls Build-Fehler: Prüfe ob ui noch YouTube Routes verwendet
# src/pages/Upload.tsx sollte schon updated sein
```

### Datenbank Lock Error
```bash
# SQLite hat Lock-Issue
# Gib alle Node Prozesse frei
pkill node
# Dann frisch starten
docker-compose up -d
```

---

## 📚 Verwandte Dokumentation

- [DOCKER-SIMPLE.md](./DOCKER-SIMPLE.md) - Neues Docker Setup
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detaillierte Architektur
- [README.md](./README.md) - Allgemein
- [BACKLOG.md](./BACKLOG.md) - Feature Backlog
