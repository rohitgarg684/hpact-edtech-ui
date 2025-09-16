# Overview

This is a UI-only frontend application built with React, Express, and TypeScript that connects to external backend APIs for user management and data storage. The application features a modern user interface built with shadcn/ui components and Tailwind CSS, with proxy functionality to communicate with external backend services. The project uses TypeScript throughout and implements centralized API configuration for different deployment environments.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript serving as UI server and API proxy
- **API Communication**: Proxy middleware forwards requests to external backend at localhost:8000
- **Environment Configuration**: Centralized API configuration system with environment-based routing
- **Development Setup**: Built-in proxy eliminates CORS issues by making same-origin requests

## API Integration
- **Proxy Configuration**: Development environment routes `/api/*` requests to external backend
- **CORS Solution**: Same-origin requests via proxy eliminate cross-origin restrictions  
- **Environment Management**: Configurable base URLs for development, production, and local setups
- **Request Forwarding**: http-proxy-middleware handles seamless API request forwarding

## Development Tools
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared code
- **Code Organization**: Monorepo structure with shared schemas and types
- **Development Experience**: Hot module replacement and runtime error overlays

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **connect-pg-simple**: PostgreSQL session store for Express

## UI Framework
- **Radix UI**: Accessible component primitives for complex UI components
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework for styling

## Authentication & Security
- **bcrypt**: Industry-standard password hashing library
- **Zod**: Runtime type validation and schema validation

## Development & Build Tools
- **Vite**: Modern build tool and development server
- **TypeScript**: Static type checking and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

## Frontend Libraries
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Performant form library with validation
- **Wouter**: Lightweight client-side routing
- **class-variance-authority**: Utility for creating variant-based component APIs