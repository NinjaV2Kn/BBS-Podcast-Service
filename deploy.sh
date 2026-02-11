#!/bin/bash

# ============================================
# Podcast Platform - Easy Deployment Script
# ============================================
# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎙️  Podcast Platform - Deployment Script${NC}"
echo "========================================"
echo ""

# Check prerequisites
echo -e "${YELLOW}[1/5]${NC} Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found. Please install Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose not found. Please install Docker Compose.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# Create .env if not exists
echo -e "${YELLOW}[2/5]${NC} Setting up environment..."

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and change JWT_SECRET, passwords, and URLs!${NC}"
        
        # Ask user to edit
        read -p "Open .env in editor now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v nano &> /dev/null; then
                nano .env
            elif command -v vim &> /dev/null; then
                vim .env
            else
                echo -e "${YELLOW}Please edit .env manually${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Ask about mode
echo ""
echo -e "${YELLOW}[3/5]${NC} Choosing deployment mode..."
echo "1) Fresh Installation (clean build)"
echo "2) Update Existing (quick update)"
read -p "Choose option (1-2): " mode

case $mode in
    1)
        echo -e "${YELLOW}📦 Performing clean install...${NC}"
        docker-compose down
        docker system prune -f
        ;;
    2)
        echo -e "${YELLOW}🔄 Updating existing installation...${NC}"
        docker-compose stop
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

# Build and start
echo -e "${YELLOW}[4/5]${NC} Building and starting services..."
docker-compose build --no-cache
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"

echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to start services${NC}"
    exit 1
fi

# Wait for services
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Apply database migrations
echo -e "${YELLOW}[5/5]${NC} Setting up database..."
docker-compose exec -T backend npx prisma migrate deploy
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Database migration may need manual attention${NC}"
fi

# Verify
echo ""
echo -e "${YELLOW}Verifying installation...${NC}"
echo ""

services=("frontend" "backend" "postgres" "minio")
for service in "${services[@]}"; do
    status=$(docker-compose ps $service --quiet)
    if [ -n "$status" ]; then
        echo -e "${GREEN}✓${NC} $service is running"
    else
        echo -e "${RED}✗${NC} $service is NOT running"
    fi
done

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Services available at:"
echo -e "  🖥️  Frontend:     ${YELLOW}http://localhost:3000${NC}"
echo -e "  ⚙️  Backend API:  ${YELLOW}http://localhost:8080${NC}"
echo -e "  🗄️  PostgreSQL:   localhost:5432"
echo -e "  ☁️  MinIO:        ${YELLOW}http://localhost:9001${NC}"
echo ""
echo "Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Create an account (Sign Up)"
echo "  3. Create a podcast"
echo "  4. Upload episodes"
echo ""
echo "For help:"
echo "  • Logs:    docker-compose logs -f"
echo "  • Stop:    docker-compose stop"
echo "  • Restart: docker-compose restart"
echo "  • Docs:    See README.md & DOCKER-DEPLOYMENT.md"
echo ""
