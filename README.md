```markdown
# 🎧 Podcast-Plattform (2025)

Willkommen zur **Podcast-Plattform** – einem selbst gehosteten System zum **Verwalten, Hochladen und Hören von Podcasts** mit automatischer **RSS-Feed-Erstellung**.

---

## 🚀 Ziel

Die Plattform ermöglicht:
- 🎙️ **Upload eigener Podcasts**
- 🔗 **Automatisch generierte RSS-Feeds** (kompatibel mit Spotify & Co.)
- 🎧 **Web-Player für Hörer**
- 📊 **Eigene Statistiken (Website-Plays)**
- 🔒 **DSGVO-konformes Tracking ohne externe Dienste**

---

## 🧱 Architekturüberblick

| Komponente | Beschreibung |
|-------------|--------------|
| 🖥️ **Frontend (React)** | Vite + React + Tailwind CSS, Darstellung & Upload |
| ⚙️ **Backend (Node.js + TypeScript)** | API, Auth, Feed-Erstellung, Statistik |
| 💾 **Raspberry Pi** | PostgreSQL + MinIO (Datenbank & Audio-Storage) |
| 🗄️ **Datenbank** | PostgreSQL 16, angebunden via Prisma |
| ☁️ **Storage** | MinIO (S3-kompatibel), Speicherung von Audio & Covern |

---

## 🧭 Architekturdiagramm

```

Frontend (React)
↓ Fetch API
Backend (Express + TS)
↓ Prisma ORM
PostgreSQL (Pi)
↳ Datenhaltung
↓ MinIO SDK
MinIO (Pi)
↳ Audio-Uploads & RSS-Dateien

````

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

## ⚙️ Setup

### 🔹 Voraussetzungen

- Node.js 20+
- Docker & Docker Compose
- Raspberry Pi (mit Docker installiert)
- Zugriff auf LAN / feste IP des Pi

---

### 🔹 Raspberry Pi Setup

1. SSH auf den Pi
2. Docker installieren  
   ```bash
   sudo apt update && sudo apt install docker docker-compose -y
````

3. In `docker-compose.yml`:

   ```yaml
   services:
     postgres:
       image: postgres:16
       ports:
         - "5432:5432"
       volumes:
         - /mnt/poddata/db:/var/lib/postgresql/data
     minio:
       image: minio/minio
       ports:
         - "9000:9000"
         - "9001:9001"
       command: server /data --console-address ":9001"
       volumes:
         - /mnt/poddata/minio:/data
   ```
4. Starten:

   ```bash
   docker compose up -d
   ```

---

### 🔹 Lokales Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# .env anpassen:
# DATABASE_URL=postgresql://user:pass@<pi-ip>:5432/podcasts
# S3_ENDPOINT=http://<pi-ip>:9000
npm run dev
```

**Start:** [http://localhost:8080](http://localhost:8080)

---

### 🔹 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Start:** [http://localhost:3000](http://localhost:3000)

---

## 🧩 Nützliche Skripte

| Befehl                   | Beschreibung                               |
| ------------------------ | ------------------------------------------ |
| `npm run dev`            | Startet Dev-Server (Backend oder Frontend) |
| `npm run build`          | Baut Produktionsversion                    |
| `npx prisma studio`      | Öffnet DB-Interface                        |
| `npx prisma migrate dev` | Führt DB-Migration aus                     |

---

## 🧪 Tests

* Postman Collection: `tests/postman_collection.json`
* Manuelle Tests: Upload, Feed, Login
* `npm run lint` → Code-Style prüfen

---

## 📚 Projektorganisation

| Datei           | Zweck                                           |
| --------------- | ----------------------------------------------- |
| `BACKLOG.md`    | Vollständige Aufgabenliste & Akzeptanzkriterien |
| `TEAM_GUIDE.md` | Phasenleitfaden für Entwicklerteam              |
| `README.md`     | Projektbeschreibung & Setup                     |
| `/backend/`     | Node.js API                                     |
| `/frontend/`    | React Webapp                                    |
| `/docker/`      | Compose- und Umgebungsdateien                   |

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
> * Vollständiges Aufgaben-Backlog: [BACKLOG.md](./BACKLOG.md)
> * Entwicklerleitfaden: [TEAM_GUIDE.md](./TEAM_GUIDE.md)

```

---

Möchtest du, dass ich dir das als **`README.md`-Datei** speichere (neben deinem `BACKLOG.md`) und dir den Download-Link gebe?
```
