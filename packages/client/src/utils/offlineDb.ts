import Dexie, { Table } from 'dexie';
import { OfflineAction, CanvasObject } from '../types/index';

export class OfflineDB extends Dexie {
  actions!: Table<OfflineAction>;
  objects!: Table<CanvasObject>;

  constructor() {
    super('tppo-whiteboard');
    this.version(1).stores({
      actions: '++id, synced',
      objects: 'id, boardId',
    });
  }
}

export const offlineDb = new OfflineDB();

export async function saveOfflineAction(action: OfflineAction) {
  return offlineDb.actions.add(action);
}

export async function getUnsyncedActions() {
  return offlineDb.actions.where('synced').equals(false).toArray();
}

export async function markActionSynced(id: string) {
  return offlineDb.actions.update(id, { synced: true });
}

export async function saveObjectsSnapshot(boardId: string, objects: CanvasObject[]) {
  for (const obj of objects) {
    await offlineDb.objects.put({ ...obj, boardId });
  }
}

export async function getOfflineObjects(boardId: string) {
  return offlineDb.objects.where('boardId').equals(boardId).toArray();
}
