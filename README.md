# 🎧 Podcast-Plattform (2025)

Willkommen zur **Podcast-Plattform** – einem selbst gehosteten System zum **Verwalten,
Hochladen und Hören von Podcasts** mit automatischer **RSS-Feed-Erstellung**.

---

## 🚀 Ziel

Die Plattform ermöglicht:
- 🎙️ **Upload eigener Podcasts**
- 🔗 **Automatisch generierte RSS-Feeds** (kompatibel mit Spotify & Co.)
- 🎧 **Web-Player für Hörer**
- 📊 **Eigene Statistiken (Website-Plays)**
- 🔒 **DSGVO-konformes Tracking ohne externe Dienste**

---

## ⚡ Quick Start (5 Minuten)

<table>
  <tr>
    <th>Platform</th>
    <th>Befehl</th>
  </tr>
  <tr>
    <td>🪟 Windows</td>
    <td><code>deploy.bat</code></td>
  </tr>
  <tr>
    <td>🐧 Linux / 🍎 Mac</td>
    <td><code>chmod +x deploy.sh && ./deploy.sh</code></td>
  </tr>
  <tr>
    <td>📦 Docker (All)</td>
    <td><code>docker-compose up -d</code></td>
  </tr>
</table>

**Danach:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- MinIO: http://localhost:9001

---

| Komponente | Beschreibung |
|-------------|--------------|
| 🖥️ **Frontend (React)** | Vite + React + Tailwind CSS, Darstellung & Upload |
| ⚙️ **Backend (Node.js + TypeScript)** | API, Auth, Feed-Erstellung, Statistik |
| 💾 **Raspberry Pi** | PostgreSQL + MinIO (Datenbank & Audio-Storage) |
| 🗄️ **Datenbank** | PostgreSQL 16, angebunden via Prisma |
| ☁️ **Storage** | MinIO (S3-kompatibel), Speicherung von Audio & Covern |

---

## 🧭 Architekturdiagramm

### Docker Container-Setup (Production)

```
┌─────────────────────────────────────────────────────┐
│           Docker Compose Network                     │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐   ┌──────────────┐                │
│  │  Frontend    │   │  Backend     │                │
│  │  (Nginx)     │──→│  (Node.js)   │                │
│  │  Port 3000   │   │  Port 8080   │                │
│  └──────────────┘   └──────┬───────┘                │
│                             │                        │
│                    ┌────────┴──────────┐             │
│                    ▼                   ▼             │
│            ┌──────────────┐   ┌──────────────┐     │
│            │ PostgreSQL   │   │   MinIO      │     │
│            │  Port 5432   │   │  Port 9000   │     │
│            └──────────────┘   └──────────────┘     │
│                                                       │
└─────────────────────────────────────────────────────┘
         ▲
         │ Persistent Volumes
         │
    ┌────┴─────┐
    │  postgres│  (Database files)
    │   minio  │  (Audio & covers)
    └──────────┘
```

### Data Flow

```
1. User registriert sich → Backend erstellt JWT Token
2. User lädt Audio hoch → Presigned URL von MinIO
3. Audio speichert in S3 (MinIO) → DB-Eintrag erstellt
4. Feed URL generiert → RSS Service liest aus DB
5. Statistik gesammelt → Play-Tracking in DB
```

---

## 🧰 Tech Stack

| Bereich | Technologie |
|----------|-------------|
| Frontend | React, Vite, Tailwind, React Router, Recharts |
| Backend | Node.js, TypeScript, Express, Prisma, Zod |
| Auth | JWT + Argon2 |
| DB | PostgreSQL 16 |
| Storage | MinIO (S3-kompatibel) |
| Container | Docker & Docker Compose |
| Tools | VS Code, Postman, GitHub Projects |

---

## 🧾 Features (MVP)

- [x] Benutzerregistrierung & Login (JWT)
- [x] Podcast-Upload über Browser
- [x] Presigned Uploads → MinIO
- [x] Episodenverwaltung in PostgreSQL
- [x] Automatische RSS-Feeds
- [x] Play-Tracking für Website
- [x] Dashboard mit Statistiken
- [ ] Erweiterung für Mehrnutzer-Feeds *(geplant)*

---

## ⚙️ Setup & Deployment

### 🔹 Voraussetzungen

- **Docker** & **Docker Compose** (v2.0+)
- **Git** für das Projektrepository
- Mindestens **2GB RAM** und **5GB Speicher**
- Port **3000** (Frontend), **8080** (Backend), **5432** (DB), **9000** (Storage) verfügbar

---

### 🔹 Option 1: Docker Deployment (Production Ready) ⭐

Die einfachste und empfohlene Methode für Produktion.

#### 1. Repository klonen

```bash
git clone <your-repo-url>
cd BBS-Podcast-Service
```

#### 2. Umgebungsvariablen konfigurieren

```bash
# Kopiere die Beispielkonfiguration
cp .env.example .env

# Editiere .env mit deinen Werten
nano .env
```

**Wichtigste Variablen:**

```bash
# Sicherheit (MUSS für Production geändert werden!)
JWT_SECRET=your-very-secure-random-string-here
POSTGRES_PASSWORD=your-secure-database-password
MINIO_ROOT_PASSWORD=your-secure-storage-password

# URLs (anpassen für deine Domain/IP)
FRONTEND_URL=http://your-domain.com:3000
S3_ENDPOINT=http://your-domain.com:9000
```

#### 3. Services starten

```bash
# Alle Services im Hintergrund starten
docker-compose up -d

# Logs anschauen
docker-compose logs -f

# Nur bestimmte Services logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### 4. Überprüfung

```bash
# Alle Services prüfen
docker-compose ps

# Port-Überprüfung
curl http://localhost:3000   # Frontend
curl http://localhost:8080   # Backend
curl http://localhost:5432   # PostgreSQL
curl http://localhost:9000   # MinIO
```

#### Services verfügbar nach Start:

| Service | URL | Beschreibung |
|---------|-----|-------------|
| 🖥️ Frontend | http://localhost:3000 | Web-Anwendung |
| ⚙️ Backend API | http://localhost:8080 | REST API |
| 🗄️ PostgreSQL | localhost:5432 | Datenbank |
| ☁️ MinIO Console | http://localhost:9001 | Storage-Management |

#### MinIO Zugriff (für Audio-Dateien):

```
URL: http://localhost:9001
Username: minioadmin
Password: [aus .env: MINIO_ROOT_PASSWORD]
```

#### Datenbank-Zugriff (Prisma Studio):

```bash
# Im Backend-Container
docker-compose exec backend npx prisma studio

# Dann öffne: http://localhost:5555
```

---

### 🔹 Option 2: Lokales Development

Für Entwicklung und Debugging mit live-reload.

#### Raspberry Pi / Remote Datenserver Setup (Optional)

Falls Du PostgreSQL + MinIO remote hosten möchtest:

```bash
# Auf dem Pi
ssh pi@<pi-ip>

# Docker installieren (falls nicht vorhanden)
sudo apt update
sudo apt install docker docker-compose -y

# Nur DB + Storage starten
docker-compose -f docker-compose.db.yml up -d
```

#### Backend lokal entwickeln

```bash
cd backend

# Dependencies installieren
npm install

# Umgebungsvariablen
cp .env.example .env
# .env bearbeiten - auf remote DB zeigen:
# DATABASE_URL=postgresql://user:pass@<pi-ip>:5432/podcasts
# S3_ENDPOINT=http://<pi-ip>:9000

# Development Server
npm run dev
```

**Backend läuft auf:** http://localhost:8080

#### Frontend lokal entwickeln

```bash
cd frontend

# Dependencies installieren
npm install

# Development Server
npm run dev
```

**Frontend läuft auf:** http://localhost:3000 (oder http://localhost:5173)

---

### 🔹 Option 3: Production-Deployment (Cloud/VPS)

Für Deployment auf Heroku, AWS, DigitalOcean, Render etc.

#### Render.com (Recommended für einfaches Hosting)

```bash
# 1. Git Push zu GitHub
git push origin main

# 2. Connect in Render Dashboard
# https://dashboard.render.com/new

# 3. Select "Web Service" + Connect GitHub Repo
# 4. Set Root Directory: backend (oder frontend für Frontend)
# 5. Environment variables setzen
# 6. Deploy!
```

📚 **Ausführliche Anleitung:** Siehe [RENDER-DEPLOYMENT.md](./RENDER-DEPLOYMENT.md)

#### Mit Docker Hub

```bash
# Docker Images pushen
docker login
docker tag podcast-backend:latest <username>/podcast-backend:latest
docker tag podcast-frontend:latest <username>/podcast-frontend:latest

docker push <username>/podcast-backend:latest
docker push <username>/podcast-frontend:latest
```

#### Environment-Variablen setzen

```bash
# Sichere Secrets generieren
openssl rand -base64 32  # Für JWT_SECRET

# In Production setzen
export JWT_SECRET="<generated-value>"
export POSTGRES_PASSWORD="<strong-password>"
export MINIO_ROOT_PASSWORD="<strong-password>"
```

#### Datenbank-Migration

```bash
# Schema auf Production-DB anwenden
docker-compose exec backend npx prisma migrate deploy
```

---

## 🛑 Services beenden / aufräumen

```bash
# Alle Services stoppen (Daten bleiben)
docker-compose stop

# Vollständig entfernen (inkl. Volumes!)
docker-compose down

# Nur spezifischen Service stoppen
docker-compose stop backend

# Logs anschauen
docker-compose logs -f --tail=50 backend
```

---

## 🔧 Troubleshooting

### Port bereits in Benutzung

```bash
# Welcher Prozess nutzt Port 8080?
lsof -i :8080

# Alternative: .env anpassen
COMPOSE_PORT_OVERRIDE_8080=8081
```

### Datenbank-Verbindungsfehler

```bash
# Postgres-Status prüfen
docker-compose exec postgres pg_isready

# Logs prüfen
docker-compose logs postgres
```

### MinIO funktioniert nicht

```bash
# MinIO Health prüfen
curl http://localhost:9000/minio/health/live

# Logs
docker-compose logs minio
```

### Frontend zeigt blank page

```bash
# Backend läuft?
docker-compose logs backend

# CORS korrekt eingestellt?
# Check FRONTEND_URL in .env
```

---

## 📊 Monitoring & Maintenance

### Backup erstellen

```bash
# Database Backup
docker-compose exec postgres pg_dump \
  -U podcast_user -d podcasts > backup_$(date +%Y%m%d).sql

# MinIO Backup (Manual)
# Mount /minio_data volume
```

### Logs analysieren

```bash
# Alle Logs
docker-compose logs

# Nur Fehler
docker-compose logs -f | grep ERROR

# Spezifischer zeitraum
docker-compose logs --since 2025-02-11 --until 2025-02-12
```

### Updates

```bash
# Images neu bauen
docker-compose build --no-cache

# Services aktualisieren
docker-compose up -d
```

---

## 🧩 Nützliche Skripte & Befehle

### Backend

| Befehl                   | Beschreibung                               |
| ------------------------ | ------------------------------------------ |
| `npm run dev`            | Startet Dev-Server mit Hot-Reload          |
| `npm run build`          | Baut TypeScript zu JavaScript              |
| `npm run start`          | Startet Production-Build                   |
| `npm run lint`           | Prüft Code-Stil                            |
| `npx prisma studio`      | Öffnet DB-Management-Interface             |
| `npx prisma migrate dev` | Erstellt & führt Migration aus             |
| `npx prisma db pull`     | Zieht DB-Schema (verify)                   |

### Frontend

| Befehl                   | Beschreibung                               |
| ------------------------ | ------------------------------------------ |
| `npm run dev`            | Startet Vite Dev-Server                    |
| `npm run build`          | Baut Production-Bundle                     |
| `npm run preview`        | Preview des Build                          |
| `npm run lint`           | Prüft Code-Stil                            |
| `npm run format`         | Formatiert Code mit Prettier               |

### Docker & Deployment

| Befehl                                | Beschreibung                               |
| ------------------------------------- | ------------------------------------------ |
| `docker-compose up -d`                | Startet alle Services                      |
| `docker-compose stop`                 | Stoppt alle Services                       |
| `docker-compose logs -f`              | Zeigt Live-Logs aller Services             |
| `docker-compose logs -f backend`      | Zeigt nur Backend-Logs                     |
| `docker-compose ps`                   | Listet alle Containers                     |
| `docker-compose exec backend npm run dev` | Führt Dev-Command im Backend aus      |
| `docker-compose down`                 | Stoppt & entfernt Container                |
| `docker-compose build --no-cache`     | Baut Images neu                            |

---

## ✅ Production Deployment Checklist

Vor der Veröffentlichung abhaken:

- [ ] `.env.example` → `.env` kopiert
- [ ] `JWT_SECRET` mit `openssl rand -base64 32` generiert
- [ ] `POSTGRES_PASSWORD` geändert
- [ ] `MINIO_ROOT_PASSWORD` geändert
- [ ] `FRONTEND_URL` auf richtige Domain gesetzt
- [ ] Alle Services mit `docker-compose ps` geprüft
- [ ] Database-Migration lief erfolgreich ab
- [ ] Both Frontend & Backend erreichbar
- [ ] MinIO Bucket existiert (`podcasts`)
- [ ] Firewall Port 3000, 8080 freigegeben
- [ ] SSL/HTTPS eingerichtet (Reverse Proxy/Let's Encrypt)
- [ ] Backup-Strategie definiert
- [ ] Monitoring eingerichtet (optional)

---

## 🧪 Tests

* Postman Collection: `tests/postman_collection.json`
* Manuelle Tests: Upload, Feed, Login
* `npm run lint` → Code-Style prüfen

---

## 📚 Projektorganisation

| Datei/Ordner    | Zweck                                           |
| --------------- | ----------------------------------------------- |
| `README.md`     | Projektbeschreibung & Setup (dieses Dokument)  |
| `DEPLOYMENT-CHECKLIST.md` | Vor-Deployment-Checkliste mit allen Schritten |
| `DOCKER-DEPLOYMENT.md` | Erweiterte Docker Deployment Guide       |
| `RENDER-DEPLOYMENT.md` | Render.com Deployment Guide              |
| `TROUBLESHOOTING.md` | Häufige Probleme & Lösungen                   |
| `BACKLOG.md`    | Vollständige Aufgabenliste & Akzeptanzkriterien |
| `TEAM_GUIDE.md` | Phasenleitfaden für Entwicklerteam              |
| `deploy.sh`     | Automatisiertes Deployment Script (Linux/Mac)  |
| `deploy.bat`    | Automatisiertes Deployment Script (Windows)    |
| `.env.example`  | Environment Variable Template                  |
| `docker-compose.yml` | Production-ready Docker Compose Setup      |
| `/backend/`     | Node.js API                                     |
| `/frontend/`    | React Web App                                   |
| `/tests/`       | Test-Suite & Postman Collection                |

---

## 👥 Entwicklerteam

* 4 Entwickler, gemeinsamer Fullstack-Fokus
* Raspberry Pi wird von einer Person verwaltet
* Keine festen Rollen: Jeder kann Frontend, Backend oder API entwickeln
* Pull-Prinzip: Jeder nimmt sich Aufgaben aus dem [Backlog](./BACKLOG.md)

---

## 🧭 Empfohlene Reihenfolge (Kurzüberblick)

1️⃣ Projektstruktur & GitHub Setup
2️⃣ Raspberry Pi Datenserver (Postgres + MinIO)
3️⃣ Backend (Prisma, Auth, Upload, Feed)
4️⃣ Frontend (Login, Upload, Dashboard)
5️⃣ Statistik & Feinschliff
6️⃣ Tests & Doku

---

## 💬 Mitmachen / Workflow

```bash
# Neuen Branch erstellen
git checkout -b feature/<beschreibung>

# Änderungen committen
git add .
git commit -m "Implementiere Feature XYZ"

# PR öffnen
git push origin feature/<beschreibung>
```

**Branch-Regeln:**

* `main` → stabil
* `dev` → Integration
* `feature/*` → neue Features
* `fix/*` → Bugfixes

---

## 🧾 Lizenz

MIT License © 2025 – Podcast-Plattform-Team

---

> 📌 Weitere Infos:
>
> * Deployment Checklist: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - Komplette Vor-Deployment Checkliste
> * Vollständiges Aufgaben-Backlog: [BACKLOG.md](./BACKLOG.md)
> * Entwicklerleitfaden: [TEAM_GUIDE.md](./TEAM_GUIDE.md)
> * Troubleshooting: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

