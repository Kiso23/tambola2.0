# ⚡ Quick Start Deployment

Choose your deployment method:

---

## 🐳 Docker (Recommended - Easiest)

**Perfect for:** Any cloud provider, local testing, production

```bash
# 1. Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH=$(openssl rand -base64 32)
echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH"

# 2. Edit .env with your values
cp .env.example .env
nano .env

# 3. Deploy
chmod +x deploy-docker.sh
./deploy-docker.sh

# 4. Access at http://localhost
```

**Verify it's working:**
```bash
docker-compose ps              # All services running?
curl http://localhost/health   # Backend responds?
docker-compose logs -f backend # Any errors?
```

**Stop/Update:**
```bash
docker-compose down                    # Stop all
docker-compose up -d --build          # Restart/rebuild
```

---

## 🖥️ VPS/EC2 (AWS, DigitalOcean, Linode)

**Perfect for:** Full control, custom config, existing infrastructure

```bash
# SSH into your server
ssh ubuntu@your-server-ip

# Download deployment script
curl -O https://raw.githubusercontent.com/your-repo/deploy-manual.sh
chmod +x deploy-manual.sh

# Run deployment (requires sudo/root)
sudo ./deploy-manual.sh

# It will:
# ✅ Install Node.js, MongoDB, Nginx
# ✅ Deploy backend (PM2 managed)
# ✅ Build & serve frontend
# ✅ Configure Nginx reverse proxy
# ✅ Optional: Setup SSL
```

**Check status:**
```bash
pm2 status                # Backend running?
pm2 logs wbt-backend     # Backend logs
sudo nginx -t            # Nginx config OK?
sudo systemctl status nginx
curl http://localhost/health
```

**Update application:**
```bash
cd /var/www/winter-bumper-tambola
git pull origin main
cd backend && npm install && pm2 restart wbt-backend
cd ../frontend && npm run build && sudo systemctl restart nginx
```

---

## ☁️ Heroku (Free tier available, auto-deploys from Git)

**Perfect for:** Quick deployment, minimal DevOps

```bash
# Install Heroku CLI
brew install heroku   # macOS
# or npm install -g heroku

# Login
heroku login

# Create app
cd winter-bumper-tambola
heroku create your-app-name

# Add buildpacks
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add https://buildpack-registry.s3.amazonaws.com/buildpacks/heroku-community/multi-procfile.tgz

# Create Procfile
cat > Procfile << 'EOF'
web: cd backend && npm start
EOF

# Create MongoDB Atlas database (free tier)
# https://www.mongodb.com/cloud/atlas
# Copy connection string

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/winter-bumper-tambola
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_REFRESH_SECRET=$(openssl rand -base64 32)
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com

# Deploy
git push heroku main

# Check logs
heroku logs --tail

# Visit
open https://your-app-name.herokuapp.com
```

**Update:**
```bash
git push heroku main  # Auto-deploys
heroku logs --tail
```

---

## 🚀 Render.com (Easiest alternative to Heroku)

**Perfect for:** GitHub-connected auto-deploy, free tier

1. Push your code to GitHub
2. Go to https://render.com → Sign up
3. Click "New" → "Web Service"
4. Select your GitHub repo
5. Configure:
   - **Build command**: `cd backend && npm install`
   - **Start command**: `cd backend && npm start`
   - **Environment**: Add vars (MONGODB_URI, JWT_SECRET, etc.)
6. Click "Create Web Service"
7. Frontend: Deploy as separate Static Site from `/frontend/dist`

---

## 🔧 Environment Variables Required

For all methods, ensure `.env` has:

```env
NODE_ENV=production                           # NOT development
PORT=5000

# MongoDB (get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Generate with: openssl rand -base64 32
JWT_SECRET=<32-char-random-string>
JWT_REFRESH_SECRET=<32-char-random-string>

# Your domain
CLIENT_URL=https://yourdomain.com

# Rate limiting (adjust for your traffic)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

---

## ✅ Health Checks After Deployment

```bash
# 1. Backend responds
curl https://yourdomain.com/health
# Expected: {"status":"ok","uptime":<seconds>,"timestamp":<ms>}

# 2. Frontend loads
curl https://yourdomain.com | grep "Winter Bumper"
# Should get HTML with the app

# 3. Create a test room
curl -X POST https://yourdomain.com/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"hostName":"Test"}'
# Should return: {"success":true,"data":{"roomCode":"..."}}

# 4. Check logs
# Docker: docker-compose logs -f
# VPS: pm2 logs wbt-backend
# Heroku: heroku logs --tail
```

---

## 🔒 Security Checklist

Before going live:

- [ ] JWT_SECRET is 32+ random characters
- [ ] MONGODB_URI uses strong password (not `admin:admin`)
- [ ] CLIENT_URL matches your actual domain
- [ ] HTTPS/SSL enabled (especially for JWT tokens)
- [ ] Rate limits configured for expected traffic
- [ ] Database backups scheduled
- [ ] Monitoring/alerts setup
- [ ] Error logs checked
- [ ] Load tested (simulate users)

---

## 📊 Performance Tuning

```bash
# 1. Enable Node.js cluster mode (uses all CPU cores)
pm2 start src/index.js -i max

# 2. Add MongoDB Atlas (managed MongoDB)
# https://www.mongodb.com/cloud/atlas

# 3. Use Cloudflare CDN
# Caches static assets globally

# 4. Setup backup
# For MongoDB: https://www.mongodb.com/cloud/atlas → Automated Backups
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Port 5000 already in use" | `lsof -ti:5000 \| xargs kill -9` |
| "Cannot connect to MongoDB" | Check MONGODB_URI in .env, verify IP whitelisted in Atlas |
| "Frontend shows 404" | Rebuild: `npm run build`, check Nginx config |
| "Socket.IO not connecting" | Verify CLIENT_URL matches domain, check CSP headers |
| "SSL certificate error" | Renew: `sudo certbot renew --dry-run` |
| "High memory usage" | Use PM2 cluster: `pm2 start src/index.js -i max` |

---

## 📚 Full Guides

- **Docker**: See `DEPLOYMENT.md` → Option 1
- **VPS/EC2**: See `DEPLOYMENT.md` → Option 2
- **Heroku**: See `DEPLOYMENT.md` → Option 3
- **Render**: See `DEPLOYMENT.md` → Option 4
