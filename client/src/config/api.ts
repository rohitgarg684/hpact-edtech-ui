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
  // Local Express server (current setup)
  local: {
    baseUrl: "", // Same origin
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

  // Python FastAPI server (your backend)
  fastapi: {
    baseUrl: "http://localhost:8000", // Change this to your FastAPI server URL
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

  // Production FastAPI server
  production: {
    baseUrl: "https://your-fastapi-domain.com", // Change this to your production URL
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

  // Development FastAPI server
  development: {
    baseUrl: "http://localhost:8000", // Or your dev server URL
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
      return 'local'; // Default to local Express for development
    default:
      return 'local';
  }
};

// Get the current configuration
export const getApiConfig = (): ApiConfig => {
  const environment = getCurrentEnvironment();
  const config = configs[environment];
  
  if (!config) {
    console.warn(`API environment '${environment}' not found, falling back to 'local'`);
    return configs.local;
  }
  
  console.log(`Using API configuration: ${environment} (${config.baseUrl || 'same-origin'})`);
  return config;
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