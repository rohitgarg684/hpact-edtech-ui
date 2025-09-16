# API Configuration Guide

This centralized configuration system makes it easy to specify base URLs for backend calls.

## Quick Setup

### Method 1: Environment Variables (Recommended)

Create a `.env.local` file in your project root:

```bash
# Option A: Direct base URL override (highest priority)
VITE_API_BASE_URL=https://your-api-domain.com

# Option B: Use predefined environments
VITE_API_ENV=production

# Option C: Both (base URL takes priority)
VITE_API_ENV=fastapi
VITE_API_BASE_URL=https://my-custom-api.com
```

### Method 2: Code Configuration

Edit `client/src/config/env.ts` and uncomment:

```typescript
export const BASE_URL_CONFIGS = {
  // Uncomment this line and set your URL:
  DIRECT_BASE_URL: "https://your-api-domain.com",
  // ...
}
```

## Available Environments

- `local` - Same origin (current Express server) - **Default**
- `fastapi` - Local FastAPI server (`http://localhost:8000`)
- `production` - Production FastAPI server
- `development` - Development FastAPI server

## Environment Variable Priority

1. `VITE_API_BASE_URL` - Direct override (highest)
2. `VITE_API_ENV` - Environment selection
3. `NODE_ENV` - Automatic environment detection
4. Default to `local` (same origin)

## Common Use Cases

### Local Development with Express (Default)
```bash
# No configuration needed - works out of the box
npm run dev
```

### Local Development with FastAPI
```bash
# .env.local
VITE_API_ENV=fastapi
```

### Staging Deployment
```bash
# .env.local
VITE_API_BASE_URL=https://staging-api.yourcompany.com
```

### Production Deployment
```bash
# .env.production
VITE_API_BASE_URL=https://api.yourcompany.com
```

## Debugging

Open browser console to see current configuration:
```
Using API configuration: local (same-origin)
```

Or use the debug helper:
```typescript
import { debugApiConfig } from '@/config';
debugApiConfig();
```

## Adding New Endpoints

Edit `client/src/config/api.ts`:

```typescript
endpoints: {
  // ... existing endpoints
  newEndpoint: "/api/new-feature",
}
```

Then use in your code:
```typescript
import { apiRequest } from "@/lib/queryClient";

const response = await apiRequest("GET", "newEndpoint");
```