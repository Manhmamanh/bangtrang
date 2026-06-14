import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { connectRedis } from './utils/redis';
import { initializeWebSocket } from './services/websocket';
import authRoutes from './routes/auth';
import boardRoutes from './routes/boards';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize WebSocket
initializeWebSocket(httpServer);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function start() {
  try {
    // Try to connect Redis, but don't fail if unavailable
    try {
      await connectRedis();
      console.log('✅ Redis connected');
    } catch (redisError) {
      console.warn('⚠️ Redis unavailable (optional):', (redisError as Error).message);
    }

    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
