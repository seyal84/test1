#!/bin/bash

# HomeFlow Local Services Stop Script
# This script stops all running HomeFlow services

echo "🛑 Stopping HomeFlow Local Services..."
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Stop services using PID files
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
        sleep 2
        if kill -0 $BACKEND_PID 2>/dev/null; then
            echo -e "${YELLOW}Force stopping backend...${NC}"
            kill -9 $BACKEND_PID
        fi
        echo -e "${GREEN}✅ Backend stopped${NC}"
    else
        echo -e "${GREEN}✅ Backend was not running${NC}"
    fi
    rm -f logs/backend.pid
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${YELLOW}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID
        sleep 2
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            echo -e "${YELLOW}Force stopping frontend...${NC}"
            kill -9 $FRONTEND_PID
        fi
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    else
        echo -e "${GREEN}✅ Frontend was not running${NC}"
    fi
    rm -f logs/frontend.pid
fi

# Kill any remaining node processes on our ports
echo -e "${YELLOW}Cleaning up any remaining processes...${NC}"

# Kill processes on port 3000 and 3001
for port in 3000 3001; do
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        echo -e "${YELLOW}Stopping process on port $port (PID: $PID)...${NC}"
        kill $PID 2>/dev/null
        sleep 1
        if kill -0 $PID 2>/dev/null; then
            kill -9 $PID 2>/dev/null
        fi
    fi
done

# Kill any npm/node processes related to HomeFlow
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true
pkill -f "node.*dist/main" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

echo -e "${GREEN}======================================"
echo -e "✅ All HomeFlow services stopped"
echo -e "======================================"

# Show what's still running on our ports (should be empty)
echo -e "${YELLOW}Port status check:${NC}"
for port in 3000 3001; do
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "Port $port: Still in use"
    else
        echo -e "Port $port: Available"
    fi
done