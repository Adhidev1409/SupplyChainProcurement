# Overview

EcoSupply is a comprehensive sustainable supply chain management application built as a single-page React app. The system enables procurement managers to evaluate suppliers based on sustainability metrics while providing suppliers with a portal to track their environmental performance. The application features advanced data visualization, multi-step onboarding workflows, and simulation capabilities for comparing supplier environmental impact.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing across dashboard, supplier management, and onboarding flows
- **Styling**: Tailwind CSS with shadcn/ui component library providing consistent design system
- **State Management**: TanStack Query for server state management and caching, React Hook Form for form state
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Server**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful endpoints following conventional patterns (/api/suppliers, etc.)
- **Data Storage**: In-memory storage implementation with interface abstraction for future database integration
- **Schema Validation**: Zod for runtime type validation and Drizzle-Zod integration
- **Development**: Hot module replacement and error overlay for enhanced developer experience

## Data Model
- **Suppliers**: Core entity with sustainability metrics (carbon footprint, water usage, certifications)
- **Calculated Fields**: Dynamic sustainability scores and risk levels computed from base metrics
- **Historical Data**: Time-series carbon footprint tracking for trend analysis
- **Users**: Basic user entity prepared for authentication implementation

## Component Architecture
- **Chart Components**: Recharts-based visualization library with responsive containers
- **UI Components**: Radix UI primitives wrapped with consistent styling patterns
- **Form Components**: React Hook Form integration with validation and error handling
- **Navigation**: Persistent navigation with active state management

## Performance Optimizations
- **Code Splitting**: Vite handles automatic chunk splitting for optimal loading
- **Query Caching**: TanStack Query provides intelligent caching and background updates
- **Image Optimization**: Font preloading and CSS variable system for consistent theming
- **Bundle Analysis**: esbuild for production bundling with external package handling

# External Dependencies

## Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching layer
- **wouter**: Lightweight routing solution for SPA navigation
- **react-hook-form**: Form state management with validation
- **@hookform/resolvers**: Integration layer for Zod schema validation

## UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for rapid styling
- **class-variance-authority**: Type-safe variant handling for components
- **lucide-react**: Icon library with consistent design language

## Data Visualization
- **recharts**: React charting library for dashboard analytics
- **embla-carousel-react**: Touch-friendly carousel components

## Development Tools
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect configuration
- **drizzle-kit**: Database migration and schema management tools
- **@neondatabase/serverless**: Prepared for serverless PostgreSQL integration
- **tsx**: TypeScript execution for development server

## Database Integration (Prepared)
- **PostgreSQL**: Primary database configured via Drizzle with Neon serverless option
- **Connection Pooling**: Environment-based database URL configuration
- **Schema Management**: Centralized schema definitions in shared directory

## Build and Deployment
- **vite**: Modern build tool with React plugin and development server
- **esbuild**: Fast JavaScript bundler for production builds
- **@replit/vite-plugin-***: Replit-specific development enhancements