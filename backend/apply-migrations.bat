@echo off
cd /d "%~dp0"
echo Running Prisma migrations...
call npx prisma migrate dev --name init
if errorlevel 1 (
  echo Migration failed!
  exit /b 1
) else (
  echo Migrations completed successfully!
  exit /b 0
)
