# Overview

This is a full-stack web application built with React, Express, and PostgreSQL that provides user authentication functionality. The application features a modern user interface built with shadcn/ui components and Tailwind CSS, with a backend API for user registration and login. The project uses TypeScript throughout and implements secure authentication with bcrypt password hashing and session management.

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
- **Framework**: Express.js with TypeScript
- **Session Management**: Express sessions with PostgreSQL session store
- **Password Security**: bcrypt for password hashing
- **Rate Limiting**: Built-in rate limiting for login attempts
- **API Design**: RESTful API endpoints with comprehensive error handling

## Database Layer
- **Database**: PostgreSQL with Neon Database serverless connection
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Interface**: Abstracted storage layer with both memory and database implementations

## Authentication & Security
- **Password Requirements**: Enforced complex password rules (uppercase, lowercase, digits, special characters)
- **Session Management**: Server-side sessions with configurable expiration
- **Rate Limiting**: Protection against brute force attacks on login endpoints
- **Input Validation**: Comprehensive validation using Zod schemas on both client and server

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