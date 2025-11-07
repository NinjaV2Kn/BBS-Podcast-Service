# Podcast-Plattform AI Coding Guide

## Project Overview
Self-hosted podcast platform with automatic RSS feed generation. **Architecture**: Frontend (React/Vite) + Backend (Node.js/TypeScript) run locally, while PostgreSQL + MinIO run on a Raspberry Pi data server accessed over LAN.

## Critical Architecture Decisions

### Three-Tier Split Infrastructure
- **Local Development**: `backend/` (Express + TypeScript on port 8080) and `frontend/` (React/Vite on port 3000)
- **Remote Data Server (Raspberry Pi)**: PostgreSQL (port 5432) + MinIO S3-compatible storage (ports 9000/9001)
- **Why**: Team's Pi serves as shared data layer; devs run apps locally but connect to remote DB/storage via IP

### Environment Configuration Pattern
All `.env` files **must** use Pi's LAN IP for database and storage connections:
```bash
DATABASE_URL=postgresql://user:pass@<pi-ip>:5432/podcasts
S3_ENDPOINT=http://<pi-ip>:9000
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
JWT_SECRET=...
```

Never use `localhost` for DB/storage - they're always remote. Backend API runs on localhost:8080.

## Tech Stack & Key Dependencies

### Backend (Node.js + TypeScript)
- **ORM**: Prisma (models: User, Podcast, Episode, Play)
- **Auth**: JWT tokens + Argon2 password hashing
- **Validation**: Zod schemas for request validation
- **Storage**: MinIO SDK for presigned upload URLs
- **Logging**: pino (planned)
- **Security**: helmet, CORS configured for local frontend

### Frontend (React + Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router (routes: `/`, `/upload`, `/episodes/:id`, `/feeds/:slug`)
- **Charts**: Recharts for dashboard analytics
- **State**: JWT token stored in `localStorage`

### Database (PostgreSQL 16)
Accessed via Prisma. Core models:
- `User` (auth with Argon2 hashes)
- `Podcast` (metadata, slug for RSS)
- `Episode` (title, audioUrl points to MinIO)
- `Play` (tracking with IP hash + user-agent, website-only referer check)

## Critical Workflows

### File Upload Flow (Presigned URLs)
1. Frontend requests presigned URL from `POST /uploads/presign` (authenticated)
2. Backend generates MinIO presigned URL with expiration
3. Frontend uploads directly to MinIO using presigned URL (bypass backend)
4. Frontend calls `POST /episodes` to register episode with MinIO object URL
5. **Never** upload audio through backend - always use presigned URLs to Pi

### RSS Feed Generation
- Endpoint: `GET /feeds/:slug.xml`
- Dynamically generates RSS XML from podcast episodes
- Audio `<enclosure>` URLs point directly to MinIO on Pi (e.g., `http://<pi-ip>:9000/podcasts/audio.mp3`)
- Must validate with RSS validator for Spotify/podcast app compatibility

### Play Tracking (GDPR-Compliant)
- Endpoint: `GET /play/:episodeId` redirects to audio after logging
- Store **IP hash + user-agent hash** only (no raw IPs)
- Referer header check: only count plays from website, not external apps
- Aggregate stats via `GET /api/dashboard/overview`

## Development Commands

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Edit with Pi IP!
npx prisma migrate dev  # Applies migrations to remote Pi DB
npm run dev  # Starts on localhost:8080
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Starts on localhost:3000
```

### Prisma Commands (Always Target Pi DB)
```bash
npx prisma studio        # Browse remote Pi database
npx prisma migrate dev   # Create/apply migrations
npx prisma db pull       # Pull schema from Pi (verification)
```

### Docker (Raspberry Pi Only)
```bash
docker compose up -d  # Start PostgreSQL + MinIO on Pi
```
Volumes: `/mnt/poddata/db` (Postgres), `/mnt/poddata/minio` (S3 storage)

## Project-Specific Conventions

### Branch Strategy (4-Person Team)
- `main` - stable production code
- `dev` - integration branch
- `feature/*` - new features (e.g., `feature/auth-api`)
- `fix/*` - bugfixes

Pull-based workflow: developers pick tasks from `BACKLOG.md`, no fixed roles.

### API Route Patterns
- `/auth/*` - authentication (signup, login)
- `/uploads/*` - presigned URL generation
- `/episodes` - CRUD for episodes (JWT required)
- `/podcasts` - CRUD for podcasts (JWT required)
- `/feeds/:slug.xml` - RSS feed (public)
- `/play/:episodeId` - play tracking + redirect (public)
- `/api/dashboard/*` - analytics (JWT required)

### Validation & Security
- **All** POST/PUT endpoints use Zod schemas for validation
- **All** authenticated routes require JWT middleware check
- Passwords **always** hashed with Argon2 (never bcrypt)
- Play tracking uses **IP + UA hashing** (SHA-256), not raw storage

## Directory Structure (Planned)
```
backend/
  src/
    index.ts          # Express server entry
    routes/           # API route handlers
    middleware/       # Auth, logging, error handling
    prisma/
      schema.prisma   # Data models
frontend/
  src/
    pages/            # React components by route
    components/       # Reusable UI components
docker/
  docker-compose.yml  # Pi services only (Postgres + MinIO)
```

## Testing & Quality
- Postman collection at `tests/postman_collection.json` (create when implementing)
- Lint with `npm run lint` (both frontend/backend)
- Format with Prettier/ESLint
- Manual test flows: signup → login → upload → feed validation → dashboard

## Common Pitfalls
1. **Don't** use `localhost` for `DATABASE_URL` or `S3_ENDPOINT` - always use Pi IP
2. **Don't** upload audio files through backend API - use presigned URLs
3. **Don't** track raw IPs in Play model - hash them first
4. **Don't** count external podcast app plays - check referer header
5. **Don't** forget CORS config for `http://localhost:3000` in backend

## Reference Documents
- Full task backlog with acceptance criteria: `BACKLOG.md`
- Team workflow & phases: `TEAM_GUIDE.md`
- Architecture & setup: `README.md`
