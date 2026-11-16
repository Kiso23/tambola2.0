# 🚀 Final Deployment Steps (With JWT)

Complete step-by-step guide to deploy Winter Bumper Tambola with JWT authentication.

---

## ⏱️ Total Time: ~30 minutes

---

## 📋 Pre-Deployment Checklist

Before starting, make sure you have:

- [ ] GitHub account with code pushed
- [ ] MongoDB Atlas account with cluster created
- [ ] Vercel account
- [ ] Render account
- [ ] All 3 accounts connected to GitHub

---

## 🔑 STEP 1: Generate JWT Secrets (5 minutes)

### On your computer terminal:

```bash
# Generate JWT_SECRET
openssl rand -base64 32
# Copy the output, paste in notepad

# Generate JWT_REFRESH_SECRET (run again)
openssl rand -base64 32
# Copy this output too, paste in notepad
```

**You now have:**
- JWT_SECRET = `xxxxxx...` (32+ chars)
- JWT_REFRESH_SECRET = `yyyyyy...` (32+ chars)

---

## 🗄️ STEP 2: Setup MongoDB Atlas (5 minutes)

### 2.1 Create Database User

1. Go to https://cloud.mongodb.com
2. Click "Database Access"
3. Click "Add New Database User"
4. Username: `tambola_user`
5. Password: Generate secure password (save this!)
6. Built-in Role: `readWriteAnyDatabase`
7. Click "Add User"

### 2.2 Get Connection String

1. Go to "Clusters"
2. Click "Connect"
3. Choose "Drivers"
4. Copy the connection string

It should look like:
```
mongodb+srv://tambola_user:PASSWORD@winter-bumper.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Add database name at the end:**
```
mongodb+srv://tambola_user:PASSWORD@winter-bumper.xxxxx.mongodb.net/winter-bumper-tambola?retryWrites=true&w=majority
```

**You now have:**
- MONGODB_URI = `mongodb+srv://tambola_user:...`

### 2.3 Whitelist IP

1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Confirm

---

## 🚀 STEP 3: Deploy Backend to Render (5 minutes)

### 3.1 In Render Dashboard

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Select your GitHub repo (`winter-bumper-tambola`)
4. Click "Connect"

### 3.2 Configure Service

Fill in these fields:

| Field | Value |
|-------|-------|
| Name | `winter-bumper-backend` |
| Environment | `Node` |
| Build Command | `cd backend && npm install` |
| Start Command | `cd backend && npm start` |
| Instance Type | `Free` |

Click "Create Web Service"

### 3.3 Add Environment Variables

Wait for the service to be created, then:

1. Click your service
2. Go to "Environment" tab
3. Click "Add Environment Variable"

Add all these variables:

```
NODE_ENV                 production
PORT                     10000
MONGODB_URI              mongodb+srv://tambola_user:PASSWORD@...
JWT_SECRET               aB1cD2eF3gH4iJ5kL6...
JWT_REFRESH_SECRET       xY9zW8vU7tS6rQ5pO...
JWT_EXPIRES_IN           7d
JWT_REFRESH_EXPIRES_IN   30d
CLIENT_URL               https://winter-bumper.vercel.app
RATE_LIMIT_WINDOW_MS     900000
RATE_LIMIT_MAX           100
```

Click "Save" after adding all

**Wait for deployment (2-3 minutes)**

### 3.4 Get Backend URL

When deployment completes:
```
https://winter-bumper-backend.onrender.com
```

Save this URL!

---

## 🎨 STEP 4: Deploy Frontend to Vercel (5 minutes)

### 4.1 In Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your `winter-bumper-tambola` repo
4. Click "Import"

### 4.2 Configure Project

1. **Framework Preset:** `Vite`
2. **Root Directory:** Click "Edit" → select `./frontend` → "Select"
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`

### 4.3 Add Environment Variables

In the "Environment Variables" section:

```
Name: VITE_API_URL
Value: https://winter-bumper-backend.onrender.com
```

Click "Add"

### 4.4 Deploy

Click "Deploy"

**Wait for deployment (1-2 minutes)**

### 4.5 Get Frontend URL

When deployment completes:
```
https://winter-bumper.vercel.app
```

Save this URL!

---

## ⚙️ STEP 5: Update Backend CLIENT_URL (2 minutes)

Now that you have your Vercel URL, update Render:

1. Go back to https://dashboard.render.com
2. Click your backend service
3. Go to "Environment" tab
4. Find `CLIENT_URL`
5. Change it to your Vercel URL:
   ```
   https://winter-bumper.vercel.app
   ```
6. Click "Save"

**Backend will auto-redeploy (2-3 minutes)**

---

## ✅ STEP 6: Verify Everything Works (3 minutes)

### 6.1 Check Backend Health

```bash
curl https://winter-bumper-backend.onrender.com/health
```

Should return:
```json
{"status":"ok","uptime":123,"timestamp":1234567890}
```

### 6.2 Open Frontend

Go to: https://winter-bumper.vercel.app

Should see the Winter Bumper Tambola home page

### 6.3 Test Login

1. Click "Create Game" (or go to `/login`)
2. Enter name and create room
3. Should see room code and players list
4. Try "Join Game" from another browser tab

### 6.4 Check localStorage

In browser console (F12):
```javascript
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
```

Should show JWT tokens (long strings starting with `eyJ`)

---

## 🎉 DEPLOYMENT COMPLETE!

Your application is now live with JWT authentication!

✅ Frontend: https://winter-bumper.vercel.app
✅ Backend: https://winter-bumper-backend.onrender.com  
✅ Database: MongoDB Atlas
✅ Security: JWT tokens
✅ Auto-deployment: Push to GitHub → auto-deploys

---

## 📝 Environment Variables Reference

### What You Set in Render (Backend)

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://tambola_user:PASSWORD@cluster.mongodb.net/winter-bumper-tambola
JWT_SECRET=<your-32-char-secret>
JWT_REFRESH_SECRET=<your-different-32-char-secret>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
CLIENT_URL=https://winter-bumper.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### What You Set in Vercel (Frontend)

```
VITE_API_URL=https://winter-bumper-backend.onrender.com
```

---

## 🔒 Security Notes

1. **Secrets are safe:** JWT_SECRET and JWT_REFRESH_SECRET are set in Render dashboard (not in Git)
2. **HTTPS enabled:** Both Vercel and Render provide free HTTPS
3. **Tokens are safe:** Stored in localStorage, verified on every request
4. **CORS configured:** Only allows requests from your Vercel domain

---

## 📊 After Deployment

### Monitor

- Vercel logs: https://vercel.com/dashboard → Your project → Deployments
- Render logs: https://dashboard.render.com → Your service → Logs

### Update Application

Push code to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Auto-deploys to Vercel + Render! ✨

### Scale

- Render Free tier: Backend sleeps after 15 min inactivity
- Upgrade to Starter ($7/mo) to keep always-on
- Vercel always-on (included in free tier)
- MongoDB free tier: 5GB storage

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check MONGODB_URI, verify IP whitelisted |
| "401 Unauthorized" | Check JWT_SECRET is set in Render |
| "Frontend won't load" | Check VITE_API_URL in Vercel |
| "Tokens not working" | Hard refresh: Ctrl+Shift+R |
| "Backend crashed" | Check Render logs for errors |

---

## 🎊 You're Live!

Share your game: https://winter-bumper.vercel.app

Enjoy! 🎲❄️

---

## 📚 Documentation

- **JWT_AUTH_GUIDE.md** - Complete JWT implementation guide
- **JWT_SETUP_CHECKLIST.md** - Detailed setup checklist
- **JWT_QUICK_SUMMARY.txt** - Quick reference
- **DEPLOY_VERCEL_RENDER_MONGODB.md** - Deployment guide without JWT
- **QUICK_START_DEPLOY.md** - General deployment options
