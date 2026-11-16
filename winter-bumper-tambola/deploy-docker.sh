#!/bin/bash
# Winter Bumper Tambola - Docker Deployment Script

set -e

echo "======================================"
echo "Winter Bumper Tambola - Docker Deploy"
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "   Install from: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    echo "   Install from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Check .env file
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env with your production settings:"
    echo "   - MONGODB_URI (use MongoDB Atlas for production)"
    echo "   - JWT_SECRET (openssl rand -base64 32)"
    echo "   - JWT_REFRESH_SECRET (openssl rand -base64 32)"
    echo "   - CLIENT_URL (your domain)"
    echo ""
    echo "After editing, run this script again."
    exit 1
fi

echo ""
echo "🔨 Building and starting services..."

# Build and start
docker-compose up -d --build

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Service Status:"
docker-compose ps

echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost or https://yourdomain.com"
echo "   Backend:  http://localhost:5000 or https://yourdomain.com/api"
echo "   Health:   http://localhost:5000/health"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f                  # All services"
echo "   docker-compose logs -f backend          # Backend only"
echo "   docker-compose logs -f frontend         # Frontend only"
echo "   docker-compose logs -f mongodb          # Database only"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose down"
echo ""
echo "🔄 To restart:"
echo "   docker-compose restart"
echo ""
echo "♻️  To rebuild and restart:"
echo "   docker-compose up -d --build"
