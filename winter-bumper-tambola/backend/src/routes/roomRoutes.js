const express = require('express');
const router = express.Router();
const {
  createRoom,
  joinRoom,
  getRoomInfo,
  startGame,
  callNumber,
  claimWin,
} = require('../controllers/roomController');
const validate = require('../middleware/validate');
const { createRoomLimiter, joinRoomLimiter } = require('../middleware/rateLimiter');

router.post('/create', createRoomLimiter, validate('createRoom'), createRoom);
router.post('/join', joinRoomLimiter, validate('joinRoom'), joinRoom);
router.get('/:roomCode', getRoomInfo);
router.post('/:roomCode/start', startGame);
router.post('/:roomCode/call', callNumber);
router.post('/claim', validate('claimWin'), claimWin);

module.exports = router;
