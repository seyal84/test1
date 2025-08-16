# 🏠 HomeFlow Setup in Cursor Editor

## 🚀 Quick Start for Cursor Users

### 1. Clone & Open in Cursor
```bash
# In your terminal
git clone <your-repo-url>
cd homeflow

# Open in Cursor
cursor .
```

### 2. One-Command Setup
Open Cursor's integrated terminal (`Ctrl/Cmd + backtick`) and run:
```bash
./start-local.sh
```

That's it! The application will be running at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 🎯 Cursor-Specific Features

### Terminal Integration
Cursor's integrated terminal is perfect for HomeFlow development:
```bash
# Start full stack
npm run dev

# Start individual services
npm run dev:backend
npm run dev:frontend

# Stop all services
npm run stop
```

### Multi-Terminal Setup
For optimal development, set up multiple terminals in Cursor:

1. **Terminal 1**: Backend (`Ctrl/Cmd + Shift + backtick`)
   ```bash
   npm run dev:backend
   ```

2. **Terminal 2**: Frontend (split terminal)
   ```bash
   npm run dev:frontend
   ```

3. **Terminal 3**: Database/Utils
   ```bash
   npm run db:studio  # Database browser
   ```

### File Structure in Cursor
```
📁 homeflow/
├── 📁 apps/
│   ├── 📁 backend/           ← NestJS API
│   │   ├── 📁 src/
│   │   ├── 📁 prisma/
│   │   └── 📄 .env
│   └── 📁 frontend/          ← React App
│       ├── 📁 src/
│       └── 📄 .env
├── 📁 scripts/              ← Helper scripts
├── 📄 start-local.sh        ← Main startup
└── 📄 LOCAL_SETUP.md        ← Full documentation
```

### Recommended Cursor Extensions
Install these extensions for the best HomeFlow development experience:

**Essential:**
- TypeScript and JavaScript Language Features (built-in)
- Prisma (syntax highlighting for `.prisma` files)
- ES7+ React/Redux/React-Native snippets

**Helpful:**
- Auto Rename Tag
- Better Comments
- Material Icon Theme
- GitLens

### Cursor Settings for HomeFlow
Add these to your Cursor settings (Cmd/Ctrl + ,):

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.prisma": "prisma"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## 🔧 Development Workflow in Cursor

### 1. Start Development
```bash
# Open integrated terminal
./start-local.sh

# Or use npm script
npm run dev
```

### 2. Code with Hot Reload
- Frontend: Edit files in `apps/frontend/src/` - auto-reload in browser
- Backend: Edit files in `apps/backend/src/` - auto-restart server

### 3. Database Changes
```bash
# Make schema changes in apps/backend/prisma/schema.prisma
# Then run:
npm run db:migrate

# View data:
npm run db:studio
```

### 4. Stop Development
```bash
# In terminal:
Ctrl+C (in the terminal running start-local.sh)

# Or:
npm run stop
```

## 🐛 Debugging in Cursor

### Backend Debugging
1. Add breakpoints in `apps/backend/src/`
2. Use Cursor's built-in debugger
3. Or use terminal debugging:
   ```bash
   cd apps/backend
   npm run start:debug
   ```

### Frontend Debugging
1. Use React Developer Tools in browser
2. Add `console.log()` statements
3. Use Cursor's browser preview feature

### Database Debugging
```bash
# Visual database browser
npm run db:studio

# Command line access
psql -h localhost -U homeflow -d homeflow
```

## 📋 Common Tasks

### Adding New Features
```bash
# Backend: Add new endpoint
cd apps/backend/src
# Create new module/controller/service

# Frontend: Add new component
cd apps/frontend/src
# Create new React component

# Database: Add new table
# Edit apps/backend/prisma/schema.prisma
npm run db:migrate
```

### Environment Variables
Edit these files in Cursor:
- `apps/backend/.env` - Backend config
- `apps/frontend/.env` - Frontend config

### Package Management
```bash
# Add backend dependency
cd apps/backend && npm install <package>

# Add frontend dependency
cd apps/frontend && npm install <package>

# Install all dependencies
npm run install:all
```

## 🔄 Git Workflow in Cursor

Cursor's built-in Git features work perfectly with HomeFlow:

1. **Source Control Panel** (`Ctrl/Cmd + Shift + G`)
2. **Stage and commit changes**
3. **Push/pull with sync**

Recommended `.gitignore` additions:
```
# Development logs
logs/*.log
logs/*.pid

# Environment files
.env.local
.env.production

# OS files
.DS_Store
Thumbs.db
```

## 🚀 Production Build

```bash
# Build both apps
npm run build:all

# Test production build
cd apps/frontend && npm run preview
```

## 💡 Tips for Cursor Users

1. **Use Command Palette** (`Ctrl/Cmd + Shift + P`) for quick actions
2. **Split Editor** to view frontend and backend side-by-side
3. **Integrated Terminal** for all development tasks
4. **File Search** (`Ctrl/Cmd + P`) for quick navigation
5. **Multi-cursor editing** for bulk changes

## 🆘 Troubleshooting

### Common Issues in Cursor:

**"Port already in use"**
```bash
npm run stop
# Wait a few seconds, then:
npm run dev
```

**"Cannot find module"**
```bash
npm run install:all
```

**Database connection error**
```bash
npm run setup  # Recreate database
```

**TypeScript errors**
- Use Cursor's TypeScript language server
- Check `tsconfig.json` files
- Restart TypeScript: `Ctrl/Cmd + Shift + P` → "TypeScript: Restart TS Server"

## 📚 Next Steps

1. **Read** `LOCAL_SETUP.md` for comprehensive documentation
2. **Explore** the codebase in Cursor's file explorer
3. **Start coding** with hot reload enabled
4. **Use** Cursor's AI features for code assistance

Happy coding with HomeFlow in Cursor! 🎉