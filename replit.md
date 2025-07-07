# SareeFlow - Order Management and Inventory System

## Overview

SareeFlow is a comprehensive order management and inventory system tailored for a saree business. The application provides features for managing products, customers, orders, suppliers, billing, and inventory with real-time tracking and reporting capabilities. It's built as a modern web application with a React frontend and Express backend, using PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI components with shadcn/ui styling
- **Styling**: Tailwind CSS with custom design tokens for saree business theme
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and building

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with centralized error handling
- **Session Management**: Express sessions with PostgreSQL storage
- **File Structure**: Monorepo structure with shared schemas

### Database Architecture
- **Database**: MongoDB Atlas cloud database (successfully connected)
- **Storage**: MongoDB collections with document-based storage
- **Collection Naming**: Standardized with "sm_" prefix (e.g., sm_products, sm_customers, sm_orders)
- **Collections**: sm_users, sm_products, sm_customers, sm_orders, sm_suppliers, sm_inventory_movements, sm_purchase_orders
- **Relationships**: Referenced relationships between documents using IDs
- **Indexing**: Optimized for saree business queries (SKU, customer phone, order numbers)
- **Connection**: Secure connection via MongoDB Atlas with IP whitelist (0.0.0.0/0)

## Key Components

### Product Management
- Product catalog with SKU, pricing, and stock tracking
- Image upload support for saree photos
- Category and fabric type classification
- Color and size variant management
- Minimum stock level alerts

### Order Management
- Complete order lifecycle (pending → confirmed → shipped → delivered)
- Customer order history and tracking
- Order item management with quantity and pricing
- Payment status tracking (paid, partial, COD, pending)
- Automated inventory updates on order completion

### Inventory Management
- Real-time stock tracking with movement history
- Stock adjustment capabilities
- Low stock alerts and critical stock warnings
- Supplier-based inventory management
- Purchase order generation and tracking

### Customer Management
- Customer database with contact information
- Order history and spending analytics
- Customer preferences and notes
- GST number management for business customers

### Supplier Management
- Supplier contact and business details
- Purchase order management
- Payment terms and bank details
- Supplier performance tracking

## Data Flow

1. **Product Creation**: Products are added with details → Stock levels initialized → Inventory movements tracked
2. **Order Processing**: Customer places order → Inventory checked → Order confirmed → Stock reduced → Billing generated
3. **Inventory Updates**: Purchase orders received → Stock levels updated → Movement history logged
4. **Reporting**: Data aggregated from all modules → Dashboard metrics updated → Reports generated

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **express**: Web server framework
- **react**: Frontend framework
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **tailwindcss**: Styling framework

### UI Dependencies
- **@radix-ui/***: Accessible UI components
- **lucide-react**: Icon library
- **date-fns**: Date manipulation
- **class-variance-authority**: Component variant management

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Development
- **Server**: Node.js with tsx for TypeScript execution
- **Client**: Vite dev server with HMR
- **Database**: Neon PostgreSQL with development database
- **Environment**: Environment variables for database connection

### Production
- **Build Process**: 
  - Frontend: Vite build to static assets
  - Backend: esbuild bundle for Node.js deployment
- **Database**: Neon PostgreSQL production instance
- **Deployment**: Single Node.js process serving API and static files
- **Environment**: Production environment variables required

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Seeding**: Manual data seeding for initial setup
- **Backup**: Database backup strategy through Neon platform

## User Preferences

Preferred communication style: Simple, everyday language.

## Authentication System

### Role-Based Access Control
- **Admin**: Full system access to all features and user management
- **Sales Staff**: Access to orders, customers, products, and billing
- **Warehouse**: Access to inventory, products, and purchase orders

### Demo Credentials
- **Admin**: username `admin`, password `admin123`
- **Sales Staff**: username `staff`, password `staff123`  
- **Warehouse**: username `warehouse`, password `warehouse123`

### Security Features
- Session-based authentication with Express sessions
- Role-based route protection on backend
- Secure password handling (production should use bcrypt)
- Automatic session expiry (24 hours)

## Changelog

Recent Changes:
- July 05, 2025: Initial project setup with MERN stack architecture
- July 05, 2025: Implemented role-based authentication system with three staff roles
- July 05, 2025: Added login/registration pages with role selection
- July 05, 2025: Created AuthContext for frontend state management
- July 05, 2025: Updated sidebar with user profile and logout functionality
- July 05, 2025: Successfully connected MongoDB Atlas cloud database with persistent data storage
- July 05, 2025: Completed customer edit/delete functionality with modal dialogs
- July 05, 2025: Implemented product edit/delete functionality with confirmation prompts
- July 06, 2025: Removed PostgreSQL and Drizzle dependencies, completed MongoDB-only architecture
- July 06, 2025: Standardized all MongoDB collection names with "sm_" prefix for better organization
- July 06, 2025: Enhanced product schema to support both single imageUrl and multiple images array
- July 06, 2025: Fixed schema mapping issues between frontend components and MongoDB backend
- July 06, 2025: Implemented proper multiple image upload with GridFS storage and URL mapping
- July 07, 2025: Added new product fields to sm_products collection: length, blouseLength, brand, occasions
- July 07, 2025: Updated add/edit product modals with new form fields for saree business requirements
- July 07, 2025: Enhanced MongoDB storage layer to support all new product attributes