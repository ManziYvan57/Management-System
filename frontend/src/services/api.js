// Import API configuration
import { getCurrentApiConfig, getApiUrl } from '../config/api.js';

// Get current API configuration
const config = getCurrentApiConfig();
export const API_BASE_URL = config.baseURL;
export const API_PREFIX = config.apiPrefix;
export const API_URL = getApiUrl();

// Helper function to build API endpoints
export const buildApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`;
};

// Common API functions
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  getProfile: async () => {
    return apiRequest('/auth/me');
  },
  
  updateProfile: async (profileData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },
  
  changePassword: async (passwordData) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }
};

// Users API functions
export const usersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/users${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/users/${id}`);
  },
  
  create: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  update: async (id, userData) => {
    return apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/users/${id}`, {
      method: 'DELETE'
    });
  }
};

// Dashboard API functions
export const dashboardAPI = {
  getOverview: async () => {
    return apiRequest('/dashboard/overview');
  },
  
  getFinancials: async () => {
    return apiRequest('/dashboard/financial');
  },
  
  getOperations: async () => {
    return apiRequest('/dashboard/operations');
  },
  
  getMaintenance: async () => {
    return apiRequest('/dashboard/maintenance');
  }
};

// Module API functions (placeholder for future implementation)
export const garageAPI = {
  getWorkOrders: async () => apiRequest('/garage/work-orders'),
  getStats: async () => apiRequest('/garage/stats')
};

export const inventoryAPI = {
  getAll: async () => apiRequest('/inventory'),
  getStats: async () => apiRequest('/inventory/stats')
};

export const assetsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/assets${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/assets/${id}`);
  },
  
  create: async (assetData) => {
    return apiRequest('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData)
    });
  },
  
  update: async (id, assetData) => {
    return apiRequest(`/assets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assetData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/assets/${id}`, {
      method: 'DELETE'
    });
  },
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/assets/stats/overview${queryString ? `?${queryString}` : ''}`);
  }
};

export const personnelAPI = {
  getAll: async () => apiRequest('/personnel'),
  getStats: async () => apiRequest('/personnel/stats')
};

export const transportAPI = {
  getRoutes: async () => apiRequest('/transport/routes'),
  getStats: async () => apiRequest('/transport/stats')
};

export default {
  API_BASE_URL,
  API_PREFIX,
  API_URL,
  buildApiUrl,
  apiRequest,
  authAPI,
  usersAPI,
  dashboardAPI,
  garageAPI,
  inventoryAPI,
  assetsAPI,
  personnelAPI,
  transportAPI
};
