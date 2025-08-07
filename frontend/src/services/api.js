import axios from 'axios';

// API base URL - use deployed backend on Render
const API_BASE_URL = 'https://trinity-management-system.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Bus Management API
export const busAPI = {
  getStats: () => api.get('/buses/stats/overview'),
  getAll: (params) => api.get('/buses', { params }),
  getById: (id) => api.get(`/buses/${id}`),
  create: (data) => api.post('/buses', data),
  update: (id, data) => api.put(`/buses/${id}`, data),
  delete: (id) => api.delete(`/buses/${id}`),
  search: (query) => api.get('/buses/search', { params: { q: query } }),
};

// Driver Management API
export const driverAPI = {
  getStats: () => api.get('/drivers/stats/overview'),
  getAll: (params) => api.get('/drivers', { params }),
  getById: (id) => api.get(`/drivers/${id}`),
  create: (data) => api.post('/drivers', data),
  update: (id, data) => api.put(`/drivers/${id}`, data),
  delete: (id) => api.delete(`/drivers/${id}`),
  search: (query) => api.get('/drivers/search', { params: { q: query } }),
};

// Schedule Management API
export const scheduleAPI = {
  getStats: () => api.get('/schedules/stats/overview'),
  getAll: (params) => api.get('/schedules', { params }),
  getById: (id) => api.get(`/schedules/${id}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  getAvailableRoutes: () => api.get('/schedules/routes/available'),
};

// Bus Trip Management API
export const busTripAPI = {
  getStats: () => api.get('/bus-trips/stats/overview'),
  getAll: (params) => api.get('/bus-trips', { params }),
  getById: (id) => api.get(`/bus-trips/${id}`),
  create: (data) => api.post('/bus-trips', data),
  update: (id, data) => api.put(`/bus-trips/${id}`, data),
  delete: (id) => api.delete(`/bus-trips/${id}`),
  search: (query) => api.get('/bus-trips/search', { params: { q: query } }),
};

export default api; 