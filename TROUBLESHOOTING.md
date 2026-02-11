# 🔧 Deployment Troubleshooting Guide

Common issues and solutions for Podcast Platform deployment.

---

## Docker Build Issues

### Error: "files not found"

**Symptoms:**
```
ERROR: failed to solve: failed to compute cache key: 
failed to calculate checksum of ref: "/src": not found
```

**Causes:**
- Build context not set correctly (not using backend directory)
- Files not committed to Git

**Solutions:**

1. **For Render.com:**
   - Set `Root Directory` to `backend` (or `frontend`)
   - Set `Dockerfile Path` to `Dockerfile`
   - Render should auto-detect this if your Dockerfile is in the backend folder

2. **For Docker Compose (local):**
   ```bash
   docker-compose build --no-cache backend
   ```

3. **For manual Docker build:**
   ```bash
   cd backend
   docker build -t podcast-backend .
   ```

4. **Make sure files are committed:**
   ```bash
   git add .
   git commit -m "Add source files"
   git push
   ```

---

## Render.com Specific Issues

### Build Fails Immediately

**Solution:**
1. Go to Render Dashboard
2. Click on service → **Logs**
3. Look for error message
4. Common fixes:
   - Check `Root Directory` is set correctly
   - Ensure `Dockerfile Path` is just `Dockerfile` (Render finds it in Root Directory)
   - Try clicking **Redeploy**

### Service Won't Start

**Check in Render Dashboard:**
1. Service status is "Build failed" or "Deploy failed"
2. Click service → **Logs** tab
3. Look for error messages

**Common Causes:**

```
[Error] Node.js process exited (code 1)
```
- Database connection wrong
- Environment variables missing
- Dependencies not installed

**Fix:**
- Add/update environment variables
- Click **Redeploy** to restart
- Check database is running

### "Health check failed"

**Means:** Service started but isn't responding to health check

**Check:**
1. Service is running: `curl https://service-url.onrender.com/health`
2. Port 8080 (backend) or 3000 (frontend) is correct
3. Application logs for errors

**Fix:**
- Wait 30+ seconds (cold start)
- Check environment variables
- Redeploy service

---

## Database Connection Issues

### Error: "Cannot connect to database"

**Symptoms:**
- Backend won't start
- Logs show PostgreSQL connection error

**Solutions:**

1. **Check connection string format:**
   ```
   postgresql://user:password@host:5432/dbname
   ```

2. **For Render PostgreSQL:**
   - Get connection string from Postgres service page
   - Copy entire **Internal Database URL** (or External if needed)
   - Paste into backend `DATABASE_URL` environment variable
   - **Redeploy backend**

3. **Test connection:**
   ```bash
   # From local machine
   psql postgres://user:pass@host:5432/dbname
   ```

### Error: "No database"

**Fix:**
1. Go to PostgreSQL service
2. Check **Logs** - should show database is running
3. Database is created automatically, but if not:
   - Check "Database" field equals `podcasts`
   - Create database via connection string auth

---

## Frontend Issues

### Blank page or "Cannot reach backend"

**Symptoms:**
- Frontend loads but shows no content
- Browser console shows API errors

**Solutions:**

1. **Check environment variable:**
   - Frontend `VITE_API_URL` should be backend URL
   - Example: `https://podcast-backend-xxx.onrender.com`

2. **Verify backend is running:**
   ```bash
   curl https://podcast-backend-xxx.onrender.com/health
   ```
   Should return: `{"status":"ok"...}`

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Look for CORS or fetch errors
   - Note the URL it's trying to reach

4. **Fix:**
   - Update `VITE_API_URL` to correct backend URL
   - **Redeploy frontend**
   - Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)

---

## Performance Issues

### Service is Very Slow

**Causes:**
- Render free tier has limited resources
- Cold start (service spins down after 15 min inactivity)
- Database queries are slow

**Solutions:**

1. **Upgrade to paid plan** (removes cold starts)

2. **Keep service awake:**
   - Use external ping service
   - Call `/health` endpoint every 10 minutes

3. **Optimize database:**
   - Add indexes to frequently queried tables
   - Monitor slow queries in logs

4. **Check logs for bottlenecks:**
   - Go to service → **Logs**
   - Look for slow response times
   - Optimize code if needed

---

## Environment Variables Not Working

### Changes don't take effect

**Symptoms:**
- Updated environment variable but old value still used
- Service still fails with original error

**Solution:**
```
1. Update environment variable in Render Dashboard
2. Go to service → Environment tab
3. Make change
4. Click "Redeploy" or "Manual Deploy"
5. Wait for deploy to complete
```

### Missing environment variable

**Error in logs:**
```
Error: JWT_SECRET is not defined
```

**Fix:**
1. Check all required variables are set:
   - JWT_SECRET
   - DATABASE_URL
   - S3_ENDPOINT (if using)
   - FRONTEND_URL

2. Add missing variables in Render Dashbo

ard

3. Redeploy

---

## GitHub Deployment Issues

### Render not pulling latest code

**Symptoms:**
- Pushed code but Render using old version

**Solutions:**

1. **Manual redeploy:**
   - Go to service
   - Click **Redeploy** (or **Manual Deploy** → **Deploy latest commit**)

2. **Re-connect GitHub:**
   - Go to service → **Settings**
   - Disconnect GitHub
   - Reconnect and choose correct branch

3. **Check branch:**
   - Service should be watching `main` branch
   - Verify in Render Dashboard under **Source** → **Branch**

---

## Logs & Debugging

### Where to find logs

1. **Render Dashboard:**
   - Click service
   - Go to **Logs** tab
   - Streams all output in real-time

2. **Download logs:**
   - Click **Logs** → **Download Logs**
   - See historical logs

3. **Filter logs:**
   - Search for error keywords
   - Example: `ERROR`, `failed`, `Connection`

### What to look for in logs

```
# Good signs
[INFO] Backend running on port 8080
[INFO] Database connected
Started successfully

# Bad signs
Cannot find module
Port already in use
ECONNREFUSED (can't connect to database)
Connection timeout
```

---

## Render.com Limits

### Free Tier Limits

- CPU: 0.5 vCPU (shared)
- RAM: 512 MB
- Storage: 0.5 GB (PostgreSQL)
- Cold start: Service spins down after 15-20 min inactivity
- Can't use external connections reliably

### For Production

Upgrade to **Starter** tier:
- Always running
- Better performance
- Reliable uptime

---

## Emergency Fixes

### Service completely broken, need to reset

```bash
# Via Render Dashboard:
1. Go to service → Settings
2. Scroll to "Delete Service"
3. Delete service
4. Recreate from scratch
5. Environment variables get lost - document them first!
```

### Database needs reset

```bash
# Via Render Dashboard:
1. Go to PostgreSQL service
2. Click "Connect"
3. Use connection string in psql:
   psql <connection-string>

# Then in psql:
DROP DATABASE podcasts;
CREATE DATABASE podcasts;
```

### Rebuild everything

```bash
# From your local machine:
1. git push origin main  # Push any changes

# In Render Dashboard:
1. Backend service → **Redeploy**
2. Frontend service → **Redeploy**
3. Wait for both to finish
```

---

## Asking for Help

When reporting issues, include:

1. **Service name** (podcast-backend, podcast-frontend, etc.)
2. **Last error message** (from Logs)
3. **What you were doing** when it failed
4. **Environment variables** set (excluding secrets)
5. **Steps to reproduce** the issue

**Useful Render links:**
- Status: https://render-status.com/
- Docs: https://render.com/docs/
- Support: https://render.com/support/

---

## Support

- See main [README.md](./README.md)
- See [RENDER-DEPLOYMENT.md](./RENDER-DEPLOYMENT.md)
- See [DOCKER-DEPLOYMENT.md](./DOCKER-DEPLOYMENT.md)
- GitHub Issues: Report bugs

---

Last updated: 2025-02-11 | Version 1.0
