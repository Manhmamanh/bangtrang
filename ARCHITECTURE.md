# 🏗️ Architecture - TPPO Whiteboard

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          TPPO WHITEBOARD                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐   ┌──────────────┐ │
│  │   Browser    │         │   Browser    │   │   Browser    │ │
│  │   (React)    │─────┐   │   (React)    │───┤   (React)    │ │
│  │              │     │   │              │   │              │ │
│  └──────────────┘     │   └──────────────┘   └──────────────┘ │
│                       │                            │            │
│                       │ Socket.io                  │            │
│                       │ (Real-time)                │            │
│                       ▼                            ▼            │
│        ┌─────────────────────────────────────────────────┐     │
│        │   Express Server (Node.js)                     │     │
│        │                                                 │     │
│        │  ┌──────────────────────────────────────────┐ │     │
│        │  │         Socket.io Handler                │ │     │
│        │  │  - Join board room                       │ │     │
│        │  │  - Handle canvas actions                 │ │     │
│        │  │  - Broadcast updates                     │ │     │
│        │  │  - Track cursor position                 │ │     │
│        │  │  - Handle voting                         │ │     │
│        │  └──────────────────────────────────────────┘ │     │
│        │                    │                           │     │
│        │  ┌─────────────────▼──────────────────────┐   │     │
│        │  │      API Routes (REST)                │   │     │
│        │  │  - /auth (signup, login)              │   │     │
│        │  │  - /boards (CRUD)                     │   │     │
│        │  │  - /boards/:id/history                │   │     │
│        │  │  - /boards/:id/members                │   │     │
│        │  └──────────────────────────────────────────┘ │     │
│        │                                                 │     │
│        └─────┬─────────────────────────────┬───────────┘     │
│              │                             │                  │
│         PostgreSQL               Redis (Pub/Sub)              │
│         (Persistence)            (Caching & Sync)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture Layers

### 1. Presentation Layer (Browser)

**React Components:**
- `LoginPage` - Authentication
- `BoardsPage` - Board listing
- `EditorPage` - Main canvas editor
- `BrainstormTimer` - Special feature
- `StickyVotingPanel` - Special feature

**State Management:**
- Zustand store (auth, boards, canvas)
- React hooks for UI state
- IndexedDB for offline cache

### 2. API Layer (Socket.io + REST)

**Socket.io (Real-time):**
- Bidirectional communication
- Low latency updates
- Broadcast to room

**REST API:**
- Authentication
- Board CRUD
- History retrieval
- User management

### 3. Business Logic Layer

**Services:**
- WebSocket service (real-time sync)
- Auth service (JWT)
- Board service
- Action service

### 4. Data Layer

**PostgreSQL:**
- Users
- Boards
- Canvas objects
- Actions (audit trail)
- Votes

**Redis:**
- Session caching
- Pub/Sub for multi-server
- Real-time data cache

---

## Data Flow

### Creating an Object

```
User (Canvas)
    ↓
handleMouseUp() [EditorPage.tsx]
    ↓
addObject() [Zustand store]
    ↓
sendAction() [websocket.ts]
    ↓
socket.emit('action') [Socket.io]
    ↓
Server: socket.on('action')
    ↓
Save to DB + Publish to Redis
    ↓
Broadcast to all clients in room
    ↓
socket.on('action') [Client listeners]
    ↓
updateObject() [Zustand store]
    ↓
Re-render Canvas [React]
```

### Real-time Sync (Multiple Users)

```
User A edits object
    ↓
User A: socket.emit('action', {...})
    ↓
Server receives & saves
    ↓
Server broadcasts to room (including User A)
    ↓
User A: socket.on('action') → update state
User B: socket.on('action') → update state
    ↓
Both see the same updated object
```

### Offline Mode

```
Network Down
    ↓
User A works normally (all actions UI works)
    ↓
sendAction() → Check if online
    ↓
If offline: saveOfflineAction() → IndexedDB
    ↓
No socket emit
    ↓
Network Up
    ↓
syncOfflineActions()
    ↓
Retrieve unsynced from IndexedDB
    ↓
socket.emit() for each
    ↓
Server processes
    ↓
Client receives confirmation
    ↓
markActionSynced() → IndexedDB
```

### Voting System

```
User clicks vote button
    ↓
handleVote(stickyId, value)
    ↓
sendVote(stickyId, value)
    ↓
socket.emit('vote', {...})
    ↓
Server: socket.on('vote')
    ↓
INSERT/UPDATE sticky_votes table
    ↓
SELECT SUM(vote_value) for this sticky
    ↓
Broadcast: emit('vote-updated', {...})
    ↓
All clients: socket.on('vote-updated')
    ↓
Update UI with new vote count
```

---

## Database Schema

### Users Table
```sql
users
├── id (UUID, PK)
├── email (VARCHAR, UNIQUE)
├── password_hash (VARCHAR)
├── full_name (VARCHAR)
├── avatar_url (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Boards Table
```sql
boards
├── id (UUID, PK)
├── name (VARCHAR)
├── description (TEXT)
├── created_by (UUID, FK → users)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP, soft delete)
```

### Board Members Table
```sql
board_members
├── id (UUID, PK)
├── board_id (UUID, FK)
├── user_id (UUID, FK)
├── role (VARCHAR: 'admin', 'editor', 'viewer')
└── joined_at (TIMESTAMP)
```

### Canvas Objects Table
```sql
canvas_objects
├── id (UUID, PK)
├── board_id (UUID, FK)
├── type (VARCHAR: 'rectangle', 'circle', 'text', 'sticky', etc)
├── data (JSONB: {x, y, width, height, fill, stroke, content, ...})
├── created_by (UUID, FK → users)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP)
```

### Actions Table (Audit Trail)
```sql
actions
├── id (UUID, PK)
├── board_id (UUID, FK)
├── user_id (UUID, FK)
├── action_type (VARCHAR: 'create', 'update', 'delete', 'move', 'resize')
├── target_id (UUID)
├── old_data (JSONB)
├── new_data (JSONB)
└── created_at (TIMESTAMP)
```

### Sticky Votes Table
```sql
sticky_votes
├── id (UUID, PK)
├── sticky_note_id (UUID, FK → canvas_objects)
├── voter_id (UUID, FK → users)
├── vote_value (INT: 1 or -1)
└── created_at (TIMESTAMP)
```

---

## WebSocket Events

### Client → Server

```
join-board
├── boardId: string

action
├── type: 'action'
├── payload:
│   ├── actionType: 'create' | 'update' | 'delete' | 'move' | 'resize'
│   ├── targetId: string
│   ├── oldData: object
│   └── newData: object

cursor-move
├── x: number
├── y: number
├── color: string

vote
├── stickyId: string
└── value: number (1 or -1)
```

### Server → Client

```
action
├── userId: string
├── actionType: string
├── targetId: string
├── oldData: object
└── newData: object

vote-updated
├── stickyId: string
└── totalVotes: number

cursor-update
├── userId: string
├── x: number
├── y: number
└── color: string

user-joined
├── userId: string
└── boardId: string

user-left
└── userId: string

cursors-sync
└── array of cursor positions
```

---

## Authentication Flow

```
Signup
    ↓
POST /api/auth/signup {email, password, fullName}
    ↓
Hash password with bcrypt
    ↓
INSERT into users table
    ↓
Generate JWT token
    ↓
Return {user, token}
    ↓
Client: Save token to localStorage
    ↓
Set Authorization header for future requests

Login
    ↓
POST /api/auth/login {email, password}
    ↓
Find user by email
    ↓
Compare password with hash
    ↓
Generate JWT token
    ↓
Return {user, token}
    ↓
Client: Save token & user info

Protected Routes
    ↓
Include token in Authorization header
    ↓
Server: Verify token middleware
    ↓
Extract userId from JWT
    ↓
Proceed with request
```

---

## Conflict Resolution

### Last-Write-Wins (LWW)

When offline user syncs:
```
Server has: Object v2 (timestamp: 1000)
Client has: Object v3 (timestamp: 500)

↓

Client timestamp < Server timestamp
→ Server version wins
→ Client receives server version
```

### Timestamp Strategy

```typescript
// Always include timestamp
{
  id: "obj-123",
  data: {...},
  updatedAt: 1686534500000  // milliseconds
}

// When syncing
if (incomingTimestamp > localTimestamp) {
  // Accept incoming
} else {
  // Keep local
}
```

---

## Caching Strategy

### Redis Cache

```
Key: board:{boardId}
Value: {
  id, name, description,
  members: [{...}]
}
TTL: 1 hour

Key: user:{userId}
Value: {
  id, email, fullName
}
TTL: 24 hours
```

### IndexedDB Cache (Offline)

```
Store: actions
├── Object {id, action, synced, timestamp}

Store: objects
├── Object {id, boardId, type, data, ...}
```

---

## Scalability Considerations

### Current Limits
- ~30 concurrent users per board
- ~1000 objects per board
- ~10K actions per board

### Scaling Options

**Vertical Scaling:**
- Increase server resources
- Database optimization
- Redis tuning

**Horizontal Scaling:**
- Multiple Node servers
- Redis Pub/Sub for sync
- Load balancer (nginx)

**Database Scaling:**
- Read replicas
- Partition by board
- Archive old actions

---

## Security Measures

### Authentication
- JWT tokens (signed)
- Password hashing (bcrypt)
- Session timeout

### Authorization
- Role-based access control
- Board member check
- API endpoint protection

### Data Protection
- HTTPS/TLS
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)
- CSRF protection (SameSite cookies)

### Audit Trail
- All actions logged
- User attribution
- Timestamp recording
- Immutable history

---

## Error Handling

### Client-Side
```typescript
try {
  await api.call()
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  } else if (error.response?.status === 403) {
    // Show permission denied
  } else {
    // Show generic error
  }
}
```

### Server-Side
```typescript
try {
  // Process request
} catch (error) {
  console.error(error);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
}
```

---

## Performance Optimization

### Frontend
- Code splitting with React.lazy
- Image compression
- CSS minification
- Bundle analysis

### Backend
- Query optimization (indexes)
- Connection pooling
- Caching frequently accessed data
- Lazy loading

### Network
- WebSocket for low-latency
- Batch updates
- Delta compression
- CDN for static assets

---

## Monitoring & Logging

### Application Logs
```
[2024-06-14 10:30:45] INFO: Server started
[2024-06-14 10:30:46] INFO: User signed up (user-123)
[2024-06-14 10:30:47] INFO: Board created (board-456)
[2024-06-14 10:30:48] ERROR: Database connection failed
```

### Metrics to Track
- API response time
- WebSocket latency
- Database query performance
- User concurrent connections
- Error rate

---

## Testing Strategy

### Unit Tests
- Utilities functions
- Store logic
- Validation functions

### Integration Tests
- API endpoints
- Database operations
- WebSocket events

### E2E Tests
- User signup/login
- Create board
- Draw objects
- Voting workflow

---

This architecture is designed to be:
- **Scalable** - Handle 30+ concurrent users
- **Reliable** - No data loss even offline
- **Responsive** - Real-time updates
- **Secure** - Auth, audit trail, access control
