import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Rect, Text, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { useBoardStore, useAuthStore } from '../utils/store';
import { boardAPI } from '../utils/api';
import { initWebSocket, sendAction, closeWebSocket, sendVote } from '../utils/websocket';
import { v4 as uuid } from 'uuid';
import '../styles/editor.css';

export default function EditorPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const {
    currentBoard,
    objects,
    members,
    selectedObjects,
    setCurrentBoard,
    setObjects,
    setMembers,
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    deselectAll,
  } = useBoardStore();

  const [toolMode, setToolMode] = useState<'select' | 'rect' | 'circle' | 'text' | 'sticky'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [showVotePanel, setShowVotePanel] = useState(false);

  useEffect(() => {
    if (!boardId || !token) return;

    const loadBoard = async () => {
      try {
        const res = await boardAPI.getBoard(boardId);
        setCurrentBoard(res.data.board);
        setObjects(res.data.objects);
        setMembers(res.data.members);

        initWebSocket(token, boardId);
      } catch (error) {
        console.error('Failed to load board:', error);
        navigate('/');
      }
    };

    loadBoard();

    return () => {
      closeWebSocket();
    };
  }, [boardId, token, setCurrentBoard, setObjects, setMembers, navigate]);

  const handleMouseDown = (e: any) => {
    if (toolMode === 'select') return;

    const pos = e.target.getStage().getPointerPosition();
    setIsDrawing(true);
    setStartPos(pos);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !stageRef.current) return;

    const pos = stageRef.current.getPointerPosition();
    const width = Math.abs(pos.x - startPos.x);
    const height = Math.abs(pos.y - startPos.y);

    if (width > 10 && height > 10) {
      const newObject = {
        id: uuid(),
        boardId: boardId!,
        type: toolMode as any,
        data: {
          x: Math.min(startPos.x, pos.x),
          y: Math.min(startPos.y, pos.y),
          width,
          height,
          fill: toolMode === 'sticky' ? '#ffd700' : '#e3f2fd',
          stroke: '#1976d2',
          strokeWidth: 2,
          content: toolMode === 'sticky' || toolMode === 'text' ? 'Edit me' : '',
          fontSize: 14,
          rotation: 0,
        },
        createdBy: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addObject(newObject);
      sendAction(boardId!, 'create', newObject.id, null, newObject);
    }

    setIsDrawing(false);
  };

  const handleObjectSelect = (objId: string) => {
    selectObject(objId);
  };

  const handleDelete = () => {
    selectedObjects.forEach((id) => {
      deleteObject(id);
      sendAction(boardId!, 'delete', id, null, null);
    });
    deselectAll();
  };

  const handleExport = async (format: 'png' | 'svg' | 'pdf') => {
    if (!stageRef.current) return;

    const uri = stageRef.current.toDataURL();
    const link = document.createElement('a');
    link.href = uri;
    link.download = `board_${boardId}.${format === 'pdf' ? 'pdf' : format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentBoard) {
    return <div className="loading-editor">Loading whiteboard...</div>;
  }

  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="header-left">
          <button onClick={() => navigate('/')} className="back-btn">
            ← Back
          </button>
          <h1>{currentBoard.name}</h1>
        </div>
        <div className="header-middle">
          <div className="toolbar">
            <button
              className={`tool-btn ${toolMode === 'select' ? 'active' : ''}`}
              onClick={() => setToolMode('select')}
              title="Select"
            >
              ⬚ Select
            </button>
            <button
              className={`tool-btn ${toolMode === 'rect' ? 'active' : ''}`}
              onClick={() => setToolMode('rect')}
              title="Rectangle"
            >
              ▭ Rect
            </button>
            <button
              className={`tool-btn ${toolMode === 'circle' ? 'active' : ''}`}
              onClick={() => setToolMode('circle')}
              title="Circle"
            >
              ◯ Circle
            </button>
            <button
              className={`tool-btn ${toolMode === 'text' ? 'active' : ''}`}
              onClick={() => setToolMode('text')}
              title="Text"
            >
              A Text
            </button>
            <button
              className={`tool-btn ${toolMode === 'sticky' ? 'active' : ''}`}
              onClick={() => setToolMode('sticky')}
              title="Sticky Note"
            >
              📌 Sticky
            </button>
          </div>
        </div>
        <div className="header-right">
          <button onClick={() => setShowVotePanel(!showVotePanel)} className="btn btn-secondary">
            🗳️ Vote
          </button>
          <button onClick={() => handleDelete()} className="btn btn-secondary">
            🗑️ Delete
          </button>
          <div className="export-menu">
            <button className="btn btn-secondary">⬇️ Export</button>
            <div className="export-options">
              <button onClick={() => handleExport('png')}>PNG</button>
              <button onClick={() => handleExport('svg')}>SVG</button>
              <button onClick={() => handleExport('pdf')}>PDF</button>
            </div>
          </div>
        </div>
      </header>

      <div className="editor-content">
        <Stage
          ref={stageRef}
          width={window.innerWidth - 300}
          height={window.innerHeight - 100}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          style={{ cursor: toolMode === 'select' ? 'default' : 'crosshair' }}
        >
          <Layer ref={layerRef}>
            {objects.map((obj) => (
              <Rect
                key={obj.id}
                x={obj.data.x}
                y={obj.data.y}
                width={obj.data.width}
                height={obj.data.height}
                fill={obj.data.fill}
                stroke={selectedObjects.includes(obj.id) ? '#d32f2f' : obj.data.stroke}
                strokeWidth={selectedObjects.includes(obj.id) ? 3 : obj.data.strokeWidth}
                onClick={() => handleObjectSelect(obj.id)}
                draggable
                onDragEnd={(e) => {
                  updateObject(obj.id, {
                    data: { ...obj.data, x: e.target.x(), y: e.target.y() },
                  });
                  sendAction(boardId!, 'move', obj.id, obj.data, {
                    ...obj.data,
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
              />
            ))}
          </Layer>
        </Stage>

        <aside className="editor-sidebar">
          <div className="sidebar-section">
            <h3>Members ({members.length})</h3>
            <ul className="members-list">
              {members.map((m) => (
                <li key={m.user_id}>
                  <span className="member-dot" style={{ backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)` }} />
                  {m.full_name}
                </li>
              ))}
            </ul>
          </div>

          {showVotePanel && (
            <div className="sidebar-section">
              <h3>Vote Sticky Notes</h3>
              <div className="vote-items">
                {objects
                  .filter((o) => o.type === 'sticky')
                  .map((sticky) => (
                    <div key={sticky.id} className="vote-item">
                      <p>{sticky.data.content}</p>
                      <div className="vote-buttons">
                        <button onClick={() => sendVote(sticky.id, 1)}>👍 +1</button>
                        <button onClick={() => sendVote(sticky.id, -1)}>👎 -1</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="sidebar-section">
            <h3>Properties</h3>
            {selectedObjects.length > 0 ? (
              <p>Edit objects by dragging on canvas</p>
            ) : (
              <p>Select an object to edit</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
