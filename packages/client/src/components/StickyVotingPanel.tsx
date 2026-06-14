import React, { useState } from 'react';
import { useBoardStore } from '../utils/store';
import { sendVote } from '../utils/websocket';
import '../styles/voting.css';

export default function StickyVotingPanel() {
  const objects = useBoardStore((s) => s.objects);
  const stickyNotes = objects.filter((o) => o.type === 'sticky');
  const [votes, setVotes] = useState<Record<string, number>>({});

  if (stickyNotes.length === 0) {
    return (
      <div className="voting-panel empty">
        <p>📌 No sticky notes yet</p>
        <small>Create sticky notes to enable voting</small>
      </div>
    );
  }

  const handleVote = (stickyId: string, value: number) => {
    setVotes((prev) => ({
      ...prev,
      [stickyId]: prev[stickyId] === value ? 0 : value,
    }));
    sendVote(stickyId, value);
  };

  // Calculate votes (simplified - in production would come from server)
  const stickyStats = stickyNotes.map((sticky) => ({
    id: sticky.id,
    content: sticky.data.content || 'Untitled',
    userVote: votes[sticky.id] || 0,
  }));

  return (
    <div className="voting-panel">
      <h3>🗳️ Anonymous Voting</h3>
      <p className="voting-subtitle">Vote on ideas (👍 or 👎)</p>

      <div className="voting-items">
        {stickyStats.map((sticky, idx) => (
          <div key={sticky.id} className="voting-item">
            <div className="voting-content">
              <span className="voting-number">#{idx + 1}</span>
              <p className="voting-text">{sticky.content}</p>
            </div>

            <div className="voting-buttons">
              <button
                onClick={() => handleVote(sticky.id, 1)}
                className={`vote-btn upvote ${sticky.userVote === 1 ? 'active' : ''}`}
              >
                👍
              </button>
              <button
                onClick={() => handleVote(sticky.id, -1)}
                className={`vote-btn downvote ${sticky.userVote === -1 ? 'active' : ''}`}
              >
                👎
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="voting-info">
        <small>
          💡 Your votes are anonymous and can be changed anytime
        </small>
      </div>
    </div>
  );
}
