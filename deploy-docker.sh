#!/bin/bash

# EvoMeme Docker Deployment Script
# This script deploys the application using Docker with PM2 fallback

set -e  # Exit on error

echo "======================================"
echo "EvoMeme Docker Deployment Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/u146506433/domains/worldoftech.company/public_html/evomeme"
DOCKER_COMPOSE_FILE="docker-compose.yml"
PM2_ECOSYSTEM_FILE="ecosystem.config.js"

# Navigate to app directory
cd "$APP_DIR" || exit 1

echo -e "${YELLOW}Step 1: Pulling latest code from GitHub...${NC}"
git pull origin main || {
    echo -e "${RED}Failed to pull from GitHub${NC}"
    exit 1
}
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Check if Docker daemon is running
echo -e "${YELLOW}Step 2: Checking Docker daemon...${NC}"
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker daemon is running${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${RED}✗ Docker daemon is not running${NC}"
    echo -e "${YELLOW}Will use PM2 fallback deployment${NC}"
    DOCKER_AVAILABLE=false
fi
echo ""

if [ "$DOCKER_AVAILABLE" = true ]; then
    # Docker deployment
    echo -e "${YELLOW}Step 3: Building Docker image...${NC}"
    docker-compose build || {
        echo -e "${RED}Failed to build Docker image${NC}"
        echo -e "${YELLOW}Falling back to PM2 deployment${NC}"
        DOCKER_AVAILABLE=false
    }
    
    if [ "$DOCKER_AVAILABLE" = true ]; then
        echo -e "${GREEN}✓ Docker image built${NC}"
        echo ""
        
        echo -e "${YELLOW}Step 4: Stopping existing containers...${NC}"
        docker-compose down || true
        echo -e "${GREEN}✓ Containers stopped${NC}"
        echo ""
        
        echo -e "${YELLOW}Step 5: Starting new container...${NC}"
        docker-compose up -d || {
            echo -e "${RED}Failed to start container${NC}"
            echo -e "${YELLOW}Falling back to PM2 deployment${NC}"
            DOCKER_AVAILABLE=false
        }
        
        if [ "$DOCKER_AVAILABLE" = true ]; then
            echo -e "${GREEN}✓ Container started${NC}"
            echo ""
            
            echo -e "${YELLOW}Step 6: Checking container health...${NC}"
            sleep 5
            if docker ps | grep -q evomeme; then
                echo -e "${GREEN}✓ Container is running${NC}"
                echo ""
                echo -e "${GREEN}======================================"
                echo "Deployment successful!"
                echo "Application is running in Docker"
                echo "======================================${NC}"
                echo ""
                echo "Container status:"
                docker ps | grep evomeme
                echo ""
                echo "View logs: docker logs evomeme -f"
                exit 0
            else
                echo -e "${RED}✗ Container failed to start${NC}"
                echo -e "${YELLOW}Falling back to PM2 deployment${NC}"
                DOCKER_AVAILABLE=false
            fi
        fi
    fi
fi

# PM2 Fallback deployment
if [ "$DOCKER_AVAILABLE" = false ]; then
    echo ""
    echo -e "${YELLOW}======================================"
    echo "Starting PM2 Fallback Deployment"
    echo "======================================${NC}"
    echo ""
    
    echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
    npm ci --only=production || {
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
    
    echo -e "${YELLOW}Step 2: Building application...${NC}"
    npm run build || {
        echo -e "${RED}Failed to build application${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ Application built${NC}"
    echo ""
    
    echo -e "${YELLOW}Step 3: Creating logs directory...${NC}"
    mkdir -p logs
    echo -e "${GREEN}✓ Logs directory created${NC}"
    echo ""
    
    echo -e "${YELLOW}Step 4: Starting with PM2...${NC}"
    # Check if PM2 is installed
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}PM2 not found, installing...${NC}"
        npm install -g pm2 || {
            echo -e "${RED}Failed to install PM2${NC}"
            exit 1
        }
    fi
    
    # Stop existing PM2 process
    pm2 delete evomeme 2>/dev/null || true
    
    # Start with PM2
    pm2 start "$PM2_ECOSYSTEM_FILE" --env production || {
        echo -e "${RED}Failed to start with PM2${NC}"
        exit 1
    }
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    pm2 startup || true
    
    echo -e "${GREEN}✓ Application started with PM2${NC}"
    echo ""
    echo -e "${GREEN}======================================"
    echo "Deployment successful!"
    echo "Application is running with PM2"
    echo "======================================${NC}"
    echo ""
    echo "PM2 status:"
    pm2 status
    echo ""
    echo "View logs: pm2 logs evomeme"
fi
