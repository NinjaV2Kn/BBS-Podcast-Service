@echo off
REM ============================================
REM Podcast Platform - Easy Deployment Script
REM Windows Version
REM ============================================

setlocal enabledelayedexpansion

echo.
echo [*] Podcast Platform - Deployment Script (Windows)
echo ======================================
echo.

REM Check prerequisites
echo [1/5] Checking prerequisites...

docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not found. Please install Docker Desktop.
    exit /b 1
)
echo [OK] Docker found

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose not found. Please install Docker Desktop.
    exit /b 1
)
echo [OK] Docker Compose found

REM Create .env if not exists
echo.
echo [2/5] Setting up environment...

if not exist .env (
    if exist .env.example (
        copy .env.example .env
        echo [OK] Created .env from .env.example
        echo [WARNING] IMPORTANT: Edit .env and change JWT_SECRET, passwords, and URLs!
        echo.
        set /p edit_env="Open .env in notepad? (y/n): "
        if /i "!edit_env!"=="y" (
            notepad .env
        )
    ) else (
        echo [ERROR] .env.example not found
        exit /b 1
    )
) else (
    echo [OK] .env file exists
)

REM Ask about mode
echo.
echo [3/5] Choosing deployment mode...
echo 1) Fresh Installation (clean build)
echo 2) Update Existing (quick update)
echo.
set /p mode="Choose option (1-2): "

if "!mode!"=="1" (
    echo [*] Performing clean install...
    docker-compose down
    docker system prune -f
) else if "!mode!"=="2" (
    echo [*] Updating existing installation...
    docker-compose stop
) else (
    echo [ERROR] Invalid option
    exit /b 1
)

REM Build and start
echo.
echo [4/5] Building and starting services...
docker-compose build --no-cache
if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [OK] Build successful

echo [*] Starting services...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start services
    exit /b 1
)

REM Wait for services
echo.
echo [*] Waiting for services to be ready...
timeout /t 10 /nobreak

REM Apply database migrations
echo.
echo [5/5] Setting up database...
docker-compose exec -T backend npx prisma migrate deploy
if errorlevel 1 (
    echo [WARNING] Database migration may need manual attention
)

REM Verify
echo.
echo [*] Verifying installation...
echo.

docker-compose ps
echo.

echo [SUCCESS] Deployment Complete!
echo.
echo Services available at:
echo   Frontend:     http://localhost:3000
echo   Backend API:  http://localhost:8080
echo   PostgreSQL:   localhost:5432
echo   MinIO:        http://localhost:9001
echo.
echo Next steps:
echo   1. Open http://localhost:3000 in your browser
echo   2. Create an account (Sign Up)
echo   3. Create a podcast
echo   4. Upload episodes
echo.
echo For help:
echo   - Logs:    docker-compose logs -f
echo   - Stop:    docker-compose stop
echo   - Restart: docker-compose restart
echo   - Docs:    See README.md ^& DOCKER-DEPLOYMENT.md
echo.

pause
