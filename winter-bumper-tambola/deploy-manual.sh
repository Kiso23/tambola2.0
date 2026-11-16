#!/bin/bash
# Winter Bumper Tambola - Manual Deployment (AWS/DigitalOcean/VPS)

set -e

echo "=============================================="
echo "Winter Bumper Tambola - Manual Server Deploy"
echo "=============================================="

# Check if running as root or with sudo
if [[ $EUID -ne 0 ]]; then
    echo "❌ This script must be run as root (use sudo)"
    exit 1
fi

# Step 1: Update system
echo ""
echo "📦 Updating system packages..."
apt-get update && apt-get upgrade -y

# Step 2: Install Node.js
echo ""
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Step 3: Install MongoDB
echo ""
echo "📦 Installing MongoDB 7..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update
apt-get install -y mongodb-org

# Start MongoDB
systemctl start mongod
systemctl enable mongod
echo "✅ MongoDB started and enabled"

# Step 4: Install Nginx
echo ""
echo "📦 Installing Nginx..."
apt-get install -y nginx
systemctl start nginx
systemctl enable nginx
echo "✅ Nginx installed and started"

# Step 5: Create app directory
echo ""
echo "📁 Creating app directory..."
mkdir -p /var/www/winter-bumper-tambola
chown -R ubuntu:ubuntu /var/www/winter-bumper-tambola

# Step 6: Deploy backend
echo ""
echo "🚀 Deploying backend..."
cd /var/www/winter-bumper-tambola

# Assume code is already cloned here
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found!"
    echo "   Please clone the repository to /var/www/winter-bumper-tambola first"
    exit 1
fi

cd backend
npm install --production

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  Created .env file. Please edit with production values:"
    echo "   nano /var/www/winter-bumper-tambola/backend/.env"
fi

# Install PM2
echo ""
echo "📦 Installing PM2 for process management..."
npm install -g pm2

# Start backend
echo "🚀 Starting backend..."
pm2 start src/index.js --name "wbt-backend" --env production
pm2 startup
pm2 save
echo "✅ Backend running with PM2"

# Step 7: Build frontend
echo ""
echo "🚀 Building frontend..."
cd /var/www/winter-bumper-tambola/frontend
npm install
npm run build
echo "✅ Frontend built"

# Step 8: Configure Nginx
echo ""
echo "⚙️  Configuring Nginx..."

# Create Nginx config
cat > /etc/nginx/sites-available/winter-bumper-tambola << 'EOF'
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    # Enable gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend - Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/winter-bumper-tambola/frontend/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }

    # Frontend SPA fallback
    location / {
        root /var/www/winter-bumper-tambola/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Enable Nginx config
ln -sf /etc/nginx/sites-available/winter-bumper-tambola /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
echo "✅ Nginx configured and restarted"

# Step 9: Setup SSL (Optional)
echo ""
read -p "Do you want to setup SSL with Let's Encrypt? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    apt-get install -y certbot python3-certbot-nginx
    read -p "Enter your domain name: " domain_name
    certbot certonly --nginx -d "$domain_name"
    echo "✅ SSL certificate installed"
    echo "   Update /etc/nginx/sites-available/winter-bumper-tambola to use HTTPS"
fi

echo ""
echo "=============================================="
echo "✅ Deployment Complete!"
echo "=============================================="
echo ""
echo "🔗 Your application is running at:"
echo "   http://$(hostname -I | awk '{print $1}')"
echo ""
echo "📊 Useful commands:"
echo "   pm2 logs wbt-backend              # View backend logs"
echo "   pm2 status                         # Check backend status"
echo "   pm2 restart wbt-backend            # Restart backend"
echo "   pm2 stop wbt-backend               # Stop backend"
echo "   tail -f /var/log/nginx/error.log  # Nginx errors"
echo ""
echo "📝 Configuration files:"
echo "   Backend:  /var/www/winter-bumper-tambola/backend/.env"
echo "   Nginx:    /etc/nginx/sites-available/winter-bumper-tambola"
echo "   MongoDB:  /etc/mongod.conf"
echo ""
echo "🔄 To update the application:"
echo "   cd /var/www/winter-bumper-tambola"
echo "   git pull origin main"
echo "   cd backend && npm install && pm2 restart wbt-backend"
echo "   cd ../frontend && npm run build && sudo systemctl restart nginx"
