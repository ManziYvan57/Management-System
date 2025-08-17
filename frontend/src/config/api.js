// API Configuration - Update this with your actual Render URL
export const API_CONFIG = {
  // Development (localhost)
  development: {
    baseURL: 'http://localhost:5000',
    apiPrefix: '/api'
  },
  // Production (Render) - UPDATE THIS URL!
  production: {
    baseURL: 'https://trinity-management-backend.onrender.com', // ⚠️ UPDATE THIS WITH YOUR ACTUAL RENDER URL
    apiPrefix: '/api'
  }
};

// Helper to get current environment
export const getCurrentEnvironment = () => {
  return import.meta.env.DEV ? 'development' : 'production';
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
