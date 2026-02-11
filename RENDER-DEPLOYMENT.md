# 🚀 Render.com Deployment Guide

Step-by-step guide for deploying the Podcast Platform to Render.com

---

## Prerequisites

- Render.com account (free or paid)
- GitHub repository connected to Render
- Git repository pushed to GitHub

---

## 1. Database Setup (PostgreSQL)

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `podcast-postgres`
   - **Database**: `podcasts`
   - **User**: `podcast_user`
   - **Region**: Choose closest to users
   - **Plan**: Starter (free tier available)
4. Click **Create Database**
5. **Save the connection string** - you'll need it for backend

---

## 2. Storage Setup (MinIO/S3)

### Option A: Use Render's built-in Disk Storage (Simple)

MinIO doesn't work well with Render's ephemeral storage. Use one of these alternatives:

**Option B: AWS S3** (Recommended)
1. Create AWS bucket
2. Generate access keys
3. Set environment variables in backend service

**Option C: Deploy MinIO separately** 
Can use Fly.io or another hosting provider

For this guide, we'll use AWS S3.

---

## 3. Backend Deployment

### Step 1: Create Backend Service

1. Go to Render Dashboard → **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `podcast-backend`
   - **Environment**: `Docker`
   - **Region**: Same as database
   - **Plan**: Free (if testing) or Starter (production)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Dockerfile Path**: `Dockerfile`

### Step 2: Set Environment Variables

Click **Environment** and add:

```
NODE_ENV=production
JWT_SECRET=<generate-with: openssl rand -base64 32>
DATABASE_URL=postgresql://podcast_user:<password>@<db-host>:<db-port>/podcasts
FRONTEND_URL=https://podcast-frontend-<random>.onrender.com
S3_ENDPOINT=https://<s3-bucket>.s3.amazonaws.com
S3_ACCESS_KEY=<from-aws>
S3_SECRET_KEY=<from-aws>
S3_BUCKET=<bucket-name>
S3_REGION=us-east-1
```

### Step 3: Add Pre-Deploy Command

Under **Build Command**:
```bash
npm run build && npm run prisma:deploy
```

### Step 4: Deploy

Click **Create Web Service** - Render will start building from your repository

---

## 4. Frontend Deployment

### Step 1: Create Frontend Service

1. **New +** → **Web Service**
2. Configure:
   - **Name**: `podcast-frontend`
   - **Environment**: `Docker`
   - **Region**: Same as backend
   - **Root Directory**: `frontend`
   - **Dockerfile Path**: `Dockerfile`

### Step 2: Set Environment Variables

```
VITE_API_URL=https://podcast-backend-<random>.onrender.com
```

### Step 3: Deploy

Click **Create** and wait for build to complete

---

## 5. Connect Services

### Update Frontend Environment

Once backend is deployed, get its URL from Render Dashboard (looks like `https://podcast-backend-xxx.onrender.com`)

Edit frontend environment variable:
```
VITE_API_URL=https://podcast-backend-xxx.onrender.com
```

---

## 6. Connect Database

Once PostgreSQL is ready:

1. Get the **Internal Database URL** from Postgres service
2. Update backend `DATABASE_URL` environment variable
3. Redeploy backend

---

## Testing Deployment

### Check Status

1. Go to each service in Render Dashboard
2. Look for **Live** status and green checkmark
3. Click service URL to test

### Backend Health Check

```bash
curl https://podcast-backend-xxx.onrender.com/health
```

Should return:
```json
{"status":"ok","service":"podcast-backend","timestamp":"..."}
```

### Frontend

Visit `https://podcast-frontend-xxx.onrender.com` in browser

---

## Troubleshooting

### Build Fails

**Error: "files not found"**
- Ensure `Root Directory` is set correctly (`backend` or `frontend`)
- Check that Dockerfile exists in that directory

**Error: "npm: command not found"**
- Make sure `Environment` is set to `Docker`

### Service Won't Start

Check logs:
1. Click service
2. Go to **Logs** tab
3. Look for error messages

Common issues:
- Database connection string wrong → update `DATABASE_URL`
- Environment variables not set
- Port is not 8080 or 3000

### Cold Starts / Slow Performance

Render free tier:
- Spins down inactive services
- Slower CPU/RAM
- Limited build time

Solutions:
- Upgrade to paid plan
- Use cron-job to keep service awake
- Implement proper caching

---

## Production Checklist

- [ ] All environment variables set securely
- [ ] Database backups configured
- [ ] SSL/HTTPS working (automatic with Render)
- [ ] Custom domain set up (optional)
- [ ] Error monitoring configured
- [ ] Logs monitored for issues
- [ ] Database migrations successful
- [ ] Services communicate correctly

---

## Useful Render Commands

View logs:
```bash
# Not available via CLI, use Render dashboard
```

Redeploy service:
1. Go to service
2. Click **Redeploy** (or push to GitHub)

Manual deploy:
1. Make changes locally
2. Push to GitHub
3. Render auto-deploys

---

## Monitoring

### Recommended Tools

- **Sentry** - Error tracking
- **Datadog** - Performance monitoring
- **New Relic** - Application performance

Add monitoring to backend:

```typescript
// backend/src/index.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Next Steps

1. Set up custom domain (optional)
2. Configure email notifications
3. Set up monitoring & alerts
4. Plan backup strategy
5. Document deployment process

---

## Support

- Render Docs: https://render.com/docs
- GitHub: Push changes to auto-deploy
- Logs: Check service logs in dashboard

**Need help?** See main README.md or DOCKER-DEPLOYMENT.md
