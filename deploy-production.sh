#!/bin/bash

# EvoMeme AI - Production Deployment Script for Hostinger
# This script should be run on the server after git clone

echo "🚀 EvoMeme AI - Production Deployment"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project directory?"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production not found!"
    echo "Please create .env.production with your production environment variables"
    exit 1
fi

echo "✅ .env.production found"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --production=false

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p public/templates
mkdir -p public/generated
mkdir -p data

echo "✅ Directories created"

# Build the application
echo ""
echo "🔨 Building application..."
NODE_ENV=production npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"

# Copy necessary files to standalone
echo ""
echo "📋 Copying files to standalone..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cp .env.production .next/standalone/

echo "✅ Files copied"

# Stop existing PM2 process if running
echo ""
echo "🛑 Stopping existing PM2 process..."
pm2 stop evomeme-ai 2>/dev/null || true
pm2 delete evomeme-ai 2>/dev/null || true

# Start the application with PM2
echo ""
echo "🚀 Starting application with PM2..."
cd .next/standalone
NODE_ENV=production pm2 start server.js --name "evomeme-ai" --time

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Application Status:"
pm2 status

echo ""
echo "📝 Useful commands:"
echo "  pm2 logs evomeme-ai    - View logs"
echo "  pm2 restart evomeme-ai - Restart app"
echo "  pm2 stop evomeme-ai    - Stop app"
echo "  pm2 status             - Check status"
echo ""
echo "🌐 Your app should be running on port 3000"
echo "Configure your web server (Apache/Nginx) to proxy to http://localhost:3000"
