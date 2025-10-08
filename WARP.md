# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project overview
- Monorepo with two Node.js apps:
  - frontend/ React single-page app (CRA) served on port 8080 in development
  - backend/ Express + Socket.IO API with PostgreSQL via TypeORM, served on port 8000
- In production, the backend serves the built frontend from backend/frontend-build

Setup and environment
- Node requirements are defined in package.json (root requires Node >=18; backend >=16)
- Copy and edit env files before running locally:
  - cp backend/.env.example backend/.env
  - Key variables: DB_* (Postgres), JWT_SECRET, PORT (default 8000), FRONTEND_URL (default http://localhost:8080), CORS_ORIGIN
- Database config lives at backend/src/config/database.js (TypeORM DataSource for Postgres, entities under backend/src/models)

Common commands
- Install all deps (root + frontend + backend)
  - npm run install-all
- Run both apps (development)
  - npm run dev
    - Starts frontend on http://localhost:8080 and backend on http://localhost:8000
    - Note: backend hot reload is available via nodemon but not wired in the root dev script (see backend-only below)
- Backend only (development, with hot reload)
  - cd backend && npm run dev
- Frontend only (development)
  - cd frontend && npm start
- Production build (builds SPA and makes backend serve it)
  - npm run build
    - Builds frontend, installs backend deps, and copies frontend/build to backend/frontend-build
- Backend: database migrations and seed
  - cd backend && npm run migrate
  - cd backend && npm run migrate:revert
  - cd backend && npm run migrate:generate
  - cd backend && npm run seed
- Linting
  - Backend: cd backend && npm run lint
  - Backend (auto-fix): cd backend && npm run lint:fix
- Tests
  - Backend (Jest): cd backend && npm test
  - Frontend (react-scripts): cd frontend && npm test
- Run a single test
  - Backend (Jest by name): cd backend && npm test -- -t "<pattern>"
  - Backend (Jest by file): cd backend && npx jest path/to/test.spec.js
  - Frontend (react-scripts): cd frontend && npm test -- --watchAll=false -t "<pattern>"

High-level architecture
Backend (Node.js, Express, TypeORM, Socket.IO)
- Entry point: backend/src/server.js
  - Middleware: helmet (CSP disabled to allow third-party images), compression, morgan, rate limiting, CORS
  - Health: /health and /api/health
  - Static: serves invoice PDFs from /api/invoices and, in production, serves the built SPA from frontend-build
  - Realtime: Socket.IO with “company-<id>” and “location-<id>” rooms for updates
  - Routing: REST endpoints mounted under /api/* with authentication on most routes
    - Examples: /api/auth, /api/users, /api/products, /api/locations, /api/sales, /api/reports, /api/companies, /api/roles, /api/shopify, /api/invoices, /api/backups, /api/data, /api/user-locations, /api/whatsapp, /api/geolocation
- Layering and modules
  - routes/ define HTTP paths and attach middleware
  - controllers/ contain request handlers
  - services/ encapsulate business logic and external integrations (e.g., Shopify, WhatsApp, PDF invoice generation, geolocation)
  - middlewares/ provide auth (JWT), validation (Joi), and error handling
  - models/ contain TypeORM EntitySchema definitions (e.g., User, Role, Company, Location, Sale)
  - config/database.js provides the TypeORM DataSource pointing to Postgres and loads entities/migrations
- Data model notes
  - Entities are UUID-based and use explicit relations (many-to-one, one-to-many) with indices on common query fields (e.g., email, roleId, companyId)
  - Multi-tenancy is enforced at the data model level (e.g., companyId on user and related entities)

Frontend (React SPA)
- Entry point: frontend/src/index.js, primary app in frontend/src/App.js
- Development server on http://localhost:8080 (script sets PORT=8080)
- API URL resolution: in dev, uses http://localhost:8000; in production, uses window.location.origin
- Uses axios for HTTP, react-hot-toast for notifications, and localStorage for demo data when backend isn’t providing it

Local URLs
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000

Notes for production
- Run npm run build at the repo root to produce a production bundle; backend will serve the SPA from backend/frontend-build when NODE_ENV=production
- Ensure backend/.env is configured for production (Postgres credentials, JWT_SECRET, CORS, SSL if applicable)

Tooling and rules files
- README.md contains Quick Start, URLs, and high-level system description. Keep it in sync with commands above.
- No CLAUDE.md, Cursor rules, or Copilot instruction files detected at the time of writing.
