#!/bin/bash

# POS System Setup Script
# This script sets up the development environment for the POS System

set -e

echo "🚀 Setting up POS System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is 16 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 16 ]; then
            print_error "Node.js version 16 or higher is required. Current version: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 16 or higher."
        exit 1
    fi
}

# Check if PostgreSQL is installed
check_postgresql() {
    print_status "Checking PostgreSQL installation..."
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL is installed"
    else
        print_warning "PostgreSQL is not installed. Please install PostgreSQL 12 or higher."
        print_status "Installation instructions:"
        echo "  macOS: brew install postgresql"
        echo "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
        echo "  CentOS: sudo yum install postgresql-server postgresql-contrib"
    fi
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in backend directory"
        exit 1
    fi
    
    print_status "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file from template..."
        cp env.example .env
        print_warning "Please update the .env file with your database credentials and other settings"
    else
        print_success ".env file already exists"
    fi
    
    cd ..
    print_success "Backend setup completed"
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    cd frontend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in frontend directory"
        exit 1
    fi
    
    print_status "Installing frontend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        print_status "Creating .env file..."
        echo "REACT_APP_API_URL=http://localhost:8000" > .env
        echo "REACT_APP_SOCKET_URL=http://localhost:8000" >> .env
        echo "PORT=8080" >> .env
    else
        print_success ".env file already exists"
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if PostgreSQL is running
    if ! pg_isready -q; then
        print_warning "PostgreSQL is not running. Please start PostgreSQL and try again."
        print_status "To start PostgreSQL:"
        echo "  macOS: brew services start postgresql"
        echo "  Ubuntu: sudo systemctl start postgresql"
        echo "  CentOS: sudo systemctl start postgresql"
        return
    fi
    
    # Read database configuration from .env
    if [ -f "backend/.env" ]; then
        source backend/.env
    else
        print_error "Backend .env file not found. Please run backend setup first."
        return
    fi
    
    # Create database if it doesn't exist
    print_status "Creating database if it doesn't exist..."
    createdb $DB_NAME 2>/dev/null || print_warning "Database $DB_NAME might already exist"
    
    print_success "Database setup completed"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p backups
    mkdir -p docs
    
    print_success "Directories created"
}

# Display next steps
show_next_steps() {
    print_success "Setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Update backend/.env with your database credentials and settings"
    echo "2. Start PostgreSQL if it's not running"
    echo "3. Run database migrations: cd backend && npm run migrate"
    echo "4. Seed the database: cd backend && npm run seed"
    echo "5. Start the backend: cd backend && npm run dev"
    echo "6. Start the frontend: cd frontend && npm start"
    echo
    echo "Default login credentials:"
    echo "  Super Admin: superadmin@possystem.com / admin123"
    echo "  Company Admin: admin@defaultcompany.com / admin123"
    echo "  Cashier: cashier@defaultcompany.com / cashier123"
    echo
    echo "Access URLs:"
    echo "  Frontend: http://localhost:8080"
    echo "  Backend API: http://localhost:8000"
    echo "  API Documentation: http://localhost:8000/api-docs"
}

# Main setup function
main() {
    echo "=================================="
    echo "    POS System Setup Script"
    echo "=================================="
    echo
    
    check_nodejs
    check_postgresql
    create_directories
    setup_backend
    setup_frontend
    setup_database
    
    echo
    show_next_steps
}

# Run main function
main
