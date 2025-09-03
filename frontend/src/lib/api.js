import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || 'https://8001-i8mpnwfzit0pacdos42jp.e2b.app';
const API = `${API_BASE}/api`;

const api = axios.create({
  baseURL: API,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const apiService = {
  // Admin Authentication
  login: (credentials) => api.post('/admin/login', credentials),
  
  // Avatar Management (Admin)
  createAvatar: (avatarData) => api.post('/admin/avatars', avatarData),
  getAvatarsAdmin: () => api.get('/admin/avatars'),
  updateAvatar: (avatarId, avatarData) => api.put(`/admin/avatars/${avatarId}`, avatarData),
  deleteAvatar: (avatarId) => api.delete(`/admin/avatars/${avatarId}`),
  getChatHistory: () => api.get('/admin/chat-history'),
  
  // Public API (No auth required)
  getAvatars: () => api.get('/avatars'),
  getAvatar: (avatarId) => api.get(`/avatars/${avatarId}`),
  chatWithAvatar: (chatData) => api.post('/chat', chatData),
  
  // Models API
  getAvailableModels: () => api.get('/models'),
};

export default api;