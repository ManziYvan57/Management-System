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
    console.log('🔑 Using token for API request:', token.substring(0, 20) + '...');
  } else {
    console.log('⚠️ No token found for API request');
  }

  console.log('🌐 Making API request to:', url);

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url,
        data: data,
        errors: data.errors || data.message
      });
      
      if (response.status === 401) {
        console.error('🔒 Authentication failed - token may be invalid or expired');
        // Clear invalid token
        localStorage.removeItem('token');
        // Redirect to login
        window.location.href = '/login';
      }
      
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    console.log('✅ API request successful:', data);
    return data;
  } catch (error) {
    console.error('❌ API Request Error:', error);
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

// Module API functions
export const garageAPI = {
  getWorkOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/garage/work-orders${queryString ? `?${queryString}` : ''}`);
  },
  
  createWorkOrder: async (workOrderData) => {
    return apiRequest('/garage/work-orders', {
      method: 'POST',
      body: JSON.stringify(workOrderData)
    });
  },
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/garage/stats${queryString ? `?${queryString}` : ''}`);
  }
};

export const inventoryAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/inventory${queryString ? `?${queryString}` : ''}`);
  },
  
  create: async (inventoryData) => {
    return apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(inventoryData)
    });
  },
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/inventory/stats${queryString ? `?${queryString}` : ''}`);
  }
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

// Vehicles API functions
export const vehiclesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/vehicles${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/vehicles/${id}`);
  },
  
  create: async (vehicleData) => {
    return apiRequest('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },
  
  update: async (id, vehicleData) => {
    return apiRequest(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/vehicles/${id}`, {
      method: 'DELETE'
    });
  },
  
  getStats: async () => {
    return apiRequest('/vehicles/stats/overview');
  },
  
  getAvailable: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/vehicles/available${queryString ? `?${queryString}` : ''}`);
  }
};

// Equipment API functions
export const equipmentAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/equipment${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/equipment/${id}`);
  },
  
  create: async (equipmentData) => {
    return apiRequest('/equipment', {
      method: 'POST',
      body: JSON.stringify(equipmentData)
    });
  },
  
  update: async (id, equipmentData) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(equipmentData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/equipment/${id}`, {
      method: 'DELETE'
    });
  },
  
  getStats: async () => {
    return apiRequest('/equipment/stats/overview');
  },
  
  getAvailable: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/equipment/available${queryString ? `?${queryString}` : ''}`);
  }
};

export const personnelAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/personnel${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/personnel/${id}`);
  },
  
  create: async (personnelData) => {
    return apiRequest('/personnel', {
      method: 'POST',
      body: JSON.stringify(personnelData)
    });
  },
  
  update: async (id, personnelData) => {
    return apiRequest(`/personnel/${id}`, {
      method: 'PUT',
      body: JSON.stringify(personnelData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/personnel/${id}`, {
      method: 'DELETE'
    });
  },
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/personnel/stats/overview${queryString ? `?${queryString}` : ''}`);
  },
  
  getDrivers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/personnel/drivers${queryString ? `?${queryString}` : ''}`);
  },
  
  addInfraction: async (id, infractionData) => {
    return apiRequest(`/personnel/${id}/infractions`, {
      method: 'POST',
      body: JSON.stringify(infractionData)
    });
  },
  
  updateInfraction: async (id, infractionId, infractionData) => {
    return apiRequest(`/personnel/${id}/infractions/${infractionId}`, {
      method: 'PUT',
      body: JSON.stringify(infractionData)
    });
  }
};

export const transportAPI = {
  getRoutes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transport/routes${queryString ? `?${queryString}` : ''}`);
  },
  
  getTrips: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transport/trips${queryString ? `?${queryString}` : ''}`);
  },
  
  createTrip: async (tripData) => {
    return apiRequest('/transport/trips', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  },
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transport/stats${queryString ? `?${queryString}` : ''}`);
  }
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
