const Room = require('../models/Room');
const { generateTicket, verifyClaim } = require('./ticketService');
const { generateRoomCode } = require('../utils/helpers');
const logger = require('../utils/logger');

async function createRoom({ hostName, gameName, maxPlayers = 50 }) {
  const code = generateRoomCode();
  const room = new Room({
    code,
    hostName,
    hostToken: require('crypto').randomUUID(),
    gameName: gameName || 'Winter Bumper Tambola',
    maxPlayers,
    remainingNumbers: Array.from({ length: 90 }, (_, i) => i + 1),
  });
  await room.save();
  return room;
}

async function joinRoom({ roomCode, playerName }) {
  const room = await Room.findOne({ code: roomCode.toUpperCase() });
  if (!room) throw new Error('Room not found');
  if (room.status !== 'waiting') throw new Error('Game has already started');
  if (room.players.length >= room.maxPlayers) throw new Error('Room is full');

  const duplicate = room.players.find(
    (p) => p.name.toLowerCase() === playerName.toLowerCase()
  );
  if (duplicate) throw new Error('Name already taken in this room');

  const ticket = generateTicket();
  const playerToken = require('crypto').randomUUID();

  room.players.push({
    name: playerName,
    token: playerToken,
    ticket,
    markedNumbers: [],
  });

  await room.save();
  return { room, playerToken };
}

async function startGame(roomCode) {
  const room = await Room.findOne({ code: roomCode });
  if (!room) throw new Error('Room not found');
  if (room.players.length < 1) throw new Error('Need at least 1 player');
  if (room.status !== 'waiting') throw new Error('Game already started');

  room.status = 'playing';
  room.remainingNumbers = shuffle(Array.from({ length: 90 }, (_, i) => i + 1));
  await room.save();
  return room;
}

async function callNextNumber(roomCode) {
  const room = await Room.findOne({ code: roomCode });
  if (!room) throw new Error('Room not found');
  if (room.status !== 'playing') throw new Error('Game is not active');
  if (room.remainingNumbers.length === 0) {
    room.status = 'finished';
    await room.save();
    return { room, number: null, gameOver: true };
  }

  const number = room.remainingNumbers.shift();
  room.calledNumbers.push(number);
  room.lastCalledNumber = number;

  // Auto-mark all player tickets
  for (const player of room.players) {
    const ticketNums = player.ticket.rows.flat().filter((n) => n !== null);
    if (ticketNums.includes(number)) {
      if (!player.markedNumbers.includes(number)) {
        player.markedNumbers.push(number);
      }
    }
  }

  await room.save();
  return { room, number, gameOver: false };
}

async function claimWin({ roomCode, playerToken, pattern }) {
  const room = await Room.findOne({ code: roomCode });
  if (!room) throw new Error('Room not found');
  if (room.status !== 'playing') throw new Error('Game is not active');

  const validPatterns = ['earlyFive', 'topLine', 'middleLine', 'bottomLine', 'fullHouse'];
  if (!validPatterns.includes(pattern)) throw new Error('Invalid pattern');

  const player = room.players.find((p) => p.token === playerToken);
  if (!player) throw new Error('Player not found');

  if (player.claims[pattern]) throw new Error('Already claimed this pattern');

  // Check if already won by another
  const alreadyWon = room.winners.some(
    (w) => w.pattern === pattern && w.verified
  );
  if (alreadyWon) throw new Error('This pattern has already been claimed');

  // Verify the claim
  const isValid = verifyClaim(
    player.ticket,
    player.markedNumbers,
    room.calledNumbers,
    pattern
  );

  if (!isValid) throw new Error('Invalid claim — pattern not complete');

  player.claims[pattern] = true;
  room.patterns[pattern] = true;
  room.winners.push({
    playerToken: player.token,
    playerName: player.name,
    pattern,
    verified: true,
  });

  await room.save();
  logger.info(`Winner: ${player.name} claimed ${pattern} in room ${roomCode}`);
  return { room, winner: { name: player.name, pattern } };
}

async function getRoom(roomCode) {
  return Room.findOne({ code: roomCode.toUpperCase() });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

module.exports = { createRoom, joinRoom, startGame, callNextNumber, claimWin, getRoom };
