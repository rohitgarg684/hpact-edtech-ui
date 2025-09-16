// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  endpoints: {
    // Authentication endpoints
    register: string;
    login: string;
    logout: string;
    user: string;
    
    // Chat endpoints
    chat: string;
    saveChat: string;
    
    // Future endpoints can be added here
    // sessions: string;
    // messages: string;
  };
}

// Environment-specific configurations
const configs: Record<string, ApiConfig> = {
  // Development server (same origin)
  development: {
    baseUrl: "", // Same origin - no CORS issues
    timeout: 30000,
    endpoints: {
      register: "/register",
      login: "/login", 
      logout: "/logout",
      user: "/user",
      chat: "/chat",
      saveChat: "/save-chat",
    },
  },

  // Local development with external backend
  local: {
    baseUrl: "http://0.0.0.0:8000", // External backend for local dev
    timeout: 30000,
    endpoints: {
      register: "/register",
      login: "/login", 
      logout: "/logout",
      user: "/user",
      chat: "/chat",
      saveChat: "/save-chat",
    },
  },

  // Production server
  production: {
    baseUrl: "https://your-api-domain.com", // Change this to your production URL
    timeout: 30000,
    endpoints: {
      register: "/register",
      login: "/login",
      logout: "/logout",
      user: "/user", 
      chat: "/chat",
      saveChat: "/save-chat",
    },
  },
};

// Get base URL from environment variables with fallbacks
const getBaseUrl = (): string => {
  // 1. Check for explicit base URL override
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 2. Check for environment-specific config
  const apiEnv = import.meta.env.VITE_API_ENV;
  if (apiEnv && configs[apiEnv]) {
    return configs[apiEnv].baseUrl;
  }
  
  // 3. Use NODE_ENV to determine default
  const nodeEnv = import.meta.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return configs.production.baseUrl;
    case 'development':
    default:
      return configs.development.baseUrl; // Default to development (same-origin)
  }
};

// Get the current environment from environment variables or default to 'local'
const getCurrentEnvironment = (): string => {
  // Check for explicit API environment override
  if (import.meta.env.VITE_API_ENV) {
    return import.meta.env.VITE_API_ENV;
  }
  
  // Check NODE_ENV and map to our config keys
  const nodeEnv = import.meta.env.NODE_ENV || 'development';
  
  switch (nodeEnv) {
    case 'production':
      return 'production';
    case 'development':
    default:
      return 'development';
  }
};

// Get the current configuration with base URL override support
export const getApiConfig = (): ApiConfig => {
  const environment = getCurrentEnvironment();
  const config = configs[environment];
  
  if (!config) {
    console.warn(`API environment '${environment}' not found, falling back to 'development'`);
    return {
      ...configs.development,
      baseUrl: getBaseUrl()
    };
  }
  
  // Override base URL if explicitly provided
  const finalConfig = {
    ...config,
    baseUrl: getBaseUrl()
  };
  
  console.log(`Using API configuration: ${environment} (${finalConfig.baseUrl || 'same-origin'})`);
  return finalConfig;
};

// Helper to get full URL for an endpoint
export const getEndpointUrl = (endpoint: keyof ApiConfig['endpoints']): string => {
  const config = getApiConfig();
  const path = config.endpoints[endpoint];
  
  if (!path) {
    throw new Error(`Endpoint '${endpoint}' not found in API configuration`);
  }
  
  // If baseUrl is empty, return path as-is (same origin)
  if (!config.baseUrl) {
    return path;
  }
  
  // Combine baseUrl with endpoint path
  return `${config.baseUrl.replace(/\/$/, '')}${path}`;
};

// Export current config for debugging
export const currentApiConfig = getApiConfig();