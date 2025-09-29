# Multi-Location POS System

A scalable, multi-location Point of Sale system with role-based access control, supporting multiple companies and locations with optional Shopify integration.

## Features

### 🔐 Role-Based Access
- **Admin Role**: Full access to all features, settings, and reports
- **Client Role**: Restricted access for sales operations at assigned locations

### 🛠️ Admin Panel Features
- Dashboard with sales overview across all locations
- Product management with CRUD operations
- User and role management
- Multi-location management
- Sales and order management
- Comprehensive reporting (PDF/Excel)
- Data export and backup functionality
- Multi-company support

### 💻 Client Panel Features
- Secure login with JWT authentication
- Location-specific dashboard
- POS interface for sales operations
- Invoice generation and printing
- Real-time sales tracking

### 🔧 Technical Features
- JWT-based authentication
- Multi-company data isolation
- Optional Shopify API integration
- PostgreSQL database
- React frontend with TypeScript
- Node.js backend with Express
- Real-time updates with Socket.IO

## Project Structure

```
POS System/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Authentication & validation
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── config/         # Configuration files
│   │   ├── utils/          # Utility functions
│   │   └── database/       # Database configuration
│   ├── package.json
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # Utility functions
│   │   ├── assets/        # Static assets
│   │   └── routes/        # Route definitions
│   ├── package.json
│   └── public/
├── docs/                  # Documentation
├── backups/              # Generated backups
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database and API configurations
   ```

5. Run database migrations:
   ```bash
   cd backend
   npm run migrate
   ```

6. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

7. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

## Access URLs
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:8000

## API Documentation

See `/docs/api.md` for detailed API documentation.

## Database Schema

See `/docs/database-schema.md` for complete database schema documentation.

## Deployment

See `/docs/deployment.md` for deployment instructions.

## License

MIT License
