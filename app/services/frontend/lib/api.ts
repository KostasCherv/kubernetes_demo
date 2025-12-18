import axios from 'axios';

// Get API base URL
// Next.js replaces NEXT_PUBLIC_* env vars at build time
// Strategy: Always use /api prefix when accessing via Ingress (http://localhost without port)
const getApiBaseUrl = () => {
  // In browser context - check the actual origin
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // If accessing via localhost without port (Ingress), always use /api prefix
    if (origin === 'http://localhost' || origin === 'https://localhost') {
      return `${origin}/api`;
    }
    
    // If env var is explicitly set and not empty, use it
    if (envUrl && envUrl.trim() !== '') {
      return envUrl;
    }
    
    // Default: use same origin + /api
    return `${origin}/api`;
  }
  
  // Server-side rendering: default to /api (relative path works with Ingress)
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== '') {
    return envUrl;
  }
  return '/api';
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

