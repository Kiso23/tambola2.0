const { verifyAccessToken, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Middleware: Verify Access Token
 * Checks Authorization header for valid JWT
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Auth error: ${err.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware: Verify Refresh Token
 * Used in refresh endpoint
 */
const refreshTokenMiddleware = (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn(`Refresh token error: ${err.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

/**
 * Middleware: Optional Auth (doesn't fail if no token)
 * Useful for endpoints that work both authenticated and anonymous
 */
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    }
  } catch (err) {
    logger.debug(`Optional auth skipped: ${err.message}`);
  }
  next();
};

module.exports = {
  authMiddleware,
  refreshTokenMiddleware,
  optionalAuth,
};
