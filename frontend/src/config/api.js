// API Configuration - Update this with your actual Render URL
export const API_CONFIG = {
  // Development (localhost)
  development: {
    baseURL: 'http://localhost:5000',
    apiPrefix: '/api'
  },
  // Production (Render) - friend backend on Render
  production: {
    baseURL: 'https://management-system-08nb.onrender.com',
    apiPrefix: '/api'
  }
};

// Helper to get current environment
export const getCurrentEnvironment = () => {
  // Force production mode to use Render backend
  return 'production';
};

// Helper to get current API config
export const getCurrentApiConfig = () => {
  const env = getCurrentEnvironment();
  return API_CONFIG[env];
};

// Export current API URL
export const getApiUrl = () => {
  const config = getCurrentApiConfig();
  return `${config.baseURL}${config.apiPrefix}`;
};

// Log current configuration (for debugging)
console.log('🔧 API Configuration:', {
  environment: getCurrentEnvironment(),
  baseURL: getCurrentApiConfig().baseURL,
  apiPrefix: getCurrentApiConfig().apiPrefix,
  fullApiUrl: getApiUrl()
});
