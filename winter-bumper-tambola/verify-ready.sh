#!/bin/bash
# Winter Bumper Tambola - Pre-Deployment Verification

echo "❄️  Winter Bumper Tambola - Pre-Deployment Check"
echo "=================================================="
echo ""

failed=0

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_V=$(node --version)
    echo "  ✅ Node.js $NODE_V installed"
else
    echo "  ❌ Node.js not found"
    ((failed++))
fi

# Check npm
echo ""
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_V=$(npm --version)
    echo "  ✅ npm $NPM_V installed"
else
    echo "  ❌ npm not found"
    ((failed++))
fi

# Check Backend
echo ""
echo "✓ Checking backend..."
if [ -d "backend" ]; then
    echo "  ✅ backend/ directory exists"
    if [ -f "backend/package.json" ]; then
        echo "  ✅ backend/package.json found"
    else
        echo "  ❌ backend/package.json not found"
        ((failed++))
    fi
    if [ -d "backend/node_modules" ]; then
        echo "  ✅ backend dependencies installed"
    else
        echo "  ⚠️  backend/node_modules not found (run: cd backend && npm install)"
    fi
else
    echo "  ❌ backend/ directory not found"
    ((failed++))
fi

# Check Frontend
echo ""
echo "✓ Checking frontend..."
if [ -d "frontend" ]; then
    echo "  ✅ frontend/ directory exists"
    if [ -f "frontend/package.json" ]; then
        echo "  ✅ frontend/package.json found"
    else
        echo "  ❌ frontend/package.json not found"
        ((failed++))
    fi
    if [ -d "frontend/node_modules" ]; then
        echo "  ✅ frontend dependencies installed"
    else
        echo "  ⚠️  frontend/node_modules not found (run: cd frontend && npm install)"
    fi
    if [ -d "frontend/dist" ]; then
        SIZE=$(du -sh frontend/dist | cut -f1)
        echo "  ✅ frontend/dist built ($SIZE)"
    else
        echo "  ⚠️  frontend/dist not found (run: cd frontend && npm run build)"
    fi
else
    echo "  ❌ frontend/ directory not found"
    ((failed++))
fi

# Check Docker
echo ""
echo "✓ Checking Docker (optional)..."
if command -v docker &> /dev/null; then
    DOCKER_V=$(docker --version)
    echo "  ✅ $DOCKER_V installed"
    if command -v docker-compose &> /dev/null; then
        DC_V=$(docker-compose --version)
        echo "  ✅ $DC_V installed"
    else
        echo "  ⚠️  docker-compose not found (optional)"
    fi
else
    echo "  ⚠️  Docker not found (needed for docker-compose deploy)"
fi

# Check configuration files
echo ""
echo "✓ Checking configuration files..."
if [ -f ".env" ]; then
    echo "  ✅ .env file exists"
    if grep -q "MONGODB_URI" .env; then
        echo "  ✅ MONGODB_URI configured"
    else
        echo "  ⚠️  MONGODB_URI not set in .env"
    fi
    if grep -q "JWT_SECRET" .env; then
        echo "  ✅ JWT_SECRET configured"
    else
        echo "  ⚠️  JWT_SECRET not set in .env"
    fi
else
    echo "  ⚠️  .env file not found (run: cp .env.example .env && nano .env)"
fi

if [ -f "docker-compose.yml" ]; then
    echo "  ✅ docker-compose.yml found"
else
    echo "  ❌ docker-compose.yml not found"
    ((failed++))
fi

if [ -f "README.md" ]; then
    echo "  ✅ README.md found"
fi

if [ -f "DEPLOYMENT.md" ]; then
    echo "  ✅ DEPLOYMENT.md found"
fi

# Check scripts
echo ""
echo "✓ Checking deployment scripts..."
if [ -f "deploy-docker.sh" ]; then
    if [ -x "deploy-docker.sh" ]; then
        echo "  ✅ deploy-docker.sh (executable)"
    else
        echo "  ⚠️  deploy-docker.sh (not executable, run: chmod +x deploy-docker.sh)"
    fi
else
    echo "  ⚠️  deploy-docker.sh not found"
fi

if [ -f "deploy-manual.sh" ]; then
    if [ -x "deploy-manual.sh" ]; then
        echo "  ✅ deploy-manual.sh (executable)"
    else
        echo "  ⚠️  deploy-manual.sh (not executable, run: chmod +x deploy-manual.sh)"
    fi
fi

# Summary
echo ""
echo "=================================================="
if [ $failed -eq 0 ]; then
    echo "✅ All critical checks passed!"
    echo ""
    echo "🚀 Ready to deploy! Choose your method:"
    echo ""
    echo "   Docker:    ./deploy-docker.sh"
    echo "   VPS/EC2:   ./deploy-manual.sh (with sudo)"
    echo "   Heroku:    heroku create && git push heroku main"
    echo "   Render:    Connect GitHub repo"
    echo ""
    echo "📖 For details, see DEPLOYMENT_SUMMARY.md"
else
    echo "❌ $failed critical check(s) failed!"
    echo ""
    echo "Fix the issues above and run this script again:"
    echo "   bash verify-ready.sh"
fi

echo ""
