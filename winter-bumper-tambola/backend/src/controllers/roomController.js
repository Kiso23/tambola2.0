const gameService = require('../services/gameService');
const logger = require('../utils/logger');

const createRoom = async (req, res, next) => {
  try {
    const { hostName, gameName, maxPlayers } = req.body;
    const room = await gameService.createRoom({ hostName, gameName, maxPlayers });

    res.status(201).json({
      success: true,
      data: {
        roomCode: room.code,
        hostToken: room.hostToken,
        gameName: room.gameName,
        hostName: room.hostName,
      },
    });
  } catch (err) {
    next(err);
  }
};

const joinRoom = async (req, res, next) => {
  try {
    const { roomCode, playerName } = req.body;
    const { room, playerToken } = await gameService.joinRoom({ roomCode, playerName });

    const player = room.players.find((p) => p.token === playerToken);

    res.status(200).json({
      success: true,
      data: {
        roomCode: room.code,
        gameName: room.gameName,
        hostName: room.hostName,
        playerToken,
        playerName: player.name,
        ticket: player.ticket,
        playerCount: room.players.length,
      },
    });
  } catch (err) {
    if (err.message === 'Room not found') res.status(404);
    else if (
      err.message === 'Game has already started' ||
      err.message === 'Room is full' ||
      err.message === 'Name already taken in this room'
    )
      res.status(409);
    next(err);
  }
};

const getRoomInfo = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const room = await gameService.getRoom(roomCode);
    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }
    res.json({ success: true, data: room.getPublicData() });
  } catch (err) {
    next(err);
  }
};

const startGame = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const { hostToken } = req.body;

    const room = await gameService.getRoom(roomCode);
    if (!room) { res.status(404); throw new Error('Room not found'); }
    if (room.hostToken !== hostToken) { res.status(403); throw new Error('Unauthorized'); }

    const updatedRoom = await gameService.startGame(roomCode);

    // Notify via socket (io is attached to req.app)
    const io = req.app.get('io');
    io.to(roomCode).emit('game:started', {
      calledNumbers: [],
      players: updatedRoom.players.map((p) => ({ name: p.name })),
    });

    res.json({ success: true, data: { status: updatedRoom.status } });
  } catch (err) {
    next(err);
  }
};

const callNumber = async (req, res, next) => {
  try {
    const { roomCode } = req.params;
    const { hostToken } = req.body;

    const room = await gameService.getRoom(roomCode);
    if (!room) { res.status(404); throw new Error('Room not found'); }
    if (room.hostToken !== hostToken) { res.status(403); throw new Error('Unauthorized'); }

    const { room: updatedRoom, number, gameOver } = await gameService.callNextNumber(roomCode);

    const io = req.app.get('io');

    if (gameOver) {
      io.to(roomCode).emit('game:over', { winners: updatedRoom.winners });
      return res.json({ success: true, data: { gameOver: true } });
    }

    io.to(roomCode).emit('number:called', {
      number,
      calledNumbers: updatedRoom.calledNumbers,
      lastCalledNumber: updatedRoom.lastCalledNumber,
      remainingCount: updatedRoom.remainingNumbers.length,
    });

    res.json({
      success: true,
      data: {
        number,
        calledNumbers: updatedRoom.calledNumbers,
        remainingCount: updatedRoom.remainingNumbers.length,
        gameOver: false,
      },
    });
  } catch (err) {
    next(err);
  }
};

const claimWin = async (req, res, next) => {
  try {
    const { roomCode, playerToken, pattern } = req.body;

    const { room, winner } = await gameService.claimWin({ roomCode, playerToken, pattern });

    const io = req.app.get('io');
    io.to(roomCode).emit('winner:announced', {
      playerName: winner.name,
      pattern: winner.pattern,
      winners: room.winners,
    });

    res.json({ success: true, data: { winner } });
  } catch (err) {
    if (err.message.includes('not found') || err.message === 'Room not found') res.status(404);
    else if (err.message.includes('Invalid') || err.message.includes('claimed')) res.status(400);
    next(err);
  }
};

module.exports = { createRoom, joinRoom, getRoomInfo, startGame, callNumber, claimWin };
