import { create } from 'zustand';
import { User, Board, CanvasObject, Action } from '../types/index';

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

interface BoardStore {
  currentBoard: Board | null;
  objects: CanvasObject[];
  members: any[];
  history: Action[];
  selectedObjects: string[];
  setCurrentBoard: (board: Board) => void;
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, data: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;
  setObjects: (objects: CanvasObject[]) => void;
  setMembers: (members: any[]) => void;
  setHistory: (history: Action[]) => void;
  selectObject: (id: string) => void;
  deselectAll: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export const useBoardStore = create<BoardStore>((set) => ({
  currentBoard: null,
  objects: [],
  members: [],
  history: [],
  selectedObjects: [],
  setCurrentBoard: (board) => set({ currentBoard: board }),
  addObject: (obj) => set((state) => ({ objects: [...state.objects, obj] })),
  updateObject: (id, data) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, ...data } : obj
      ),
    })),
  deleteObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((obj) => obj.id !== id),
    })),
  setObjects: (objects) => set({ objects }),
  setMembers: (members) => set({ members }),
  setHistory: (history) => set({ history }),
  selectObject: (id) =>
    set((state) => ({
      selectedObjects: state.selectedObjects.includes(id)
        ? state.selectedObjects.filter((sid) => sid !== id)
        : [...state.selectedObjects, id],
    })),
  deselectAll: () => set({ selectedObjects: [] }),
}));
