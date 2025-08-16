#!/bin/bash

# Backend Development Script
# Run this to start only the backend service

echo "🔧 Starting HomeFlow Backend in Development Mode..."
echo "================================================="

# Navigate to backend directory
cd apps/backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cat > .env << EOF
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://homeflow:homeflow_password@localhost:5432/homeflow?schema=public"
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET=homeflow_jwt_secret_key_for_development
JWT_EXPIRES_IN=24h

# AWS Cognito (using dummy values for development)
AWS_COGNITO_REGION=us-east-1
AWS_COGNITO_USER_POOL_ID=us-east-1_dummypool
AWS_COGNITO_CLIENT_ID=dummy_client_id

# Hugging Face API (optional)
HUGGINGFACE_API_KEY=dummy_api_key
EOF
    echo "✅ Backend .env file created"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name dev

# Start the backend
echo "🚀 Starting backend server..."
echo "Backend will be available at: http://localhost:3001"
echo "API documentation at: http://localhost:3001/api/docs"
echo "Press Ctrl+C to stop"

npm run start:dev