const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// CORS middleware - aggressive override
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';

  // Remove any existing CORS headers set by Railway
  res.removeHeader('Access-Control-Allow-Origin');

  // Set our own
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'TPPO Whiteboard API is alive!'
  });
});

// API Status
app.get('/api/status', (req, res) => {
  res.json({
    message: 'TPPO Whiteboard API is running',
    version: '0.0.1',
    node_version: process.version
  });
});

// Auth Routes (Mock - replace with real auth when DB ready)
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Mock response - will integrate with database
    res.status(201).json({
      user: {
        id: 'user_' + Date.now(),
        email,
        fullName
      },
      token: 'mock_token_' + Date.now(),
      message: 'Account created successfully (mock)'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed', message: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Mock response - will integrate with database
    res.json({
      user: {
        id: 'user_mock',
        email,
        fullName: 'Mock User'
      },
      token: 'mock_token_' + Date.now(),
      message: 'Logged in successfully (mock)'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    id: 'user_mock',
    email: 'test@example.com',
    fullName: 'Mock User'
  });
});

// Mock in-memory storage
const boards = {};

app.get('/api/boards', (req, res) => {
  res.json(Object.values(boards));
});

app.post('/api/boards', (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Board name required' });
    }

    const boardId = 'board_' + Date.now();
    const newBoard = {
      id: boardId,
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      elements: [],
      members: ['user_mock']
    };

    boards[boardId] = newBoard;

    res.status(201).json(newBoard);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board', message: error.message });
  }
});

app.get('/api/boards/:boardId', (req, res) => {
  const board = boards[req.params.boardId];
  if (!board) {
    return res.status(404).json({ error: 'Board not found' });
  }
  res.json(board);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: POST http://localhost:${PORT}/api/auth/signup`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
