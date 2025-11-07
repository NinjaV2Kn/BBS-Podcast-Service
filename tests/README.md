# Tests

## Postman Collection

Import `postman_collection.json` into Postman to test all API endpoints.

### Variables to set:
- `token` - JWT token from login response
- `podcastId` - ID of a created podcast
- `slug` - Podcast slug for RSS feed

## Manual Test Workflows

### 1. User Registration & Login
1. POST `/auth/signup` with email, password, name
2. POST `/auth/login` with credentials
3. Store JWT token from response

### 2. Upload Workflow
1. POST `/uploads/presign` with filename (authenticated)
2. PUT to presigned MinIO URL with audio file
3. POST `/episodes` to register episode

### 3. RSS Feed Validation
1. GET `/feeds/{slug}.xml`
2. Validate XML with https://validator.w3.org/feed/
3. Test in podcast app (Spotify, Apple Podcasts)

### 4. Play Tracking
1. GET `/play/{episodeId}` from browser
2. Check database for new Play entry
3. Verify IP/UA hashing
4. Verify referer filtering

### 5. Dashboard
1. GET `/api/dashboard/overview` (authenticated)
2. Verify total plays count
3. Verify top episodes list
4. Check 30-day chart data

## Database Verification

```bash
npx prisma studio
```

Check:
- Users table for Argon2 password hashes
- Episodes linked to correct Podcast
- Plays with hashed identifiers, not raw IPs
