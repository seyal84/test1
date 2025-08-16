#!/bin/bash

# Frontend Development Script
# Run this to start only the frontend service

echo "🎨 Starting HomeFlow Frontend in Development Mode..."
echo "=================================================="

# Navigate to frontend directory
cd apps/frontend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > .env << EOF
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_NODE_ENV=development
VITE_API_URL=http://localhost:3001/api/v1
EOF
    echo "✅ Frontend .env file created"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start the frontend
echo "🚀 Starting frontend development server..."
echo "Frontend will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop"

npm run dev