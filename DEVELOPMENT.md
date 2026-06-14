# 🛠️ Development Guide - TPPO Whiteboard

## Project Structure

```
tppo-whiteboard/
├── packages/
│   ├── server/                  # Backend (Node.js + Express)
│   │   ├── src/
│   │   │   ├── index.ts        # Entry point
│   │   │   ├── db/             # Database scripts
│   │   │   │   └── init.sql    # Schema
│   │   │   ├── routes/         # API routes
│   │   │   │   ├── auth.ts
│   │   │   │   └── boards.ts
│   │   │   ├── services/       # Business logic
│   │   │   │   └── websocket.ts
│   │   │   ├── middleware/     # Express middleware
│   │   │   │   └── auth.ts
│   │   │   ├── types/          # TypeScript types
│   │   │   └── utils/          # Helpers
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── Dockerfile
│   │
│   └── client/                  # Frontend (React)
│       ├── src/
│       │   ├── main.tsx         # Entry point
│       │   ├── App.tsx          # Root component
│       │   ├── pages/           # Page components
│       │   │   ├── LoginPage.tsx
│       │   │   ├── BoardsPage.tsx
│       │   │   └── EditorPage.tsx
│       │   ├── components/      # Reusable components
│       │   │   ├── BrainstormTimer.tsx
│       │   │   └── StickyVotingPanel.tsx
│       │   ├── services/        # API calls
│       │   │   └── api.ts
│       │   ├── hooks/           # React hooks
│       │   ├── utils/           # Utilities
│       │   │   ├── store.ts     # Zustand store
│       │   │   ├── websocket.ts # Socket.io
│       │   │   ├── offlineDb.ts # IndexedDB
│       │   │   └── api.ts       # Axios instance
│       │   ├── types/           # TypeScript types
│       │   └── styles/          # CSS
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── Dockerfile.dev
│
├── docker-compose.yml           # Orchestration
├── package.json                 # Workspace config
├── README.md                    # Main docs
├── SETUP.md                     # Setup guide
├── FEATURES.md                  # Feature list
├── DEVELOPMENT.md              # This file
└── .gitignore
```

## Getting Started with Development

### Backend Development

```bash
cd packages/server

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Edit .env with your database URL
# DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Run migrations (if using raw SQL)
npm run migrate

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

### Frontend Development

```bash
cd packages/client

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Edit .env if needed
# VITE_API_URL=http://localhost:3000/api
# VITE_WS_URL=ws://localhost:3000

# Start dev server
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

## Database Development

### Schema Changes

1. Edit `packages/server/src/db/init.sql`
2. Drop and recreate database:
   ```bash
   docker-compose down -v
   docker-compose up
   ```

### Run Raw Queries

```bash
# Connect to running database
docker-compose exec postgres psql -U whiteboard tppo_whiteboard

# Or locally
psql -U whiteboard tppo_whiteboard
```

### Backup/Restore

```bash
# Backup
docker-compose exec postgres pg_dump -U whiteboard tppo_whiteboard > backup.sql

# Restore
docker-compose exec postgres psql -U whiteboard tppo_whiteboard < backup.sql
```

## API Development

### Adding New Routes

1. Create route file: `packages/server/src/routes/feature.ts`

```typescript
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  // Your code here
});

export default router;
```

2. Import in `index.ts`:

```typescript
import featureRoutes from './routes/feature.js';
app.use('/api/feature', featureRoutes);
```

### WebSocket Events

Add handlers in `packages/server/src/services/websocket.ts`:

```typescript
socket.on('custom-event', (data) => {
  // Broadcast to all in room
  io.to(`board:${socket.boardId}`).emit('event-response', response);
});
```

## Frontend Development

### Adding New Page

1. Create `packages/client/src/pages/MyPage.tsx`
2. Add route in `App.tsx`:

```typescript
import MyPage from './pages/MyPage';

<Route path="/my-page" element={<MyPage />} />
```

### Adding New Component

1. Create `packages/client/src/components/MyComponent.tsx`
2. Import and use:

```typescript
import MyComponent from '../components/MyComponent';

<MyComponent prop1="value" />
```

### State Management (Zustand)

```typescript
// In utils/store.ts
export const useMyStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));

// In component
const data = useMyStore((s) => s.data);
const setData = useMyStore((s) => s.setData);
```

### API Calls

```typescript
// In utils/api.ts
export const myAPI = {
  getItems: () => api.get('/items'),
  createItem: (item) => api.post('/items', item),
};

// In component
const handleCreate = async () => {
  const res = await myAPI.createItem(newItem);
  // Update state
};
```

## Testing

### Manual Testing Checklist

- [ ] Auth (signup, login, logout)
- [ ] Create board
- [ ] Draw objects
- [ ] Edit objects
- [ ] Delete objects
- [ ] Real-time sync (multiple tabs)
- [ ] Offline mode (disable network)
- [ ] Export (PNG, SVG, PDF)
- [ ] Voting
- [ ] Timer

### Browser DevTools

**Console:**
- Check for JavaScript errors
- Use `console.log()` for debugging

**Network Tab:**
- Monitor API calls
- Check WebSocket frames
- Monitor performance

**Application:**
- IndexedDB for offline cache
- LocalStorage for tokens
- Cookies if used

## Performance Optimization

### Frontend
- Use React.memo for expensive components
- Lazy load routes with React.lazy
- Optimize re-renders
- Compress images

### Backend
- Use database indexes
- Redis caching
- Connection pooling
- Query optimization

### Database
- Proper indexing
- Query optimization
- Partition large tables
- Archive old data

## Code Style

### TypeScript
- Use strict mode
- Type all function parameters
- Avoid `any`
- Use interfaces for objects

### Function Naming
- `getX` for queries
- `setX` for mutations
- `handleX` for events
- `isX` for booleans

### Component Naming
- PascalCase for components
- descriptive names
- `[Component]Page` for pages

### CSS
- Use CSS variables for colors
- Mobile-first approach
- BEM naming convention (optional)
- Avoid inline styles

## Git Workflow

### Branching
```bash
# Feature branch
git checkout -b feature/my-feature
git commit -m "Add my feature"
git push origin feature/my-feature

# Create PR and merge after review
```

### Commit Messages
```
# Good
"Add sticky note voting feature"
"Fix WebSocket reconnection bug"
"Refactor database queries"

# Avoid
"Fixed stuff"
"WIP"
"Update"
```

## Debugging

### Backend Debugging

```typescript
// Add logging
console.log('User:', userId);
console.error('Error:', error);

// Add breakpoints in VS Code
// .vscode/launch.json configuration
```

### Frontend Debugging

```typescript
// React DevTools browser extension
// Redux DevTools for state inspection

// Use console.log
console.log('State:', state);

// Use debugger statement
debugger;  // Pauses in dev tools
```

## Common Issues & Solutions

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### "Cannot connect to database"
```bash
# Check if database is running
docker-compose ps

# Restart database
docker-compose restart postgres
```

### "WebSocket connection failed"
```
- Check server is running
- Verify VITE_WS_URL env var
- Check firewall/proxy settings
```

### "Type errors"
```bash
# Run type check
npx tsc --noEmit

# Fix errors shown
```

## Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=dev_secret
JWT_EXPIRE=7d
```

### Client (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## Docker Development

### View Logs
```bash
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f postgres
```

### Execute Commands
```bash
# Run command in container
docker-compose exec server npm run migrate

# Interactive bash
docker-compose exec server bash
```

### Rebuild Images
```bash
docker-compose up --build
```

## Production Checklist

- [ ] Enable HTTPS
- [ ] Set strong JWT_SECRET
- [ ] Enable CORS properly
- [ ] Set up backups
- [ ] Enable audit logging
- [ ] Set up monitoring
- [ ] Load testing
- [ ] Security audit
- [ ] Performance optimization

## Resources

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Express Docs](https://expressjs.com)
- [Socket.io Docs](https://socket.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Konva.js Docs](https://konvajs.org)

## Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Write/update tests
5. Submit PR with description

---

Happy Coding! 🚀
