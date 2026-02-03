#!/bin/bash

# Energy Precision PMS - Service Startup Script
# This script starts all services for the Energy Precision PMS application

set -e  # Exit on error

echo "=========================================="
echo "Energy Precision PMS - Service Startup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop first.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed.${NC}"
    exit 1
fi

# Use 'docker compose' if available, otherwise 'docker-compose'
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Using default values from docker-compose.yml${NC}"
    echo "You may want to create a .env file with your configuration."
    echo ""
fi

# Stop any existing containers
echo "Stopping any existing containers..."
$DOCKER_COMPOSE down 2>/dev/null || true
echo ""

# Start all services
echo "Starting all services..."
echo ""
$DOCKER_COMPOSE up -d

echo ""
echo -e "${GREEN}Services are starting...${NC}"
echo ""

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 5

# Check service status
echo ""
echo "Service Status:"
echo "=========================================="
$DOCKER_COMPOSE ps

echo ""
echo -e "${YELLOW}Waiting for database to be healthy...${NC}"
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if $DOCKER_COMPOSE exec -T db pg_isready -U energy_pms > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Database is ready${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}✗ Database failed to start within timeout${NC}"
    echo "Check logs with: $DOCKER_COMPOSE logs db"
    exit 1
fi

echo ""
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend API is ready${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${YELLOW}⚠ Backend may still be starting. Check logs if needed.${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}All services are starting!${NC}"
echo "=========================================="
echo ""
echo "Access Points:"
echo "  • Frontend UI:    http://localhost:5000"
echo "  • Backend API:    http://localhost:8000"
echo "  • API Docs:       http://localhost:8000/docs"
echo "  • Database:       localhost:5432"
echo ""
echo "Useful Commands:"
echo "  • View logs:      $DOCKER_COMPOSE logs -f [service]"
echo "  • Stop services:  $DOCKER_COMPOSE down"
echo "  • Restart:        $DOCKER_COMPOSE restart [service]"
echo ""
echo -e "${YELLOW}Note: If this is your first run, you may need to:${NC}"
echo "  1. Run database migrations: $DOCKER_COMPOSE exec backend alembic upgrade head"
echo "  2. Initialize database: $DOCKER_COMPOSE exec backend python -m app.scripts.init_db"
echo "  3. Create admin user: $DOCKER_COMPOSE exec backend python -m app.scripts.create_admin"
echo ""
