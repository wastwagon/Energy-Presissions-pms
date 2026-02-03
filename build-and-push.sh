#!/bin/bash

# Build and Push Script for Docker Hub
# Usage: ./build-and-push.sh <your-dockerhub-username>

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker Hub username is provided
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage: ./build-and-push.sh <your-dockerhub-username>${NC}"
    echo "Example: ./build-and-push.sh johndoe"
    exit 1
fi

DOCKERHUB_USERNAME=$1

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Energy Precision PMS - Docker Build & Push${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}Error: Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Not logged in to Docker Hub. Please login first:${NC}"
    echo "docker login"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo -e "${GREEN}✓ Logged in to Docker Hub${NC}"
echo ""

# Build Backend
echo -e "${BLUE}Building backend image (linux/amd64)...${NC}"
docker build --platform linux/amd64 -f backend/Dockerfile.prod -t ${DOCKERHUB_USERNAME}/energy-pms-backend:latest ./backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend image built successfully${NC}"
else
    echo -e "${YELLOW}✗ Backend build failed${NC}"
    exit 1
fi

# Build Frontend
echo -e "${BLUE}Building frontend image (linux/amd64)...${NC}"
docker build --platform linux/amd64 -f frontend/Dockerfile.prod -t ${DOCKERHUB_USERNAME}/energy-pms-frontend:latest ./frontend --build-arg REACT_APP_API_URL=http://localhost:8000

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend image built successfully${NC}"
else
    echo -e "${YELLOW}✗ Frontend build failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Pushing images to Docker Hub...${NC}"
echo ""

# Push Backend
echo -e "${BLUE}Pushing backend image...${NC}"
docker push ${DOCKERHUB_USERNAME}/energy-pms-backend:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend image pushed successfully${NC}"
else
    echo -e "${YELLOW}✗ Backend push failed${NC}"
    exit 1
fi

# Push Frontend
echo -e "${BLUE}Pushing frontend image...${NC}"
docker push ${DOCKERHUB_USERNAME}/energy-pms-frontend:latest

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend image pushed successfully${NC}"
else
    echo -e "${YELLOW}✗ Frontend push failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ All images built and pushed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your images are available at:"
echo "  - ${DOCKERHUB_USERNAME}/energy-pms-backend:latest"
echo "  - ${DOCKERHUB_USERNAME}/energy-pms-frontend:latest"
echo ""
echo "Next steps:"
echo "  1. Go to https://dashboard.render.com"
echo "  2. Create a PostgreSQL database"
echo "  3. Create Web Services using these images"
echo "  4. See DEPLOYMENT.md for detailed instructions"
echo ""

