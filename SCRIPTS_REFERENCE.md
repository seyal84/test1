# 📜 HomeFlow Scripts Reference

## 🚀 Main Scripts

### Start/Stop Commands
```bash
# Start everything (recommended)
./start-local.sh
npm run dev
npm start

# Stop all services
./scripts/stop-local.sh
npm run stop
```

### Individual Service Scripts
```bash
# Backend only
./scripts/dev-backend.sh
npm run dev:backend

# Frontend only
./scripts/dev-frontend.sh
npm run dev:frontend

# Database setup
./scripts/setup-database.sh
npm run setup
```

## 📦 Package Management

```bash
# Install all dependencies
npm run install:all

# Build all apps
npm run build:all

# Test all apps
npm run test:all

# Lint all apps
npm run lint:all

# Clean install (removes node_modules)
npm run clean
```

## 🗄️ Database Commands

```bash
# Open database browser
npm run db:studio

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Reset database
npm run db:reset

# Manual database setup
npm run setup
```

## 📋 Development Commands

```bash
# View real-time logs
npm run logs

# Clean everything
npm run clean

# Full reset and restart
npm run clean && npm run install:all && npm run dev
```

## 🔧 Backend Specific

```bash
cd apps/backend

# Development
npm run start:dev

# Production
npm run start:prod

# Debug mode
npm run start:debug

# Build
npm run build

# Tests
npm run test
npm run test:watch
npm run test:e2e

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## 🎨 Frontend Specific

```bash
cd apps/frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Tests
npm run test

# Linting
npm run lint
```

## 🔍 Debugging & Monitoring

```bash
# Check what's running on ports
lsof -i :3000
lsof -i :3001

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Monitor all logs
npm run logs

# Database browser
npm run db:studio
```

## 🔄 Quick Workflows

### First Time Setup
```bash
git clone <repo>
cd homeflow
chmod +x start-local.sh scripts/*.sh
./start-local.sh
```

### Daily Development
```bash
npm run dev          # Start everything
# ... code changes ...
npm run stop         # Stop when done
```

### Database Changes
```bash
# Edit apps/backend/prisma/schema.prisma
npm run db:migrate   # Apply changes
npm run db:studio    # View data
```

### Adding Dependencies
```bash
# Backend
cd apps/backend && npm install <package>

# Frontend  
cd apps/frontend && npm install <package>
```

### Troubleshooting
```bash
npm run stop         # Stop everything
npm run clean        # Clean install
npm run install:all  # Reinstall deps
npm run setup        # Reset database
npm run dev          # Start fresh
```

## 📁 File Locations

- **Main startup**: `./start-local.sh`
- **Scripts directory**: `./scripts/`
- **Logs directory**: `./logs/`
- **Backend**: `./apps/backend/`
- **Frontend**: `./apps/frontend/`

## 🌐 Local URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs
- **Database**: http://localhost:5555 (Prisma Studio)

## ⚡ Quick Commands

| Command | Action |
|---------|--------|
| `npm run dev` | Start everything |
| `npm run stop` | Stop everything |
| `npm run logs` | View logs |
| `npm run db:studio` | Database browser |
| `npm run clean` | Clean install |

Remember: Always run commands from the project root unless specified otherwise!