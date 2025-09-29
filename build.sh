#!/bin/bash

echo "🚀 Starting Railway build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Copy frontend build to backend
echo "📁 Copying frontend build to backend..."
rm -rf backend/frontend-build
cp -r frontend/build backend/frontend-build

echo "✅ Build completed successfully!"
echo "📁 Frontend build copied to: backend/frontend-build"

# List contents to verify
echo "📋 Contents of frontend-build:"
ls -la backend/frontend-build/
