# 🏠 HomeFlow - Local Development Setup

## Quick Start

### 1. **One-Command Setup** (Recommended)
```bash
./start-local.sh
```
This script will:
- Check prerequisites
- Set up the database
- Install dependencies
- Run migrations
- Start both frontend and backend
- Show real-time logs

### 2. **Manual Setup** (For development)

#### Prerequisites
- **Node.js 18+** (recommended: use nvm for version management)
- **npm** (comes with Node.js)
- **PostgreSQL 12+**
- **Git**

#### Install Prerequisites

**On macOS:**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and PostgreSQL
brew install node postgresql
brew services start postgresql
```

**On Ubuntu/Debian:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**On Windows:**
- Download Node.js from [nodejs.org](https://nodejs.org/)
- Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)

## 🚀 Running the Application

### Option 1: Full Stack (Both Services)
```bash
# Start everything
./start-local.sh

# Stop everything
./scripts/stop-local.sh
```

### Option 2: Individual Services

**Backend Only:**
```bash
./scripts/dev-backend.sh
```

**Frontend Only:**
```bash
./scripts/dev-frontend.sh
```

## 📁 Project Structure

```
homeflow/
├── apps/
│   ├── backend/          # NestJS API server
│   │   ├── src/          # Source code
│   │   ├── prisma/       # Database schema & migrations
│   │   ├── package.json  # Backend dependencies
│   │   └── .env          # Backend environment variables
│   └── frontend/         # React application
│       ├── src/          # Source code
│       ├── package.json  # Frontend dependencies
│       └── .env          # Frontend environment variables
├── scripts/              # Development scripts
├── logs/                 # Application logs
├── start-local.sh        # Main startup script
└── LOCAL_SETUP.md        # This file
```

## 🔧 Development Commands

### Backend Commands
```bash
cd apps/backend

# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Run tests
npm run test

# Database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# View database in browser
npx prisma studio
```

### Frontend Commands
```bash
cd apps/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

## 🗄️ Database Management

### Quick Database Reset
```bash
# Stop services
./scripts/stop-local.sh

# Reset database
sudo -u postgres dropdb homeflow
./scripts/setup-database.sh

# Restart services
./start-local.sh
```

### Manual Database Commands
```bash
# Connect to database
psql -h localhost -U homeflow -d homeflow

# View database schema
\d

# List tables
\dt

# Exit psql
\q
```

## 🌐 Local URLs

When running locally, access the application at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Database (Prisma Studio)**: http://localhost:5555

## 🔑 Environment Variables

### Backend (.env)
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://homeflow:homeflow_password@localhost:5432/homeflow?schema=public"
JWT_SECRET=homeflow_jwt_secret_key_for_development
JWT_EXPIRES_IN=24h
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:3001/api/v1
VITE_API_URL=http://localhost:3001/api/v1
REACT_APP_NODE_ENV=development
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000  # or :3001

# Kill the process
kill -9 <PID>

# Or use the stop script
./scripts/stop-local.sh
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
systemctl status postgresql           # Linux

# Restart PostgreSQL
brew services restart postgresql      # macOS
sudo systemctl restart postgresql     # Linux

# Recreate database
./scripts/setup-database.sh
```

### Node Modules Issues
```bash
# Clean install backend
cd apps/backend
rm -rf node_modules package-lock.json
npm install

# Clean install frontend
cd apps/frontend
rm -rf node_modules package-lock.json
npm install
```

### Prisma Issues
```bash
cd apps/backend

# Reset Prisma
npx prisma generate
npx prisma migrate reset
npx prisma migrate dev
```

## 🧪 Testing the Setup

### Quick Health Check
```bash
# Test backend
curl http://localhost:3001/api/v1

# Test frontend
curl http://localhost:3000
```

### Development Workflow
1. Start the application: `./start-local.sh`
2. Open frontend: http://localhost:3000
3. View API docs: http://localhost:3001/api/docs
4. Make changes to code (auto-reload enabled)
5. Check logs in terminal or `logs/` directory
6. Stop services: `./scripts/stop-local.sh`

## 📝 Additional Notes

- **Hot Reload**: Both frontend and backend support hot reload
- **Logs**: Check `logs/backend.log` and `logs/frontend.log` for detailed output
- **Database**: Uses PostgreSQL with Prisma ORM
- **API**: RESTful API with Swagger documentation
- **Frontend**: React with Vite for fast development

## 🆘 Getting Help

If you encounter issues:

1. Check the logs in the `logs/` directory
2. Ensure all prerequisites are installed
3. Try running `./scripts/stop-local.sh` then `./start-local.sh`
4. Check port availability with `lsof -i :3000` and `lsof -i :3001`

## 🔄 Update Scripts

Make all scripts executable:
```bash
chmod +x start-local.sh
chmod +x scripts/*.sh
```