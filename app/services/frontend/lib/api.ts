import axios from 'axios';

// Get API base URL
// - If NEXT_PUBLIC_API_URL is empty string (from ConfigMap), use same origin + /api (works with Ingress)
// - If NEXT_PUBLIC_API_URL is set, use that value
// - Otherwise, default to http://localhost:3000 for local development
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Empty string from ConfigMap means use same origin + /api (for Kubernetes/Ingress)
  if (envUrl === '') {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return origin ? `${origin}/api` : '/api';
  }
  
  // If env var is set, use it
  if (envUrl) {
    return envUrl;
  }
  
  // Default: same origin + /api in browser, or localhost:3000 for SSR/local dev
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:3000';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  validate: async () => {
    const response = await api.get('/auth/validate');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  create: async (data: { username: string; email?: string; password?: string }) => {
    const response = await api.post('/users', data);
    return response.data;
  },
  update: async (id: number, data: { email?: string }) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/users/${id}`);
  },
};

// Products API
export const productsAPI = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (data: { name: string; description?: string; price?: number }) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  update: async (id: number, data: { name?: string; description?: string; price?: number }) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/products/${id}`);
  },
};

export default api;

