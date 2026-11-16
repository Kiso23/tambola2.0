const { generateTokens, verifyRefreshToken, generateAccessToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Register / Login (same endpoint for Tambola since it's session-based)
 * Returns access token and refresh token
 */
const login = async (req, res, next) => {
  try {
    const { playerName, roomCode } = req.body;

    if (!playerName || !playerName.trim()) {
      res.status(400);
      throw new Error('Player name required');
    }

    // Create user payload
    const userPayload = {
      playerName: playerName.trim(),
      roomCode: roomCode ? roomCode.toUpperCase() : null,
      loginTime: new Date().toISOString(),
    };

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userPayload);

    logger.info(`Login: ${playerName} at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        player: userPayload,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Refresh Access Token
 * Accepts refresh token, returns new access token
 */
const refreshToken = async (req, res, next) => {
  try {
    const user = req.user;

    // Generate new access token with same payload
    const newAccessToken = generateAccessToken({
      playerName: user.playerName,
      roomCode: user.roomCode,
      loginTime: user.loginTime,
    });

    logger.info(`Token refreshed for: ${user.playerName}`);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Logout (client-side operation, but useful endpoint)
 * Just returns success - tokens are invalidated by expiry
 */
const logout = async (req, res, next) => {
  try {
    const user = req.user;
    logger.info(`Logout: ${user.playerName}`);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Current User (from token)
 */
const getCurrentUser = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  refreshToken,
  logout,
  getCurrentUser,
};
