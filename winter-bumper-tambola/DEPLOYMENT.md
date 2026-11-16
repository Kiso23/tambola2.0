# 🚀 Production Deployment Guide

## Option 1: Docker Compose (Easiest)

### Prerequisites
- Docker & Docker Compose installed
- Domain name (for SSL)
- A server (AWS, DigitalOcean, Heroku, etc.)

### Step 1: Prepare Environment
```bash
# SSH into your server
ssh user@your-server.com

# Clone or copy the project
git clone <your-repo-url> winter-bumper-tambola
cd winter-bumper-tambola
```

### Step 2: Configure Environment
```bash
# Copy and edit the environment file
cp .env.example .env

# Edit with your production values
nano .env
```

Update these critical values in `.env`:
```env
NODE_ENV=production
PORT=5000

# MongoDB (use MongoDB Atlas or managed service in production)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/winter-bumper-tambola?retryWrites=true&w=majority

# Secure JWT secrets (generate with: openssl rand -base64 32)
JWT_SECRET=<your-secure-32char-random-string>
JWT_REFRESH_SECRET=<your-secure-32char-random-string>

# Your domain
CLIENT_URL=https://yourdomain.com

# Rate limiting (adjust for expected traffic)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Step 3: Deploy with Docker Compose
```bash
# Build and start all services
docker-compose up -d --build

# Verify all services are running
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Step 4: Setup SSL/HTTPS (Recommended)
If using Nginx reverse proxy:

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx.conf to use SSL
# Add to nginx config:
listen 443 ssl;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

---

## Option 2: Manual Deployment (AWS EC2 / DigitalOcean)

### Prerequisites
- Ubuntu 20.04 LTS server
- Node.js 18+, npm, MongoDB, Nginx

### Step 1: SSH and Install Dependencies
```bash
ssh ubuntu@your-server-ip

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt-get install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 2: Deploy Backend
```bash
# Create app directory
sudo mkdir -p /var/www/winter-bumper-tambola
sudo chown -R ubuntu:ubuntu /var/www/winter-bumper-tambola

# Clone repository
cd /var/www/winter-bumper-tambola
git clone <your-repo-url> .

# Setup backend
cd backend
npm install --production

# Create .env file
nano .env
# (Add production values)

# Install PM2 for process management
sudo npm install -g pm2

# Start backend with PM2
pm2 start src/index.js --name "wbt-backend"
pm2 startup
pm2 save
```

### Step 3: Deploy Frontend
```bash
cd /var/www/winter-bumper-tambola/frontend

# Build production bundle
npm install
npm run build

# Serve with Nginx (see nginx config below)
```

### Step 4: Configure Nginx
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/winter-bumper-tambola
```

Paste this config:
```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS (once SSL is set up)
    # return 301 https://$server_name$request_uri;

    client_max_body_size 10M;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Frontend static files
    location / {
        root /var/www/winter-bumper-tambola/frontend/dist;
        try_files $uri $uri/ /index.html;
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

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

Enable the config:
```bash
sudo ln -s /etc/nginx/sites-available/winter-bumper-tambola /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## Option 3: Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Heroku account
- MongoDB Atlas (free tier available)

### Step 1: Setup Heroku
```bash
heroku login
cd winter-bumper-tambola
heroku create your-app-name
```

### Step 2: Add MongoDB Atlas
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Copy connection string

### Step 3: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/winter-bumper-tambola
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_REFRESH_SECRET=$(openssl rand -base64 32)
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com
```

### Step 4: Deploy
```bash
git push heroku main
heroku logs --tail
```

---

## Option 4: Render.com (Easiest Alternative)

### Step 1: Connect GitHub
1. Push code to GitHub
2. Go to https://render.com
3. Click "New" → "Web Service"
4. Select your GitHub repo

### Step 2: Configure Backend Service
- **Name**: winter-bumper-tambola-backend
- **Runtime**: Node
- **Build command**: `cd backend && npm install`
- **Start command**: `cd backend && npm start`
- **Environment variables**:
  ```
  NODE_ENV=production
  MONGODB_URI=<your-mongodb-atlas-uri>
  JWT_SECRET=<secure-random-32-chars>
  JWT_REFRESH_SECRET=<secure-random-32-chars>
  CLIENT_URL=<your-frontend-url>
  ```

### Step 3: Configure Frontend Service
- **Name**: winter-bumper-tambola-frontend
- **Runtime**: Node
- **Build command**: `cd frontend && npm install && npm run build`
- **Start command**: `npx serve -s dist -l 3000`
- **Environment variables**: None needed (frontend is static)

### Step 4: Link Database
Add PostgreSQL or MongoDB Atlas to both services.

---

## Monitoring & Maintenance

### Check Health
```bash
# Backend health check
curl https://yourdomain.com/health

# Logs
docker-compose logs -f
# or
pm2 logs wbt-backend
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild
docker-compose up -d --build

# or manually:
cd backend && npm install
cd ../frontend && npm run build
sudo systemctl restart nginx
```

### Backup MongoDB
```bash
# Local backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/winter-bumper-tambola" --out /backups/

# Restore
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net/winter-bumper-tambola" /backups/
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change `PORT` in `.env` or kill the process: `lsof -ti:5000 \| xargs kill -9` |
| MongoDB connection refused | Check `MONGODB_URI` in `.env`, verify MongoDB is running |
| Frontend shows 404 | Check Nginx config, rebuild frontend: `npm run build` |
| Socket.IO not connecting | Verify `CLIENT_URL` matches your domain, check CORS settings |
| SSL certificate error | Run certbot renew: `sudo certbot renew --dry-run` |

---

## Performance Optimization

1. **Enable Compression** ✅ (Already configured in Nginx + Backend)
2. **CDN** - Use Cloudflare for static assets
3. **Caching** - Frontend assets cached for 1 year
4. **Database Indexing** - Automatically done by Mongoose models
5. **Rate Limiting** - Configured per endpoint
6. **Load Balancing** - Use PM2 cluster mode for multiple workers:
   ```bash
   pm2 start src/index.js -i max --name "wbt-backend"
   ```

---

## Security Checklist

- ✅ HTTPS/SSL enabled
- ✅ Rate limiting on all endpoints
- ✅ Input validation with Joi
- ✅ MongoDB injection protection
- ✅ CORS whitelist configured
- ✅ Non-root Docker user
- ✅ JWT secret strong (32+ chars)
- ✅ Environment variables secured
- ✅ HTTP security headers (Helmet)
- ✅ CSP headers configured
- ✅ Server logs monitored
- ✅ Automatic backup scheduled
