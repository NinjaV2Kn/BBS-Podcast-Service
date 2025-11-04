# 🧭 **Leitfaden für das 4er-Team – Podcast-Plattform (mit Raspberry als Datenserver)**

---

## ⚙️ **Phase 1 – Projekt-Setup & Grundlagen (alle gemeinsam)**

**Ziel:** Alle können entwickeln, Pushen, Builden und gemeinsam testen.
🕓 *Dauer:* 1–2 Tage

**Reihenfolge & Aufgaben:**

1. 🟢 GitHub-Repository erstellen
2. 🟢 Projektstruktur anlegen (`backend/`, `frontend/`, `docker/`)
3. 🟢 `.gitignore` & `.env.example` erstellen
4. 🟢 README mit Grundstruktur anlegen
5. 🟢 Branch-Regeln vereinbaren (`main`, `dev`, `feature/*`)

💡 **Parallel möglich:**

* Einer richtet Repo & Struktur ein,
* die anderen machen schon lokale Node-/Vite-Setups und testen Builds.

📦 **Done, wenn:**

* Alle können `git clone` machen, lokal starten und in eigenen Branches arbeiten.

---

## 💾 **Phase 2 – Raspberry Pi Daten-Server (1 Person, aber Team-unabhängig)**

**Ziel:** Der Pi steht als externe Datenbank + Storage zur Verfügung.
🕓 *Dauer:* 2–3 Tage

**Wichtig:** Diese Phase blockiert keine anderen!
Alle anderen können lokal weiterarbeiten, aber echte Verbindungen testen erst, wenn der Pi steht.

**Aufgaben (1 Dev):**

* Raspberry vorbereiten (statische IP, SSH)
* Docker & Compose installieren
* Postgres + MinIO-Container starten
* Ports: 5432, 9000, 9001
* Buckets `podcasts`, `covers` erstellen
* Firewall absichern
* Optional: Backup-Skript (`pg_dump`)

💡 **Ergebnis:**
`postgresql://<pi-ip>:5432/podcasts`
`http://<pi-ip>:9000` → erreichbar

---

## 🧱 **Phase 3 – Backend-Basis (Teamarbeit)**

**Ziel:** Lokales Backend läuft mit Verbindung zum Pi.
🕓 *Dauer:* 3 Tage

**Empfohlene Reihenfolge:**

1. **Backend-Init:** `npm init`, Express, TypeScript, Prisma, CORS, Helmet
2. **Verbindung testen:** `.env` mit Pi-IP eintragen, Prisma `migrate dev`
3. **Logging:** pino einbauen
4. **Healthcheck-Route:** `GET /health` (prüft DB & Storage)

💡 **Parallel möglich:**

* Einer richtet Prisma ein
* Einer testet MinIO-Upload
* Einer schreibt `logger.ts` und Middleware

📦 **Done, wenn:**

* Server läuft auf Port 8080
* DB & MinIO vom Pi erreichbar

---

## 🔐 **Phase 4 – Authentifizierung (Teamarbeit)**

**Ziel:** Registrierung & Login mit JWT.
🕓 *Dauer:* 2–3 Tage

**Empfohlene Reihenfolge:**

1. `/auth/signup` & `/auth/login` implementieren
2. Passwort-Hashing mit Argon2
3. Token-Erstellung (JWT) + Middleware
4. Test mit Postman
5. React-Formulare (Login & Signup)

💡 **Parallel möglich:**

* 1 Person Backend-Auth
* 1 Person Frontend-Login
* 1 Person Postman-Tests
* 1 Person Token-Middleware + Guard

📦 **Done, wenn:**

* Login/Signup funktioniert & Token in `localStorage` landet

---

## 🎙️ **Phase 5 – Uploads & Podcasts**

**Ziel:** Dateien hochladen, Episoden registrieren, Feeds erstellen.
🕓 *Dauer:* 4–5 Tage

**Empfohlene Reihenfolge:**

1. `/uploads/presign` → Presigned URLs erstellen
2. Datei-Upload aus Browser → MinIO
3. `/episodes` API → Episode registrieren
4. `/podcasts` CRUD → Podcast-Metadaten
5. `/feeds/:slug.xml` → Feed generieren
6. React Upload-Form + Episode-Form bauen

💡 **Parallel möglich:**

* Backend-Upload & Episode-API
* Frontend-Formulare
* Einer validiert RSS mit einem Feed-Validator

📦 **Done, wenn:**

* Datei wird hochgeladen, Feed funktioniert in Spotify/Podcast-Reader

---

## 📊 **Phase 6 – Statistik & Dashboard**

**Ziel:** Plays zählen & visuell darstellen.
🕓 *Dauer:* 3–4 Tage

**Empfohlene Reihenfolge:**

1. `/play/:episodeId` → Plays loggen
2. IP + UA Hash speichern
3. `/api/dashboard/overview` → Aggregation
4. Dashboard in React mit Recharts

💡 **Parallel möglich:**

* Einer kümmert sich um Backend-Aggregation
* Einer macht Recharts-Dashboard
* Einer designt Tabellen (Top-Episoden)

📦 **Done, wenn:**

* Website-Plays gezählt & im Dashboard angezeigt werden

---

## 🧪 **Phase 7 – Testing & Stabilisierung**

**Ziel:** Alles ist getestet, formatiert & dokumentiert.
🕓 *Dauer:* 2 Tage

**Aufgaben:**

* Postman-Test-Collection (Auth, Upload, Feed, Play, Dashboard)
* ESLint + Prettier prüfen
* Developer-README erweitern (Setup, ENV, Ports, Troubleshooting)
* `.env.example` aktualisieren

💡 **Parallel möglich:**
Jeder testet den Teil, den er implementiert hat → Ergebnisse zusammenführen.

📦 **Done, wenn:**

* Alle Tests bestehen
* Codebase sauber & dokumentiert

---

## 🚀 **Phase 8 – MVP Review**

**Ziel:** Alles einmal vollständig durchtesten & präsentieren.
🕓 *Dauer:* 1–2 Tage

**Checkliste:**

* [ ] User kann sich registrieren & einloggen
* [ ] Podcast & Episode erstellen
* [ ] Audio-Upload funktioniert
* [ ] RSS-Feed erreichbar & valide
* [ ] Plays gezählt
* [ ] Dashboard zeigt Daten
* [ ] Pi-Daten persistent

💡 *Ergebnis:* Fertiges MVP – vollständig funktional, stabil und getestet.

---

## 🔁 **Team-Empfehlungen für gleichzeitige Arbeit**

| Bereich         | Wann anfangen     | Parallele Arbeiten              |
| --------------- | ----------------- | ------------------------------- |
| Repo / Struktur | Sofort            | Alle                            |
| Raspberry Setup | Früh (unabhängig) | Backend/Frontend parallel       |
| Backend Core    | Nach Pi Setup     | Parallel mit Frontend           |
| Auth            | Nach Backend Core | Voll parallel                   |
| Uploads / Feeds | Nach Auth         | Parallel: Upload (Backend) + UI |
| Dashboard       | Nach Plays API    | Parallel: API + Charts          |
| Tests / Doku    | Am Ende           | Alle gemeinsam                  |

---

## 💡 **Optionaler Workflow-Tipp für 4er-Team**

➡️ Nutzt GitHub Projects (Kanban):
Spalten: `To Do` → `In Progress` → `Review` → `Done`
Jeder zieht sich Tickets aus `To Do` nach Lust & Interesse.

➡️ Code Review Pflicht bei allen PRs außer Hotfixes.
➡️ Branch-Namen:

* `feature/auth-api`
* `feature/react-dashboard`
* `fix/upload-bug`
