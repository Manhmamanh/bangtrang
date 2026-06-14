# TPPO Whiteboard 🎨

Real-time collaborative whiteboard application for brainstorming and team collaboration.

## Features

### Core Features
- ✅ Unlimited canvas with real-time collaboration (up to 30 concurrent users)
- ✅ Multiple drawing tools (rectangles, circles, text, sticky notes)
- ✅ Drag & drop support for all objects
- ✅ Full action history tracking with audit trail
- ✅ Offline-first architecture with automatic sync
- ✅ User presence indicators & member list
- ✅ Multi-format export (PNG, SVG, PDF)
- ✅ Mobile responsive design

### Special Features
- 🎵 **Brainstorm Timer Widget** - Countdown timer with lo-fi background music for focused sessions
- 🗳️ **Sticky Note Voting** - Anonymous voting system for idea evaluation (👍 +1 / 👎 -1)
- 💬 **Comment Threads** - Discuss specific objects with inline comments
- 🚀 **Smart Templates** - Pre-built templates for retrospectives, roadmaps, etc.
- 👥 **Role-based Access** - Admin/Editor/Viewer roles with granular permissions
- 📊 **Version History** - Revert to any point in time
- 🎯 **Layers & Frames** - Organize canvas into sections, group objects

## Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL for persistence
- Redis for real-time sync & caching
- Socket.io for WebSocket communication
- JWT authentication

**Frontend:**
- React 18 + TypeScript
- Konva.js for canvas rendering
- Socket.io client for real-time updates
- Zustand for state management
- Dexie for offline storage (IndexedDB)
- Vite for building

**DevOps:**
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (optional, for local development)

### Setup with Docker

```bash
# Clone and navigate to project
cd tppo-whiteboard

# Start all services
docker-compose up

# Services will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Database: localhost:5432
# Redis: localhost:6379
```

### Local Development (without Docker)

1. **Setup Backend:**
```bash
cd packages/server
npm install
cp .env.example .env
npm run migrate  # Setup database
npm run dev
```

2. **Setup Frontend:**
```bash
cd packages/client
npm install
npm run dev
```

## API Routes

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Boards
- `POST /api/boards` - Create board
- `GET /api/boards` - List user's boards
- `GET /api/boards/:boardId` - Get board details
- `POST /api/boards/:boardId/members` - Add member
- `GET /api/boards/:boardId/history` - Action history

## WebSocket Events

### Client → Server
- `join-board` - Join board room
- `action` - Canvas action (create/update/delete/move)
- `vote` - Vote on sticky notes
- `cursor-move` - Broadcast cursor position
- `comment` - Post comment on object

### Server → Client
- `action` - Incoming action from other users
- `vote-updated` - Vote count updated
- `cursor-update` - User cursor moved
- `user-joined` / `user-left` - Member presence
- `comment-added` - New comment

## Database Schema

**Users** - User accounts with authentication
**Boards** - Whiteboards with metadata
**Board Members** - User board access & roles
**Canvas Objects** - All shapes, text, images on canvas
**Actions** - Complete history of all changes
**Sticky Votes** - Anonymous votes on sticky notes
**Comments** - Discussion threads on objects

## Offline Support

The app uses IndexedDB (Dexie) to cache:
- Canvas objects snapshot
- Offline action queue
- User data

When connection is lost:
1. All actions are queued locally
2. UI continues to work normally
3. When reconnected, changes auto-sync
4. Conflict resolution uses last-write-wins strategy

## Performance Optimization

- Lazy load board data
- Redis caching for frequent queries
- Connection pooling for database
- Image compression on export
- WebSocket rooms for broadcast efficiency

## Development

### Project Structure
```
tppo-whiteboard/
├── packages/
│   ├── server/
│   │   ├── src/
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── services/      # Business logic
│   │   │   ├── middleware/    # Auth, error handling
│   │   │   ├── db/            # Database queries
│   │   │   └── utils/         # Helpers
│   │   └── Dockerfile
│   │
│   └── client/
│       ├── src/
│       │   ├── pages/         # Page components
│       │   ├── components/    # Reusable components
│       │   ├── services/      # API & WebSocket
│       │   ├── utils/         # Store, offline DB
│       │   ├── types/         # TypeScript types
│       │   └── styles/        # Global CSS
│       └── Dockerfile.dev
│
└── docker-compose.yml
```

### Code Style
- TypeScript strict mode enabled
- ESLint ready (add .eslintrc.json as needed)
- Prettier config available

## Future Enhancements

- [ ] Video/audio chat integration
- [ ] Built-in timer with Spotify/YouTube music
- [ ] AI-powered summary of discussions
- [ ] Integrations (Slack, Jira, Figma)
- [ ] Mobile app (React Native)
- [ ] Multi-board collaboration
- [ ] Drawing/freehand sketching
- [ ] Collaborative cursor positions
- [ ] Google Sheets import/export

## Troubleshooting

**"Cannot connect to WebSocket"**
- Check server is running: `http://localhost:3000/health`
- Verify VITE_WS_URL environment variable

**"Database connection failed"**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run migrations: `npm run migrate`

**"Offline changes not syncing"**
- Check browser's IndexedDB (DevTools > Application)
- Verify network connection restored
- Check WebSocket connection status

## License

Proprietary - TPPO Internal Use

## Support

For issues and feature requests, contact: hangdt@f88.vn
