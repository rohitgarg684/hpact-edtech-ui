# API Configuration Guide

## Overview
The application now includes a flexible configuration system that allows you to easily switch between different API backends (local Express server vs. your Python FastAPI server).

## Quick Setup

### 1. Choose Your Configuration
Create a `.env.local` file in your project root:

```bash
# For local Express server (default)
VITE_API_ENV=local

# For Python FastAPI server
VITE_API_ENV=fastapi

# For development/production FastAPI
VITE_API_ENV=development
VITE_API_ENV=production
```

### 2. Update API Endpoints (if needed)
Edit `client/src/config/api.ts` to set your FastAPI server URLs:

```typescript
fastapi: {
  baseUrl: "http://localhost:8000", // Change to your FastAPI URL
  timeout: 30000,
  endpoints: {
    register: "/register",
    login: "/login", 
    chat: "/chat",
    saveChat: "/save-chat",
    // ... other endpoints
  },
},
```

## Available Configurations

### `local` (Default)
- Uses the built-in Express server
- Same-origin requests (no CORS issues)
- Good for development and testing

### `fastapi`
- Points to your Python FastAPI server
- Default: `http://localhost:8000`
- Use this to connect directly to your backend

### `development` / `production`
- Environment-specific FastAPI configurations
- Customize URLs and settings per environment

## Usage Examples

### Switch to FastAPI Backend
```bash
# Create .env.local file
echo "VITE_API_ENV=fastapi" > .env.local

# Update FastAPI URL in config/api.ts if needed
# Then restart your dev server
npm run dev
```

### Switch Back to Local Express
```bash
# Update .env.local
echo "VITE_API_ENV=local" > .env.local

# Restart dev server
npm run dev
```

## Supported Endpoints
The config system automatically routes these API calls:

- **Authentication**: `register`, `login`, `logout`, `user`
- **Chat**: `chat`, `saveChat`
- **Future**: Easy to add new endpoints as needed

## How It Works

1. **Configuration Loading**: The system reads `VITE_API_ENV` and loads the appropriate config
2. **URL Resolution**: API calls use endpoint names (e.g., "chat") which get resolved to full URLs
3. **Automatic Switching**: Change the environment variable and restart to switch backends
4. **Debugging**: Check browser console for "Using API configuration" messages

## Adding New Endpoints

To add a new endpoint:

1. **Add to config** (`client/src/config/api.ts`):
```typescript
endpoints: {
  // ... existing endpoints
  myNewEndpoint: "/my-new-endpoint",
}
```

2. **Use in your code**:
```typescript
const response = await apiRequest("POST", "myNewEndpoint", data);
```

## Troubleshooting

- **CORS Issues**: Use `local` config or configure CORS on your FastAPI server
- **Connection Refused**: Check if your FastAPI server is running
- **Wrong URLs**: Verify the `baseUrl` in your configuration
- **Environment Not Loading**: Make sure `.env.local` exists and restart the dev server