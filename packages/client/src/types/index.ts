export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CanvasObject {
  id: string;
  boardId: string;
  type: 'rectangle' | 'circle' | 'text' | 'sticky' | 'image' | 'link' | 'frame';
  data: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    fill?: string;
    stroke?: string;
    content?: string;
    fontSize?: number;
    url?: string;
    [key: string]: any;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Action {
  id: string;
  boardId: string;
  userId: string;
  actionType: 'create' | 'update' | 'delete' | 'move' | 'resize';
  targetId?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  createdAt: string;
}

export interface CursorUpdate {
  userId: string;
  boardId: string;
  x: number;
  y: number;
  color: string;
}

export interface OfflineAction {
  id: string;
  action: Action;
  synced: boolean;
  timestamp: number;
}
