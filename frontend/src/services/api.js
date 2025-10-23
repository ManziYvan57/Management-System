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
      // Optional terminal header for backends that read terminal from headers
      ...(localStorage.getItem('selectedTerminal') ? { 'X-Terminal': localStorage.getItem('selectedTerminal') } : {}),
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
      
      // Log detailed validation errors if they exist
      if (data.errors && Array.isArray(data.errors)) {
        console.error('🔍 Validation Errors:');
        data.errors.forEach((error, index) => {
          console.error(`  ${index + 1}. ${error.msg} (Field: ${error.path})`);
        });
      }
      
      if (response.status === 401) {
        console.error('🔒 Authentication failed - token may be invalid or expired');
        // Clear invalid token
        localStorage.removeItem('token');
        // Redirect to login
        window.location.href = '/login';
      }
      
      if (response.status === 403) {
        // Forbidden: show a clear, actionable error but do not log the user out
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const terminal = user?.terminal || 'N/A';
        const reason = data?.message || 'You do not have permission to access this resource.';
        const msg = `Access denied (403). Terminal: ${terminal}. ${reason}`;
        console.warn('🚫 Forbidden:', msg);
        const err = new Error(msg);
        err.status = 403;
        throw err;
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
    // Convert params to URLSearchParams properly
    const queryParams = new URLSearchParams();
    
    // Add all parameters, handling arrays and objects
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `/garage/work-orders${queryString ? `?${queryString}` : ''}`;
    
    console.log('📡 API Call - getWorkOrders:', {
      params,
      queryString,
      url
    });
    
    return apiRequest(url);
  },
  
  createWorkOrder: async (workOrderData) => {
    console.log('📡 API Call - createWorkOrder:', workOrderData);
    return apiRequest('/garage/work-orders', {
      method: 'POST',
      body: JSON.stringify(workOrderData)
    });
  },
  
  getMaintenanceSchedules: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `/garage/maintenance-schedules${queryString ? `?${queryString}` : ''}`;
    
    console.log('📡 API Call - getMaintenanceSchedules:', {
      params,
      queryString,
      url
    });
    
    return apiRequest(url);
  },
  
  createMaintenanceSchedule: async (maintenanceData) => {
    console.log('📡 API Call - createMaintenanceSchedule:', maintenanceData);
    return apiRequest('/garage/maintenance-schedules', {
      method: 'POST',
      body: JSON.stringify(maintenanceData)
    });
  },
  
  getStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `/garage/stats${queryString ? `?${queryString}` : ''}`;
    
    console.log('📡 API Call - getStats:', {
      params,
      queryString,
      url
    });
    
    return apiRequest(url);
  },
  
  updateWorkOrder: async (id, workOrderData) => {
    console.log('📡 API Call - updateWorkOrder:', { id, workOrderData });
    return apiRequest(`/garage/work-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workOrderData)
    });
  },
  
  updateMaintenanceSchedule: async (id, maintenanceData) => {
    console.log('📡 API Call - updateMaintenanceSchedule:', { id, maintenanceData });
    return apiRequest(`/garage/maintenance-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(maintenanceData)
    });
  },
  
  deleteWorkOrder: async (id) => {
    console.log('📡 API Call - deleteWorkOrder:', id);
    return apiRequest(`/garage/work-orders/${id}`, {
      method: 'DELETE'
    });
  },
  
  deleteMaintenanceSchedule: async (id) => {
    console.log('📡 API Call - deleteMaintenanceSchedule:', id);
    return apiRequest(`/garage/maintenance-schedules/${id}`, {
      method: 'DELETE'
    });
  }
};

export const inventoryAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/inventory${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/inventory/${id}`);
  },
  
  create: async (inventoryData) => {
    return apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(inventoryData)
    });
  },
  
  update: async (id, inventoryData) => {
    return apiRequest(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inventoryData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/inventory/${id}`, {
      method: 'DELETE'
    });
  },
  
  updateStock: async (id, stockData) => {
    return apiRequest(`/inventory/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(stockData)
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
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/vehicles/stats/overview${queryString ? `?${queryString}` : ''}`);
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
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/equipment/stats/overview${queryString ? `?${queryString}` : ''}`);
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
  },
  
  deleteInfraction: async (id, infractionId) => {
    return apiRequest(`/personnel/${id}/infractions/${infractionId}`, {
      method: 'DELETE'
    });
  }
};

export const transportAPI = {
  getRoutes: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transport/routes${queryString ? `?${queryString}` : ''}`);
  },
  
  createRoute: async (routeData) => {
    return apiRequest('/transport/routes', {
      method: 'POST',
      body: JSON.stringify(routeData)
    });
  },
  
  updateRoute: async (id, routeData) => {
    return apiRequest(`/transport/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(routeData)
    });
  },
  
  deleteRoute: async (id) => {
    return apiRequest(`/transport/routes/${id}`, {
      method: 'DELETE'
    });
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
  },

  // Daily Schedule API functions
  getDailySchedules: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transport/daily-schedules${queryString ? `?${queryString}` : ''}`);
  },
  
  createDailySchedule: async (scheduleData) => {
    return apiRequest('/transport/daily-schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData)
    });
  },
  
  updateDailySchedule: async (id, scheduleData) => {
    return apiRequest(`/transport/daily-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData)
    });
  },
  
  deleteDailySchedule: async (id) => {
    return apiRequest(`/transport/daily-schedules/${id}`, {
      method: 'DELETE'
    });
  },

  // Smart vehicle suggestions
  getSmartVehicleSuggestions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transport/smart-vehicle-suggestions${queryString ? `?${queryString}` : ''}`);
  },

  // Trip generation from schedules
  generateTrips: async (params = {}) => {
    return apiRequest('/transport/generate-trips', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  // Available resources
  getAvailableVehicles: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transport/available-vehicles${queryString ? `?${queryString}` : ''}`);
  },
  
  getAvailablePersonnel: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/transport/available-personnel${queryString ? `?${queryString}` : ''}`);
  }
};

// Vehicle Documents API functions
export const vehicleDocumentsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/vehicle-documents${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/vehicle-documents/${id}`);
  },
  
  getByVehicle: async (vehicleId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/vehicle-documents/vehicle/${vehicleId}${queryString ? `?${queryString}` : ''}`);
  },
  
  create: async (documentData) => {
    return apiRequest('/vehicle-documents', {
      method: 'POST',
      body: JSON.stringify(documentData)
    });
  },
  
  update: async (id, documentData) => {
    return apiRequest(`/vehicle-documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/vehicle-documents/${id}`, {
      method: 'DELETE'
    });
  },
  
  getExpiringAlerts: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/vehicle-documents/expiring-alerts${queryString ? `?${queryString}` : ''}`);
  },
  
  getComplianceSummary: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/vehicle-documents/compliance-summary${queryString ? `?${queryString}` : ''}`);
  },
  
  bulkUpdateStatus: async (documentIds, status) => {
    return apiRequest('/vehicle-documents/bulk-update-status', {
      method: 'POST',
      body: JSON.stringify({ documentIds, status })
    });
  }
};

// Suppliers API functions
export const suppliersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/suppliers${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/suppliers/${id}`);
  },
  
  create: async (supplierData) => {
    return apiRequest('/suppliers', {
      method: 'POST',
      body: JSON.stringify(supplierData)
    });
  },
  
  update: async (id, supplierData) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(supplierData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/suppliers/${id}`, {
      method: 'DELETE'
    });
  },
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/suppliers/stats/overview${queryString ? `?${queryString}` : ''}`);
  }
};

// Purchase Orders API functions
export const purchaseOrdersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/purchase-orders${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/purchase-orders/${id}`);
  },
  
  create: async (orderData) => {
    return apiRequest('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },
  
  update: async (id, orderData) => {
    return apiRequest(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/purchase-orders/${id}`, {
      method: 'DELETE'
    });
  },
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/purchase-orders/stats${queryString ? `?${queryString}` : ''}`);
  }
};

// Stock Movements API functions
export const stockMovementsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stock-movements${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: async (id) => {
    return apiRequest(`/stock-movements/${id}`);
  },
  
  create: async (movementData) => {
    return apiRequest('/stock-movements', {
      method: 'POST',
      body: JSON.stringify(movementData)
    });
  },
  
  update: async (id, movementData) => {
    return apiRequest(`/stock-movements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(movementData)
    });
  },
  
  delete: async (id) => {
    return apiRequest(`/stock-movements/${id}`, {
      method: 'DELETE'
    });
  },
  
  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/stock-movements/stats${queryString ? `?${queryString}` : ''}`);
  }
};

// Terminals API functions
export const terminalsAPI = {
  getAll: async () => {
    return apiRequest('/terminals');
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
  transportAPI,
  vehicleDocumentsAPI,
  suppliersAPI,
  purchaseOrdersAPI,
  stockMovementsAPI
};
