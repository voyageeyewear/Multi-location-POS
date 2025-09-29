#!/bin/bash

# Multi-location POS System Deployment Script
echo "🚀 Starting deployment process..."

# Install dependencies
echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Build frontend
echo "🏗️ Building frontend..."
cd frontend && npm run build && cd ..

# Move frontend build to backend for serving
echo "📁 Moving frontend build to backend..."
cp -r frontend/build backend/frontend-build

echo "✅ Deployment preparation completed!"
echo "🎯 Starting backend server..."
cd backend && npm start
