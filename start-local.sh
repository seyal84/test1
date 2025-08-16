#!/bin/bash

# HomeFlow Local Development Startup Script
# Run this script to start all services locally

echo "🏠 Starting HomeFlow Local Development Environment..."
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}Port $1 is already in use${NC}"
        return 1
    else
        return 0
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        if [ $((attempt % 5)) -eq 0 ]; then
            echo -e "${YELLOW}Still waiting for $service_name... (attempt $attempt/$max_attempts)${NC}"
        fi
        
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm and try again.${NC}"
    exit 1
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed. Please install PostgreSQL and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Check if ports are available
echo -e "${BLUE}🔍 Checking port availability...${NC}"
check_port 3000 || { echo "Please stop the service using port 3000 and try again."; exit 1; }
check_port 3001 || { echo "Please stop the service using port 3001 and try again."; exit 1; }
check_port 5432 || { echo "Warning: PostgreSQL might already be running on port 5432"; }

# Start PostgreSQL if not running
echo -e "${BLUE}🗄️  Starting PostgreSQL...${NC}"
if ! pgrep -x "postgres" > /dev/null; then
    # Try different ways to start PostgreSQL depending on the system
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql
    elif command -v service &> /dev/null; then
        sudo service postgresql start
    elif command -v brew &> /dev/null; then
        brew services start postgresql
    else
        echo -e "${YELLOW}⚠️  Please start PostgreSQL manually${NC}"
    fi
fi

# Setup database
echo -e "${BLUE}🗄️  Setting up database...${NC}"
./scripts/setup-database.sh

# Install dependencies if needed
echo -e "${BLUE}📦 Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -d "apps/backend/node_modules" ]; then
    cd apps/backend && npm install && cd ../..
fi

if [ ! -d "apps/frontend/node_modules" ]; then
    cd apps/frontend && npm install && cd ../..
fi

# Run database migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
cd apps/backend
npm run prisma:migrate
cd ../..

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"

# Start backend
echo -e "${YELLOW}Starting backend...${NC}"
cd apps/backend
npm run start:dev > ../../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../../logs/backend.pid
cd ../..

# Wait for backend to be ready
wait_for_service "http://localhost:3001/api/v1" "Backend API"

# Start frontend
echo -e "${YELLOW}Starting frontend...${NC}"
cd apps/frontend
npm run dev > ../../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../../logs/frontend.pid
cd ../..

# Wait for frontend to be ready
wait_for_service "http://localhost:3000" "Frontend"

echo -e "${GREEN}=================================================="
echo -e "🎉 HomeFlow is now running locally!"
echo -e "=================================================="
echo -e "Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "Backend:   ${BLUE}http://localhost:3001${NC}"
echo -e "API Docs:  ${BLUE}http://localhost:3001/api/docs${NC}"
echo -e "=================================================="
echo -e "📝 Logs are available in the ./logs/ directory"
echo -e "🛑 To stop all services, run: ./stop-local.sh"
echo -e "=================================================="

# Keep script running and show logs
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
trap 'echo -e "\n${YELLOW}Stopping services...${NC}"; ./scripts/stop-local.sh; exit 0' INT

# Follow logs
tail -f logs/backend.log logs/frontend.log