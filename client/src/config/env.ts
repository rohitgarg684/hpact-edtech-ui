// Environment Configuration for Easy Base URL Management
// This file makes it super easy to configure backend base URLs

// Quick Base URL Configuration
// Just set ONE of these and the system will use it:

export const BASE_URL_CONFIGS = {
  // Option 1: Direct base URL (highest priority)
  // Uncomment and set to override everything else:
  // DIRECT_BASE_URL: "https://your-api-domain.com",
  
  // Option 2: Use environment variables in .env.local:
  // VITE_API_BASE_URL=https://your-api-domain.com
  // VITE_API_ENV=production
  
  // Option 3: Quick presets for common scenarios
  PRESETS: {
    localExpress: "",                           // Same origin (current Express server)
    localFastAPI: "http://localhost:8000",     // Local FastAPI server
    staging: "https://your-staging-api.com",   // Staging server
    production: "https://your-prod-api.com",   // Production server
  }
} as const;

// Environment Detection
export const ENV_INFO = {
  isProduction: import.meta.env.NODE_ENV === 'production',
  isDevelopment: import.meta.env.NODE_ENV === 'development',
  current: import.meta.env.NODE_ENV || 'development',
  
  // API Environment Variables
  apiEnv: import.meta.env.VITE_API_ENV,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  
  // Quick setup helpers
  isUsingCustomBaseUrl: !!import.meta.env.VITE_API_BASE_URL,
  isUsingCustomApiEnv: !!import.meta.env.VITE_API_ENV,
} as const;

// Quick Setup Functions
export const quickSetup = {
  // Use when developing with local Express server (default)
  useLocalExpress: () => BASE_URL_CONFIGS.PRESETS.localExpress,
  
  // Use when connecting to local FastAPI server
  useLocalFastAPI: () => BASE_URL_CONFIGS.PRESETS.localFastAPI,
  
  // Use for staging environment
  useStaging: () => BASE_URL_CONFIGS.PRESETS.staging,
  
  // Use for production
  useProduction: () => BASE_URL_CONFIGS.PRESETS.production,
  
  // Custom base URL
  useCustom: (baseUrl: string) => baseUrl,
} as const;

// Debug helper to see current configuration
export const debugApiConfig = () => {
  if (ENV_INFO.isDevelopment) {
    console.group('🔧 API Configuration Debug');
    console.log('Environment:', ENV_INFO.current);
    console.log('API Environment Variable:', ENV_INFO.apiEnv || 'not set');
    console.log('API Base URL Variable:', ENV_INFO.apiBaseUrl || 'not set');
    console.log('Using Custom Base URL:', ENV_INFO.isUsingCustomBaseUrl);
    console.log('Using Custom API Env:', ENV_INFO.isUsingCustomApiEnv);
    console.groupEnd();
  }
};