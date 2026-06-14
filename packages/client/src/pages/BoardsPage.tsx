import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store';
import { boardAPI } from '../utils/api';
import { Board } from '../types/index';
import '../styles/boards.css';

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    try {
      const res = await boardAPI.getMyBoards();
      setBoards(res.data);
    } catch (error) {
      console.error('Failed to load boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await boardAPI.create(name, description);
      setBoards([res.data, ...boards]);
      setName('');
      setDescription('');
      setShowCreate(false);
    } catch (error) {
      console.error('Failed to create board:', error);
    }
  };

  return (
    <div className="boards-container">
      <header className="boards-header">
        <h1>My Whiteboards</h1>
        <div className="header-actions">
          <span>Welcome, {user?.fullName}</span>
          <button onClick={() => logout()} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {showCreate && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Whiteboard</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowCreate(true)}
        className="btn btn-primary create-btn"
      >
        + Create New Board
      </button>

      {loading ? (
        <p className="loading">Loading boards...</p>
      ) : boards.length === 0 ? (
        <p className="empty-state">
          No whiteboards yet. Create one to get started!
        </p>
      ) : (
        <div className="boards-grid">
          {boards.map((board) => (
            <div
              key={board.id}
              className="board-card"
              onClick={() => navigate(`/board/${board.id}`)}
            >
              <div className="board-card-header">
                <h3>{board.name}</h3>
              </div>
              <p className="board-description">{board.description}</p>
              <p className="board-date">
                Updated {new Date(board.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
