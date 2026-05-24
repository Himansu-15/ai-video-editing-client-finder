import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to inject Authorization header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Endpoints
export const authApi = {
  login: async (data: any) => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  signup: async (data: any) => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Leads Endpoints
export const leadsApi = {
  list: async (params: any) => {
    const res = await api.get('/leads', { params });
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.patch(`/leads/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/leads/${id}`);
    return res.data;
  },
  generateEmail: async (id: string) => {
    const res = await api.post(`/leads/${id}/email`);
    return res.data;
  },
  getExportUrl: (format: 'csv' | 'excel') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
    return `${API_BASE_URL}/leads/export?format=${format}&token=${token}`;
  },
};

// Scraper Endpoints
export const scraperApi = {
  start: async (data: any) => {
    const res = await api.post('/scraper', data);
    return res.data;
  },
  history: async () => {
    const res = await api.get('/scraper/history');
    return res.data;
  },
};

// Settings Endpoints
export const settingsApi = {
  get: async () => {
    const res = await api.get('/settings');
    return res.data;
  },
  update: async (data: any) => {
    const res = await api.post('/settings', data);
    return res.data;
  },
};

// Admin Endpoints
export const adminApi = {
  stats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },
};
export default api;
