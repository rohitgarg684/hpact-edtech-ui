// Re-export all configuration modules
export * from './api';
export * from './env';

// Environment helper
export const isDevelopment = import.meta.env.NODE_ENV === 'development';
export const isProduction = import.meta.env.NODE_ENV === 'production';

// Enhanced debug helper
export const logConfig = () => {
  if (isDevelopment) {
    console.log('Environment:', import.meta.env.NODE_ENV);
    console.log('API Environment:', import.meta.env.VITE_API_ENV || 'not set');
    console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL || 'not set');
  }
};