const crypto = require('crypto');

/**
 * Generates a unique room code like "WB7261"
 */
function generateRoomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix =
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)];
  const nums = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${nums}`;
}

/**
 * Creates a secure random token
 */
function generateToken() {
  return crypto.randomUUID();
}

/**
 * Sanitizes a string for safe use
 */
function sanitizeName(name) {
  return name.replace(/[<>'";&]/g, '').trim().slice(0, 30);
}

module.exports = { generateRoomCode, generateToken, sanitizeName };
