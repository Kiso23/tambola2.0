# 🔐 JWT Authentication Implementation Guide

Complete JWT (JSON Web Token) authentication for Winter Bumper Tambola.

---

## 📋 Overview

**What's Implemented:**

| Feature | Status |
|---------|--------|
| Access tokens | ✅ 7-day expiry |
| Refresh tokens | ✅ 30-day expiry |
| Automatic token refresh | ✅ Before expiry |
| Protected routes | ✅ Frontend routes |
| Auth middleware | ✅ Backend endpoints |
| Token storage | ✅ LocalStorage |
| Token validation | ✅ On request |

---

## 🔧 Backend JWT Setup

### 1. Environment Variables

```env
JWT_SECRET=<32-char-random>          # Main signing key
JWT_REFRESH_SECRET=<32-char-random>  # Refresh signing key
JWT_EXPIRES_IN=7d                    # Access token lifetime
JWT_REFRESH_EXPIRES_IN=30d          # Refresh token lifetime
```

Generate secrets:
```bash
openssl rand -base64 32
```

### 2. JWT Utility Functions

Location: `backend/src/utils/jwt.js`

```javascript
// Generate tokens
const { accessToken, refreshToken } = generateTokens({
  playerName: 'John',
  roomCode: 'WB1234'
});

// Verify access token
const decoded = verifyAccessToken(token);

// Verify refresh token
const decoded = verifyRefreshToken(token);

// Check if expired
const isExpired = isTokenExpired(token);
```

### 3. Authentication Middleware

Location: `backend/src/middleware/auth.js`

**Middleware Types:**

```javascript
// Require valid token
app.post('/api/protected', authMiddleware, handler);

// Require refresh token
app.post('/api/auth/refresh', refreshTokenMiddleware, handler);

// Optional token (works with or without)
app.get('/api/public', optionalAuth, handler);
```

### 4. Auth Routes

Location: `backend/src/routes/authRoutes.js`

**Endpoints:**

```
POST   /api/auth/login              Login/register player
POST   /api/auth/refresh            Refresh access token
POST   /api/auth/logout             Logout (requires auth)
GET    /api/auth/me                 Get current user (requires auth)
```

---

## 📱 Frontend JWT Integration

### 1. Auth Service

Location: `frontend/src/services/auth.js`

**Features:**
- Automatic token injection in all requests
- Automatic token refresh on 401
- Token storage/retrieval
- Logout handling

```javascript
import { authAPI, setTokens, clearTokens, isAuthenticated } from '../services/auth';

// Login
const response = await authAPI.login({
  playerName: 'John',
  roomCode: 'WB1234'
});
const { accessToken, refreshToken, player } = response.data;

// Save tokens
setTokens(accessToken, refreshToken);

// Check if authenticated
if (isAuthenticated()) {
  // user is logged in
}

// Logout
clearTokens();
```

### 2. Auth Hooks

Location: `frontend/src/hooks/useAuth.js`

```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, login, logout, isAuthenticated, loading } = useAuth();

  // Login
  const handleLogin = async (name, roomCode) => {
    await login(name, roomCode);
  };

  // Logout
  const handleLogout = () => {
    logout();
  };

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? (
    <div>Welcome {user.playerName}!</div>
  ) : (
    <div>Not logged in</div>
  );
}
```

### 3. Auth Store (Zustand)

Location: `frontend/src/store/authStore.js`

```javascript
import useAuthStore from '../store/authStore';

// Get auth state
const user = useAuthStore((s) => s.user);
const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

// Actions
const { login, logout, setTokens, updateUser } = useAuthStore();
```

### 4. Protected Routes

Location: `frontend/src/components/layout/ProtectedRoute.jsx`

```javascript
import ProtectedRoute from '../components/layout/ProtectedRoute';

<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route
    path="/lobby/:roomCode"
    element={
      <ProtectedRoute>
        <LobbyPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

---

## 🔄 Token Flow Diagram

```
User Login
    ↓
POST /api/auth/login
    ↓
✅ Server validates
    ↓
Generate JWT tokens:
  - accessToken (7 days)
  - refreshToken (30 days)
    ↓
Return tokens to frontend
    ↓
Frontend saves to localStorage
    ↓
All API requests include:
  Authorization: Bearer <accessToken>
    ↓
Server validates token
    ↓
✅ Request processed
    ↓
When accessToken expires:
    ↓
Intercept 401 error
    ↓
POST /api/auth/refresh + refreshToken
    ↓
Generate new accessToken
    ↓
Retry original request
    ↓
✅ Request succeeds
```

---

## 🔐 Security Features

### 1. Token Storage
- ✅ Stored in localStorage (not cookies)
- ✅ Cannot be accessed by scripts due to httpOnly option (on backend)
- ✅ Tokens include expiry time

### 2. Token Validation
- ✅ Signature verified on every request
- ✅ Expiry checked before use
- ✅ Payload cannot be modified without invalidating signature

### 3. Token Refresh
- ✅ Refresh token never sent to frontend API calls
- ✅ Only used in refresh endpoint
- ✅ Automatic refresh before expiry

### 4. Logout
- ✅ Tokens removed from localStorage
- ✅ No server-side blacklist needed (tokens just expire)
- ✅ XSS protection via Content Security Policy

---

## 💻 Usage Examples

### Example 1: Login with JWT

**Frontend:**
```javascript
import { authAPI, setTokens } from '../services/auth';
import useAuthStore from '../store/authStore';

async function handleLogin(playerName, roomCode) {
  try {
    const response = await authAPI.login({
      playerName,
      roomCode
    });

    const { accessToken, refreshToken, player } = response.data;

    // Save tokens
    setTokens(accessToken, refreshToken);

    // Update auth store
    useAuthStore.getState().login(player, accessToken, refreshToken);

    // Navigate to game
    navigate(`/lobby/${roomCode}`);
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### Example 2: Protected API Call

**Frontend:**
```javascript
// Automatically includes Authorization header
const response = await api.post('/api/rooms/claim', {
  roomCode: 'WB1234',
  playerToken: 'player-uuid',
  pattern: 'earlyFive'
});

// If 401, automatically refreshes and retries
```

**Backend:**
```javascript
// Endpoint is protected - only works with valid JWT
router.post('/api/rooms/claim', authMiddleware, claimWin);

// In handler:
const user = req.user; // Contains decoded JWT payload
console.log(user.playerName); // 'John'
```

### Example 3: Check if Token Expiring Soon

**Frontend:**
```javascript
import { useAuth } from '../hooks/useAuth';

function GameComponent() {
  const { isTokenExpiringSoon } = useAuth();

  // Warn user 5 minutes before expiry
  if (isTokenExpiringSoon()) {
    return <div className="alert">Your session expires in 5 minutes</div>;
  }

  return <div>Game</div>;
}
```

---

## 🧪 Testing JWT

### Test Login

```bash
# Request
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "TestPlayer",
    "roomCode": ""
  }'

# Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "player": {
      "playerName": "TestPlayer",
      "roomCode": null,
      "loginTime": "2024-01-15T10:30:00Z"
    }
  }
}
```

### Test Protected Route

```bash
# Without token (fails)
curl http://localhost:5000/api/auth/me

# Response: 401 Unauthorized

# With token (succeeds)
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:5000/api/auth/me

# Response: 200 OK with user data
```

### Test Token Refresh

```bash
# Request with refresh token
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'

# Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 🔍 Decode JWT Token (for debugging)

```javascript
// In browser console
function decodeJWT(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
  );
  return JSON.parse(jsonPayload);
}

const token = localStorage.getItem('accessToken');
console.log(decodeJWT(token));

// Output:
// {
//   playerName: "John",
//   roomCode: "WB1234",
//   loginTime: "2024-01-15T10:30:00Z",
//   iat: 1705315800,
//   exp: 1706038200
// }
```

---

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Invalid token" on login | Check JWT_SECRET is set in .env |
| 401 on protected route | Verify token is in Authorization header |
| Token not refreshing | Check JWT_REFRESH_SECRET is set and different from JWT_SECRET |
| CORS error with auth | Verify CLIENT_URL matches frontend domain in backend |
| Token shows in network but not sent | Check browser's localStorage for tokens |
| Tokens not persisting after refresh | Check localStorage is not cleared by browser |

---

## 🚀 Production Checklist

Before deploying:

- [ ] JWT_SECRET is 32+ random characters (generate with `openssl rand -base64 32`)
- [ ] JWT_REFRESH_SECRET is different from JWT_SECRET
- [ ] Both secrets are in `.env` (not committed to git)
- [ ] CLIENT_URL matches your production frontend domain
- [ ] HTTPS enabled (JWT tokens sent over HTTPS only)
- [ ] Token expiry times set appropriately (7d access, 30d refresh)
- [ ] Auth middleware protecting sensitive endpoints
- [ ] Token refresh working before expiry
- [ ] Logout clears localStorage
- [ ] Protected routes redirect to login

---

## 📚 Files Created

```
backend/
  ├── src/
  │   ├── utils/jwt.js              ← JWT utilities
  │   ├── middleware/auth.js        ← Auth middleware
  │   ├── controllers/authController.js  ← Auth endpoints
  │   └── routes/authRoutes.js      ← Auth routes

frontend/
  ├── src/
  │   ├── services/auth.js          ← Auth API + interceptor
  │   ├── hooks/useAuth.js          ← Auth hook
  │   ├── store/authStore.js        ← Auth state (Zustand)
  │   ├── components/layout/ProtectedRoute.jsx
  │   └── pages/LoginPage.jsx       ← Login UI
```

---

## 🔗 Next Steps

1. ✅ JWT implemented in backend
2. ✅ JWT integrated in frontend
3. ✅ Token storage/refresh working
4. ✅ Protected routes configured
5. **→ Deploy to production (Vercel + Render)**
6. → Add optional: Logout endpoint
7. → Add optional: Token blacklist for immediate logout

---

## 📖 References

- JWT.io: https://jwt.io
- Socket.IO Auth: https://socket.io/docs/v4/authenticating-users/
- localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- Axios interceptors: https://axios-http.com/docs/interceptors
