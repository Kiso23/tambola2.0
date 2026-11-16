# ✅ JWT Authentication Setup Checklist

Follow this checklist to ensure JWT is properly configured before deployment.

---

## 🔑 Step 1: Generate JWT Secrets

**On your local computer, run:**

```bash
# Generate JWT_SECRET (run once)
openssl rand -base64 32

# Output example:
# aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3==

# Generate JWT_REFRESH_SECRET (run again, different output)
openssl rand -base64 32

# Output example:
# xY9zW8vU7tS6rQ5pO4nM3lK2jI1hG0fE9dC8bA7==
```

**Save both outputs:**
```
JWT_SECRET = aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3==
JWT_REFRESH_SECRET = xY9zW8vU7tS6rQ5pO4nM3lK2jI1hG0fE9dC8bA7==
```

---

## ✅ Step 2: Configure Backend Environment

### Update your backend `.env` file:

```env
# Production
NODE_ENV=production
PORT=10000

# MongoDB (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://tambola_user:PASSWORD@cluster.mongodb.net/winter-bumper-tambola

# JWT (use values from Step 1)
JWT_SECRET=aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3==
JWT_REFRESH_SECRET=xY9zW8vU7tS6rQ5pO4nM3lK2jI1hG0fE9dC8bA7==
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (your Vercel domain)
CLIENT_URL=https://winter-bumper.vercel.app

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Checklist:**
- [ ] JWT_SECRET is 32+ characters
- [ ] JWT_REFRESH_SECRET is 32+ characters (different from JWT_SECRET)
- [ ] Both secrets are NOT in your Git repo (check .env is in .gitignore)
- [ ] CLIENT_URL matches your Vercel frontend domain

---

## ✅ Step 3: Configure Frontend Environment

### Create/update `.env` in frontend folder:

```env
VITE_API_URL=https://winter-bumper-backend.onrender.com
```

**Checklist:**
- [ ] VITE_API_URL points to your Render backend
- [ ] URL includes https://
- [ ] No trailing slash

---

## ✅ Step 4: Verify Backend Files Exist

Check that these files exist in your backend:

```
backend/
  ├── src/
  │   ├── utils/
  │   │   ├── jwt.js              ← ✅ JWT utilities
  │   │   ├── logger.js
  │   │   └── helpers.js
  │   ├── middleware/
  │   │   ├── auth.js             ← ✅ Auth middleware
  │   │   ├── errorHandler.js
  │   │   ├── validate.js
  │   │   └── rateLimiter.js
  │   ├── controllers/
  │   │   ├── authController.js   ← ✅ Auth endpoints
  │   │   └── roomController.js
  │   ├── routes/
  │   │   ├── authRoutes.js       ← ✅ Auth routes
  │   │   └── roomRoutes.js
  │   ├── app.js                  ← Updated with auth routes
  │   └── index.js
```

**Run this to verify:**
```bash
ls -la backend/src/utils/jwt.js
ls -la backend/src/middleware/auth.js
ls -la backend/src/controllers/authController.js
ls -la backend/src/routes/authRoutes.js
```

**Checklist:**
- [ ] `backend/src/utils/jwt.js` exists
- [ ] `backend/src/middleware/auth.js` exists
- [ ] `backend/src/controllers/authController.js` exists
- [ ] `backend/src/routes/authRoutes.js` exists

---

## ✅ Step 5: Verify Frontend Files Exist

Check that these files exist in your frontend:

```
frontend/
  ├── src/
  │   ├── services/
  │   │   ├── auth.js             ← ✅ Auth API
  │   │   ├── socket.js
  │   │   └── api.js
  │   ├── hooks/
  │   │   ├── useAuth.js          ← ✅ Auth hook
  │   │   ├── useSocket.js
  │   │   └── (other hooks)
  │   ├── store/
  │   │   ├── authStore.js        ← ✅ Auth state
  │   │   └── gameStore.js
  │   ├── components/
  │   │   ├── layout/
  │   │   │   └── ProtectedRoute.jsx  ← ✅ Protected routes
  │   │   ├── game/
  │   │   └── ui/
  │   ├── pages/
  │   │   ├── LoginPage.jsx       ← ✅ Login UI
  │   │   ├── HomePage.jsx
  │   │   └── (other pages)
  │   └── App.jsx
```

**Run this to verify:**
```bash
ls -la frontend/src/services/auth.js
ls -la frontend/src/hooks/useAuth.js
ls -la frontend/src/store/authStore.js
ls -la frontend/src/components/layout/ProtectedRoute.jsx
ls -la frontend/src/pages/LoginPage.jsx
```

**Checklist:**
- [ ] `frontend/src/services/auth.js` exists
- [ ] `frontend/src/hooks/useAuth.js` exists
- [ ] `frontend/src/store/authStore.js` exists
- [ ] `frontend/src/components/layout/ProtectedRoute.jsx` exists
- [ ] `frontend/src/pages/LoginPage.jsx` exists

---

## ✅ Step 6: Test Locally (Optional)

### Start local development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Test JWT endpoints

```bash
# Test 1: Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "TestPlayer",
    "roomCode": ""
  }'

# Expected: Returns accessToken and refreshToken

# Test 2: Get current user (with token)
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:5000/api/auth/me

# Expected: Returns player info
```

**Checklist:**
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Login endpoint returns tokens
- [ ] Protected endpoint requires token
- [ ] Tokens are saved in localStorage (check DevTools)

---

## ✅ Step 7: Prepare for Deployment

### Update `.env` in backend for production

Before pushing to GitHub:

```env
# Remove from Git
rm backend/.env
rm frontend/.env

# Add to .gitignore (already done)
grep ".env" .gitignore
```

**Checklist:**
- [ ] `.env` file is in `.gitignore`
- [ ] `.env` NOT committed to GitHub
- [ ] Secrets will be set in Render dashboard (not in Git)

---

## ✅ Step 8: Deploy to Render (Backend)

1. Go to https://dashboard.render.com
2. Select your backend service
3. Click "Environment" tab
4. Add these variables:

```
NODE_ENV              production
PORT                  10000
MONGODB_URI           <your-mongodb-atlas-uri>
JWT_SECRET            <from-step-1>
JWT_REFRESH_SECRET    <from-step-1>
CLIENT_URL            https://winter-bumper.vercel.app
RATE_LIMIT_WINDOW_MS  900000
RATE_LIMIT_MAX        100
```

**Checklist:**
- [ ] All 8 environment variables set in Render
- [ ] JWT_SECRET is 32+ characters
- [ ] JWT_REFRESH_SECRET is different and 32+ characters
- [ ] CLIENT_URL matches your Vercel domain (with https://)
- [ ] Backend deployment completed

---

## ✅ Step 9: Deploy to Vercel (Frontend)

1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Go to "Settings" → "Environment Variables"
4. Add:

```
VITE_API_URL    https://winter-bumper-backend.onrender.com
```

**Checklist:**
- [ ] VITE_API_URL set in Vercel
- [ ] URL points to your Render backend (with https://)
- [ ] Frontend deployment completed

---

## ✅ Step 10: Update Render CLIENT_URL (if not done)

After Vercel deployment completes:

1. Go to https://dashboard.render.com
2. Select backend service
3. Click "Environment"
4. Update `CLIENT_URL` to match your Vercel URL
5. Save (triggers redeploy)

**Checklist:**
- [ ] CLIENT_URL updated to actual Vercel domain
- [ ] Backend redeployed with new CLIENT_URL

---

## ✅ Step 11: Verify Production JWT Works

### Test endpoints in production

```bash
# Test 1: Login
curl -X POST https://winter-bumper-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "ProductionTest",
    "roomCode": ""
  }'

# Expected: {"success": true, "data": {"accessToken": "...", ...}}

# Test 2: Open frontend
open https://winter-bumper.vercel.app

# Expected: Should load without errors
```

**Checklist:**
- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Login endpoint returns tokens
- [ ] Tokens are used in subsequent requests

---

## ✅ Final Verification Checklist

```
SECRETS & ENVIRONMENT
  ☐ JWT_SECRET is 32+ random characters
  ☐ JWT_REFRESH_SECRET is 32+ different characters
  ☐ Secrets NOT in Git
  ☐ Secrets set in Render dashboard
  ☐ VITE_API_URL set in Vercel dashboard

BACKEND FILES
  ☐ backend/src/utils/jwt.js exists
  ☐ backend/src/middleware/auth.js exists
  ☐ backend/src/controllers/authController.js exists
  ☐ backend/src/routes/authRoutes.js exists
  ☐ backend/src/app.js includes auth routes

FRONTEND FILES
  ☐ frontend/src/services/auth.js exists
  ☐ frontend/src/hooks/useAuth.js exists
  ☐ frontend/src/store/authStore.js exists
  ☐ frontend/src/components/layout/ProtectedRoute.jsx exists
  ☐ frontend/src/pages/LoginPage.jsx exists

DEPLOYMENT
  ☐ Render backend deployed
  ☐ Vercel frontend deployed
  ☐ All environment variables set
  ☐ Health check passes
  ☐ Frontend loads without errors
  ☐ Login works
  ☐ Tokens saved in localStorage
```

---

## 🎉 You're Ready!

All JWT authentication is configured and deployed. Your app now has:

✅ Secure login with JWT tokens
✅ Automatic token refresh
✅ Protected routes
✅ Token storage in localStorage
✅ CORS properly configured
✅ Production-ready security

**Next:** Start playing Tambola! 🎲
