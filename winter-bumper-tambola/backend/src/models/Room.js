const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  socketId: { type: String },
  name: { type: String, required: true, trim: true, maxlength: 30 },
  token: { type: String, required: true },
  ticket: {
    rows: [[{ type: Number, default: null }]],
  },
  markedNumbers: [{ type: Number }],
  claims: {
    earlyFive: { type: Boolean, default: false },
    topLine: { type: Boolean, default: false },
    middleLine: { type: Boolean, default: false },
    bottomLine: { type: Boolean, default: false },
    fullHouse: { type: Boolean, default: false },
  },
  joinedAt: { type: Date, default: Date.now },
});

const winnerSchema = new mongoose.Schema({
  playerToken: String,
  playerName: String,
  pattern: String,
  claimedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
});

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    hostName: { type: String, required: true, trim: true, maxlength: 30 },
    hostToken: { type: String, required: true },
    gameName: { type: String, default: 'Winter Bumper Tambola', trim: true, maxlength: 50 },
    status: {
      type: String,
      enum: ['waiting', 'playing', 'finished'],
      default: 'waiting',
    },
    players: [playerSchema],
    calledNumbers: [{ type: Number }],
    remainingNumbers: [{ type: Number }],
    lastCalledNumber: { type: Number, default: null },
    winners: [winnerSchema],
    patterns: {
      earlyFive: { type: Boolean, default: false },
      topLine: { type: Boolean, default: false },
      middleLine: { type: Boolean, default: false },
      bottomLine: { type: Boolean, default: false },
      fullHouse: { type: Boolean, default: false },
    },
    maxPlayers: { type: Number, default: 50 },
    autoCall: { type: Boolean, default: false },
    autoCallInterval: { type: Number, default: 5000 },
    createdAt: { type: Date, default: Date.now, index: { expires: '24h' } },
  },
  { timestamps: true }
);

roomSchema.methods.getPublicData = function () {
  return {
    code: this.code,
    gameName: this.gameName,
    hostName: this.hostName,
    status: this.status,
    playerCount: this.players.length,
    calledNumbers: this.calledNumbers,
    lastCalledNumber: this.lastCalledNumber,
    winners: this.winners,
    patterns: this.patterns,
    maxPlayers: this.maxPlayers,
  };
};

module.exports = mongoose.model('Room', roomSchema);
