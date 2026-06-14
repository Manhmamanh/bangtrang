import { io, Socket } from 'socket.io-client';
import { useBoardStore } from './store';
import { saveOfflineAction, getUnsyncedActions, markActionSynced } from './offlineDb';
import { Action } from '../types/index';
import { v4 as uuid } from 'uuid';

let socket: Socket | null = null;
let isOnline = true;

export function initWebSocket(token: string, boardId: string) {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

  socket = io(wsUrl, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Connected to WebSocket');
    isOnline = true;
    socket?.emit('join-board', boardId);
    syncOfflineActions();
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from WebSocket');
    isOnline = false;
  });

  socket.on('action', (data) => {
    const store = useBoardStore.getState();
    // Handle incoming action
    if (data.actionType === 'create') {
      store.addObject(data.object);
    } else if (data.actionType === 'update') {
      store.updateObject(data.targetId, data.newData);
    } else if (data.actionType === 'delete') {
      store.deleteObject(data.targetId);
    }
  });

  socket.on('vote-updated', (data) => {
    // Handle vote update
  });

  socket.on('cursor-update', (data) => {
    // Handle cursor update
  });

  return socket;
}

export function sendAction(
  boardId: string,
  actionType: string,
  targetId: string | null,
  oldData: any,
  newData: any
) {
  const action: Action = {
    id: uuid(),
    boardId,
    userId: '', // Will be set by server
    actionType: actionType as any,
    targetId: targetId || undefined,
    oldData,
    newData,
    createdAt: new Date().toISOString(),
  };

  if (isOnline && socket?.connected) {
    socket.emit('action', {
      type: 'action',
      payload: action,
    });
  } else {
    saveOfflineAction({
      id: action.id,
      action,
      synced: false,
      timestamp: Date.now(),
    });
  }
}

export async function syncOfflineActions() {
  if (!socket?.connected) return;

  const unsyncedActions = await getUnsyncedActions();
  for (const offlineAction of unsyncedActions) {
    socket.emit('action', {
      type: 'action',
      payload: offlineAction.action,
    });
    await markActionSynced(offlineAction.id);
  }
}

export function sendVote(stickyId: string, value: number) {
  if (socket?.connected) {
    socket.emit('vote', { stickyId, value });
  }
}

export function moveCursor(x: number, y: number, color: string) {
  if (socket?.connected) {
    socket.emit('cursor-move', { x, y, color });
  }
}

export function closeWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
