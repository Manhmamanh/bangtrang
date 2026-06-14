import axios from 'axios';
import { useAuthStore } from './store';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (email: string, password: string, fullName: string) =>
    api.post('/auth/signup', { email, password, fullName }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const boardAPI = {
  create: (name: string, description?: string) =>
    api.post('/boards', { name, description }),
  getMyBoards: () => api.get('/boards'),
  getBoard: (boardId: string) =>
    api.get(`/boards/${boardId}`),
  addMember: (boardId: string, email: string, role: string) =>
    api.post(`/boards/${boardId}/members`, { email, role }),
  getHistory: (boardId: string, limit = 100, offset = 0) =>
    api.get(`/boards/${boardId}/history`, { params: { limit, offset } }),
};

export default api;
