const express = require('express');
const router = express.Router();
const {
  login,
  refreshToken,
  logout,
  getCurrentUser,
} = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authMiddleware, refreshTokenMiddleware } = require('../middleware/auth');
const { joinRoomLimiter } = require('../middleware/rateLimiter');

/**
 * POST /auth/login
 * Public endpoint - login/register a player
 * Returns: { accessToken, refreshToken, player }
 */
router.post('/login', joinRoomLimiter, validate('login'), login);

/**
 * POST /auth/refresh
 * Public endpoint - refresh access token
 * Body: { refreshToken }
 * Returns: { accessToken }
 */
router.post('/refresh', refreshTokenMiddleware, refreshToken);

/**
 * POST /auth/logout
 * Protected endpoint - logout
 */
router.post('/logout', authMiddleware, logout);

/**
 * GET /auth/me
 * Protected endpoint - get current user from token
 */
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
