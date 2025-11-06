#!/bin/bash
set -e

echo "🏗️  Starting build process..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm ci --only=production --ignore-scripts
cd ..

# Install frontend dependencies (with optimizations)
echo "📦 Installing frontend dependencies..."
cd frontend
NODE_OPTIONS="--max_old_space_size=4096" npm install --legacy-peer-deps --no-optional --ignore-scripts

# Build frontend
echo "🔨 Building frontend..."
NODE_OPTIONS="--max_old_space_size=4096" GENERATE_SOURCEMAP=false npm run build

# Copy build to backend
echo "📂 Copying frontend build to backend..."
cd ..
mkdir -p backend/frontend-build
cp -r frontend/build/* backend/frontend-build/

echo "✅ Build complete!"
