import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/auth.js';
import { publishEvent } from '../utils/redis.js';
import { queryOne, query } from '../utils/db.js';
import { WSMessage, CursorUpdate } from '../types/index.js';

interface SocketWithUser extends Socket {
  userId?: string;
  boardId?: string;
}

const activeCursors = new Map<string, CursorUpdate>();

export function initializeWebSocket(httpServer: HTTPServer) {
  const io = new SocketServer(httpServer, {
    cors: { origin: '*' },
  });

  io.use((socket: any, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));

    const payload = verifyToken(token);
    if (!payload) return next(new Error('Invalid token'));

    socket.userId = payload.userId;
    next();
  });

  io.on('connection', (socket: SocketWithUser) => {
    console.log(`User ${socket.userId} connected`);

    // Join board
    socket.on('join-board', async (boardId: string) => {
      try {
        socket.boardId = boardId;
        socket.join(`board:${boardId}`);

        // Broadcast user joined
        io.to(`board:${boardId}`).emit('user-joined', {
          userId: socket.userId,
          boardId,
        });

        // Send active cursors
        const boardCursors = Array.from(activeCursors.values()).filter(
          (c) => c.boardId === boardId
        );
        socket.emit('cursors-sync', boardCursors);
      } catch (error) {
        console.error('Join board error:', error);
      }
    });

    // Handle canvas actions
    socket.on('action', async (data: WSMessage) => {
      try {
        if (!socket.boardId) return;

        const { actionType, targetId, oldData, newData } = data.payload;

        // Save to DB
        await query(
          `INSERT INTO actions (board_id, user_id, action_type, target_id, old_data, new_data)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            socket.boardId,
            socket.userId,
            actionType,
            targetId,
            JSON.stringify(oldData),
            JSON.stringify(newData),
          ]
        );

        // Broadcast to all users in board
        io.to(`board:${socket.boardId}`).emit('action', {
          userId: socket.userId,
          ...data.payload,
        });

        // Publish to Redis for multi-server sync
        await publishEvent(`board:${socket.boardId}`, {
          type: 'action',
          userId: socket.userId,
          ...data.payload,
        });
      } catch (error) {
        console.error('Action error:', error);
      }
    });

    // Cursor tracking
    socket.on('cursor-move', (cursor: CursorUpdate) => {
      if (!socket.boardId) return;

      cursor.userId = socket.userId!;
      cursor.boardId = socket.boardId;
      activeCursors.set(socket.userId!, cursor);

      io.to(`board:${socket.boardId}`).emit('cursor-update', cursor);
    });

    // Voting
    socket.on('vote', async (data: { stickyId: string; value: number }) => {
      try {
        if (!socket.boardId) return;

        await query(
          `INSERT INTO sticky_votes (sticky_note_id, voter_id, vote_value)
           VALUES ($1, $2, $3)
           ON CONFLICT (sticky_note_id, voter_id) DO UPDATE SET vote_value = $3`,
          [data.stickyId, socket.userId, data.value]
        );

        // Get updated vote count
        const votes = await queryOne(
          `SELECT SUM(vote_value) as total FROM sticky_votes WHERE sticky_note_id = $1`,
          [data.stickyId]
        );

        io.to(`board:${socket.boardId}`).emit('vote-updated', {
          stickyId: data.stickyId,
          totalVotes: votes?.total || 0,
        });
      } catch (error) {
        console.error('Vote error:', error);
      }
    });

    // Disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      activeCursors.delete(socket.userId!);

      if (socket.boardId) {
        io.to(`board:${socket.boardId}`).emit('user-left', {
          userId: socket.userId,
        });
      }
    });
  });

  return io;
}
