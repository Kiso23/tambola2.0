const gameService = require('../services/gameService');
const logger = require('../utils/logger');

// Store auto-call intervals
const autoCallIntervals = new Map();

module.exports = function setupSocket(io) {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const { roomCode, playerToken, hostToken } = socket.handshake.auth;
    if (!roomCode) {
      return next(new Error('Room code required'));
    }
    socket.roomCode = roomCode.toUpperCase();
    socket.playerToken = playerToken || null;
    socket.hostToken = hostToken || null;
    next();
  });

  io.on('connection', async (socket) => {
    const { roomCode, playerToken, hostToken } = socket;
    logger.info(`Socket connected: ${socket.id} → Room ${roomCode}`);

    try {
      const room = await gameService.getRoom(roomCode);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        socket.disconnect();
        return;
      }

      // Join the socket room
      socket.join(roomCode);

      // Update player's socketId
      if (playerToken) {
        const player = room.players.find((p) => p.token === playerToken);
        if (player) {
          player.socketId = socket.id;
          await room.save();
        }
      }

      // Emit current room state to the joining socket
      socket.emit('room:state', {
        roomCode: room.code,
        gameName: room.gameName,
        hostName: room.hostName,
        status: room.status,
        playerCount: room.players.length,
        players: room.players.map((p) => ({ name: p.name })),
        calledNumbers: room.calledNumbers,
        lastCalledNumber: room.lastCalledNumber,
        winners: room.winners,
        patterns: room.patterns,
      });

      // Notify others in room
      socket.to(roomCode).emit('player:joined', {
        playerCount: room.players.length,
        players: room.players.map((p) => ({ name: p.name })),
      });

      // Handle host calling a number via socket
      socket.on('host:callNumber', async () => {
        try {
          const r = await gameService.getRoom(roomCode);
          if (!r || r.hostToken !== hostToken) {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }
          const { room: updated, number, gameOver } = await gameService.callNextNumber(roomCode);
          if (gameOver) {
            io.to(roomCode).emit('game:over', { winners: updated.winners });
          } else {
            io.to(roomCode).emit('number:called', {
              number,
              calledNumbers: updated.calledNumbers,
              lastCalledNumber: updated.lastCalledNumber,
              remainingCount: updated.remainingNumbers.length,
            });
          }
        } catch (err) {
          socket.emit('error', { message: err.message });
        }
      });

      // Handle host starting game via socket
      socket.on('host:startGame', async () => {
        try {
          const r = await gameService.getRoom(roomCode);
          if (!r || r.hostToken !== hostToken) {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }
          const updated = await gameService.startGame(roomCode);
          io.to(roomCode).emit('game:started', {
            calledNumbers: [],
            players: updated.players.map((p) => ({ name: p.name })),
            remainingCount: updated.remainingNumbers.length,
          });
        } catch (err) {
          socket.emit('error', { message: err.message });
        }
      });

      // Handle host enabling auto-call (4 seconds between calls)
      socket.on('host:enableAutoCall', async () => {
        try {
          const r = await gameService.getRoom(roomCode);
          if (!r || r.hostToken !== hostToken) {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }

          if (autoCallIntervals.has(roomCode)) {
            socket.emit('error', { message: 'Auto-call already enabled' });
            return;
          }

          const interval = setInterval(async () => {
            try {
              const room = await gameService.getRoom(roomCode);
              if (!room || room.status !== 'playing') {
                clearInterval(interval);
                autoCallIntervals.delete(roomCode);
                return;
              }

              const { room: updated, number, gameOver } = await gameService.callNextNumber(roomCode);

              if (gameOver) {
                io.to(roomCode).emit('game:over', { winners: updated.winners });
                clearInterval(interval);
                autoCallIntervals.delete(roomCode);
              } else {
                io.to(roomCode).emit('number:called', {
                  number,
                  calledNumbers: updated.calledNumbers,
                  lastCalledNumber: updated.lastCalledNumber,
                  remainingCount: updated.remainingNumbers.length,
                  autoCall: true,
                });
              }
            } catch (err) {
              logger.error(`Auto-call error for room ${roomCode}: ${err.message}`);
              clearInterval(interval);
              autoCallIntervals.delete(roomCode);
            }
          }, 4000); // 4 seconds between calls

          autoCallIntervals.set(roomCode, interval);
          socket.emit('autoCall:enabled');
          socket.to(roomCode).emit('autoCall:enabled');
        } catch (err) {
          socket.emit('error', { message: err.message });
        }
      });

      // Handle host disabling auto-call
      socket.on('host:disableAutoCall', async () => {
        try {
          const r = await gameService.getRoom(roomCode);
          if (!r || r.hostToken !== hostToken) {
            socket.emit('error', { message: 'Unauthorized' });
            return;
          }

          if (autoCallIntervals.has(roomCode)) {
            clearInterval(autoCallIntervals.get(roomCode));
            autoCallIntervals.delete(roomCode);
          }

          socket.emit('autoCall:disabled');
          socket.to(roomCode).emit('autoCall:disabled');
        } catch (err) {
          socket.emit('error', { message: err.message });
        }
      });
      socket.on('player:claim', async ({ pattern }) => {
        try {
          if (!playerToken) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
          }
          const { room: updated, winner } = await gameService.claimWin({
            roomCode,
            playerToken,
            pattern,
          });
          io.to(roomCode).emit('winner:announced', {
            playerName: winner.name,
            pattern: winner.pattern,
            winners: updated.winners,
            patterns: updated.patterns,
          });
          socket.emit('claim:success', { pattern });
        } catch (err) {
          socket.emit('claim:failed', { message: err.message });
        }
      });

      // Chat message (optional in-game chat)
      socket.on('chat:message', (data) => {
        const name = room.players.find((p) => p.token === playerToken)?.name || 'Anonymous';
        io.to(roomCode).emit('chat:message', {
          name,
          message: String(data.message || '').slice(0, 200),
          at: new Date().toISOString(),
        });
      });

      socket.on('disconnect', async () => {
        logger.info(`Socket disconnected: ${socket.id} from room ${roomCode}`);
        try {
          const r = await gameService.getRoom(roomCode);
          if (r && playerToken) {
            const p = r.players.find((pl) => pl.token === playerToken);
            if (p) {
              p.socketId = null;
              await r.save();
            }
          }
          socket.to(roomCode).emit('player:left', {
            playerCount: (await gameService.getRoom(roomCode))?.players.length ?? 0,
          });
        } catch (_) {}
      });
    } catch (err) {
      logger.error(`Socket error: ${err.message}`);
      socket.emit('error', { message: 'Server error' });
      socket.disconnect();
    }
  });
};
