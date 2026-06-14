export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CanvasObject {
  id: string;
  boardId: string;
  type: 'rectangle' | 'circle' | 'text' | 'sticky' | 'image' | 'link' | 'frame';
  data: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Action {
  id: string;
  boardId: string;
  userId: string;
  actionType: 'create' | 'update' | 'delete' | 'move' | 'resize';
  targetId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  createdAt: Date;
}

export interface StickyVote {
  id: string;
  stickyNoteId: string;
  voterId: string;
  voteValue: number;
  createdAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// WebSocket Events
export interface WSMessage {
  type: 'action' | 'sync' | 'cursor' | 'ping' | 'auth';
  payload: any;
  userId?: string;
  boardId?: string;
}

export interface CursorUpdate {
  userId: string;
  boardId: string;
  x: number;
  y: number;
  color: string;
}
