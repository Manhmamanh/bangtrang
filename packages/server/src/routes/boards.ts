import { Router } from 'express';
import { queryOne, queryMany, query } from '../utils/db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// Create board
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;

    const board = await queryOne(
      `INSERT INTO boards (name, description, created_by)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description || '', req.userId]
    );

    // Add creator as admin member
    await query(
      `INSERT INTO board_members (board_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [board.id, req.userId]
    );

    res.status(201).json(board);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Get user's boards
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const boards = await queryMany(
      `SELECT b.* FROM boards b
       JOIN board_members bm ON b.id = bm.board_id
       WHERE bm.user_id = $1 AND b.deleted_at IS NULL
       ORDER BY b.updated_at DESC`,
      [req.userId]
    );

    res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ error: 'Failed to get boards' });
  }
});

// Get board by ID
router.get('/:boardId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { boardId } = req.params;

    // Check access
    const member = await queryOne(
      `SELECT * FROM board_members WHERE board_id = $1 AND user_id = $2`,
      [boardId, req.userId]
    );

    if (!member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const board = await queryOne('SELECT * FROM boards WHERE id = $1', [boardId]);
    const objects = await queryMany(
      'SELECT * FROM canvas_objects WHERE board_id = $1 AND deleted_at IS NULL',
      [boardId]
    );
    const members = await queryMany(
      `SELECT bm.*, u.full_name, u.email FROM board_members bm
       JOIN users u ON bm.user_id = u.id WHERE bm.board_id = $1`,
      [boardId]
    );

    res.json({ board, objects, members });
  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ error: 'Failed to get board' });
  }
});

// Add member to board
router.post('/:boardId/members', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { boardId } = req.params;
    const { email, role } = req.body;

    // Check requester is admin
    const requester = await queryOne(
      `SELECT role FROM board_members WHERE board_id = $1 AND user_id = $2`,
      [boardId, req.userId]
    );

    if (requester?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    // Find user by email
    const user = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const member = await queryOne(
      `INSERT INTO board_members (board_id, user_id, role)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING *`,
      [boardId, user.id, role || 'editor']
    );

    res.status(201).json(member);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Get action history
router.get('/:boardId/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { boardId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const actions = await queryMany(
      `SELECT a.*, u.full_name FROM actions a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.board_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2 OFFSET $3`,
      [boardId, limit, offset]
    );

    res.json(actions);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
