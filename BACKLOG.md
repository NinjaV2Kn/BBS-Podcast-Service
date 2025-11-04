# 🎧 Podcast-Plattform – Detailliertes Kanban-Backlog (Pi = Datenserver, lokal = Backend + Frontend)

Dieses Backlog beschreibt alle Aufgaben zur Erstellung der Podcast-Plattform mit klaren Checklisten („Definition of Done“).
Die Architektur:  
- **Raspberry Pi:** PostgreSQL + MinIO (Daten & Audio)  
- **Lokal (PC):** Backend (Node/TS) + Frontend (React/Vite)

---

## 🟥 Projektstart & Repository

### 🎫 GitHub-Repository erstellen
**Beschreibung:** Neues GitHub-Repo für das Projekt anlegen.
**Checkliste:**
- [ ] Neues Repo auf GitHub erstellt
- [ ] Lokales Repo initialisiert mit `git init`
- [ ] `.gitignore` hinzugefügt (Node, dist, .env etc.)
- [ ] Erster Commit & Push erfolgreich

### 🎫 Projektstruktur anlegen
**Beschreibung:** Grundstruktur für Backend, Frontend und gemeinsame Dateien erstellen.
**Checkliste:**
- [ ] Ordner `backend/`, `frontend/`, `docker/` angelegt
- [ ] Leere `README.md` im Root
- [ ] `.env.example` im Root vorhanden

### 🎫 README schreiben
**Beschreibung:** Kurze Projekterklärung mit Setup-Schritten.
**Checkliste:**
- [ ] Ziel & Komponenten beschrieben
- [ ] Setup-Anleitung mit Befehlen (`docker compose up`, `npm run dev`)
- [ ] Ports dokumentiert (8080, 3000, 5432, 9000/9001)
- [ ] Hinweis: DB/Storage laufen auf Raspberry Pi

---

## 🟥 Raspberry Pi – Daten- & Storage-Server

### 🎫 Pi-Netzwerk vorbereiten
**Beschreibung:** Raspberry Pi erhält statische IP & SSH-Zugriff.
**Checkliste:**
- [ ] SSH aktiviert (`raspi-config`)
- [ ] Statische IP (z. B. `192.168.0.50`) eingerichtet
- [ ] Verbindung per Ping & SSH getestet

### 🎫 Docker auf Raspberry Pi installieren
**Beschreibung:** Docker & Compose auf Pi einrichten.
**Checkliste:**
- [ ] `sudo apt install docker docker-compose`
- [ ] `docker --version` und `docker compose version` erfolgreich
- [ ] User zu `docker`-Gruppe hinzugefügt

### 🎫 Docker-Compose für Datenserver erstellen
**Beschreibung:** Compose-Setup nur für PostgreSQL und MinIO.
**Checkliste:**
- [ ] Container: `postgres:16`, `minio/minio:latest`
- [ ] Ports 5432, 9000, 9001 gemappt
- [ ] Volumes: `/mnt/poddata/db` & `/mnt/poddata/minio`
- [ ] ENV-Variablen in `.env` gespeichert
- [ ] `docker compose up -d` läuft fehlerfrei

### 🎫 MinIO konfigurieren
**Beschreibung:** S3-kompatibles Storage-System auf Pi einrichten.
**Checkliste:**
- [ ] MinIO-UI erreichbar (`http://<pi-ip>:9001`)
- [ ] Login mit `admin/adminadmin` funktioniert
- [ ] Buckets `podcasts` & `covers` erstellt
- [ ] Zugriff per Browser & SDK getestet

### 🎫 PostgreSQL konfigurieren
**Beschreibung:** Datenbank für Podcasts einrichten.
**Checkliste:**
- [ ] DB läuft auf Port 5432
- [ ] User / Passwort aus `.env`
- [ ] Verbindung vom lokalen Rechner aus funktioniert (`psql`)
- [ ] Backup-Ordner `/mnt/poddata/db-backup` angelegt

### 🎫 Firewall & Zugriffsschutz
**Beschreibung:** Pi gegen externe Zugriffe absichern.
**Checkliste:**
- [ ] Nur Ports 5432, 9000, 9001 geöffnet
- [ ] Optional: Zugriff nur aus lokalem Netz erlaubt
- [ ] SSH mit Key-Auth abgesichert
- [ ] Fail2Ban oder ufw aktiviert

### 🎫 Backup-Strategie (Pi-Daten)
**Beschreibung:** Regelmäßige Sicherung von DB + MinIO.
**Checkliste:**
- [ ] Täglicher `pg_dump`-Cronjob
- [ ] MinIO-Sync auf externe HDD oder NAS
- [ ] Test-Restore erfolgreich durchgeführt

---

## 🟥 Backend (lokal)

### 🎫 TypeScript-Backend initialisieren
**Beschreibung:** Node.js-Projekt mit Express, TypeScript, Prisma.
**Checkliste:**
- [ ] `npm init` und Abhängigkeiten installiert
- [ ] `tsconfig.json` erstellt
- [ ] `src/index.ts` mit Basis-Server
- [ ] Server läuft lokal auf 8080

### 🎫 .env für Remote-Verbindung
**Beschreibung:** Backend mit externer DB & MinIO verbinden.
**Checkliste:**
- [ ] `DATABASE_URL=postgresql://...@<pi-ip>:5432/podcasts`
- [ ] `S3_ENDPOINT=http://<pi-ip>:9000`
- [ ] Verbindung getestet (`npx prisma db pull`)
- [ ] Upload-Test mit MinIO erfolgreich

### 🎫 Prisma Schema & Migration
**Beschreibung:** Datenbankstruktur über Prisma definieren.
**Checkliste:**
- [ ] `schema.prisma` mit Models (User, Podcast, Episode, Play)
- [ ] `npx prisma migrate dev` erfolgreich
- [ ] Tabellen auf Pi-DB sichtbar

### 🎫 Authentifizierung (Signup/Login)
**Beschreibung:** JWT-basiertes Auth-System.
**Checkliste:**
- [ ] `/auth/signup` erstellt Benutzer
- [ ] `/auth/login` liefert JWT
- [ ] Passwörter mit Argon2 gehasht
- [ ] Middleware `auth()` prüft Token

### 🎫 Upload-Presign Endpoint
**Beschreibung:** Presigned URL für Audio-Uploads auf Pi-MinIO.
**Checkliste:**
- [ ] Route `/uploads/presign` mit Auth-Check
- [ ] MinIO-SDK generiert URL
- [ ] Test-Upload aus Postman erfolgreich

### 🎫 Episode-API
**Beschreibung:** Endpoint zum Registrieren neuer Episoden.
**Checkliste:**
- [ ] POST `/episodes` speichert Titel + AudioURL
- [ ] Validierung mit Zod
- [ ] Zugriff nur mit gültigem JWT

### 🎫 RSS-Feed-Generator
**Beschreibung:** Feed aus Episoden generieren.
**Checkliste:**
- [ ] `/feeds/:slug.xml` vorhanden
- [ ] Feed validiert erfolgreich
- [ ] URLs zeigen auf Pi-MinIO Audio-Dateien

### 🎫 Play-Tracking
**Beschreibung:** Plays auf Website zählen.
**Checkliste:**
- [ ] `/play/:episodeId` zählt Plays mit IP-Hash
- [ ] Redirect zum Audio funktioniert
- [ ] Nur Website-Referer wird akzeptiert

### 🎫 Dashboard-API
**Beschreibung:** Statistikdaten bereitstellen.
**Checkliste:**
- [ ] `/api/dashboard/overview` liefert Total Plays & Top-Episoden
- [ ] Daten aus `plays`-Tabelle aggregiert
- [ ] Antwort < 100 ms

---

## 🟧 Frontend (lokal)

### 🎫 React-App initialisieren
**Beschreibung:** Vite + React + TypeScript-Setup starten.
**Checkliste:**
- [ ] Projekt mit `npm create vite@latest`
- [ ] Tailwind installiert
- [ ] React Router eingerichtet
- [ ] App läuft auf Port 3000

### 🎫 Layout & Navigation
**Beschreibung:** Grundlayout mit Header & Routen.
**Checkliste:**
- [ ] Header mit Links zu Dashboard & Upload
- [ ] Routen: `/`, `/upload`, `/episodes/:id`, `/feeds/:slug`
- [ ] Responsive Design mit Tailwind

### 🎫 Auth-UI
**Beschreibung:** Login / Signup-Formulare.
**Checkliste:**
- [ ] `/login` & `/signup` Seiten erstellt
- [ ] Token im `localStorage` gespeichert
- [ ] Zugriff nur mit Token möglich
- [ ] Logout entfernt Token

### 🎫 Upload-Formular
**Beschreibung:** Frontend-Komponente für Episoden-Uploads.
**Checkliste:**
- [ ] Datei auswählen
- [ ] `/uploads/presign` aufrufen
- [ ] Upload an MinIO-URL
- [ ] Episode in DB registrieren

### 🎫 Dashboard-Frontend
**Beschreibung:** Statistiken visuell darstellen.
**Checkliste:**
- [ ] Abfrage `/api/dashboard/overview`
- [ ] Anzeige Total Plays, Top-Episoden
- [ ] Diagramm für 30 Tage mit Recharts

### 🎫 Feed-Preview
**Beschreibung:** RSS-Feed-Link anzeigen.
**Checkliste:**
- [ ] Seite `/feeds/:slug` erstellt
- [ ] Link öffnet XML-Feed im Browser

---

## 🧰 Doku & Qualität

### 🎫 Postman-Tests
**Beschreibung:** Test-Sammlung für alle API-Routen.
**Checkliste:**
- [ ] Signup/Login getestet
- [ ] Presign + Upload getestet
- [ ] Feed & Dashboard getestet
- [ ] Alle Requests liefern 2xx Status

### 🎫 Developer-README erweitern
**Beschreibung:** Lokale Setup-Anleitung für Devs.
**Checkliste:**
- [ ] Schritte für Pi-Setup dokumentiert
- [ ] Lokale ENV-Beispiele enthalten
- [ ] Troubleshooting-Hinweise (Ports, Pfade)

### 🎫 Code-Cleanup & Linting
**Beschreibung:** Einheitlicher Stil & Sauberkeit.
**Checkliste:**
- [ ] ESLint + Prettier eingerichtet
- [ ] Keine Lint-Errors
- [ ] `npm run format` verfügbar

---

## ✅ MVP-Fertig, wenn
- [ ] Benutzer kann sich registrieren & anmelden
- [ ] Podcast + Episode erstellen
- [ ] Datei-Upload funktioniert (Pi Storage)
- [ ] RSS-Feed erreichbar & gültig
- [ ] Plays gezählt & Dashboard zeigt Statistik
- [ ] Alles läuft lokal mit Pi als Datenserver
