#!/bin/bash
set -e

echo "🏗️  Starting build process..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci --only=production
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Copy build to backend
echo "📂 Copying frontend build to backend..."
cd ..
mkdir -p backend/frontend-build
cp -r frontend/build/* backend/frontend-build/

echo "✅ Build complete!"
