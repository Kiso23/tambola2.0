const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ticketNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked'],
      default: 'available',
    },
    bookedBy: {
      name: { type: String, trim: true, maxlength: 30 },
      email: { type: String, lowercase: true },
      phone: { type: String },
      loginId: { type: String, unique: true, sparse: true },
      bookedAt: { type: Date },
    },
    price: { type: Number, default: 100 },
    numbers: {
      rows: [[{ type: Number, default: null }]],
    },
    createdAt: { type: Date, default: Date.now, index: { expires: '30d' } },
  },
  { timestamps: true }
);

// Generate random ticket numbers (9x3 matrix with 90 numbers)
ticketSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  if (!this.numbers || !this.numbers.rows || this.numbers.rows.length === 0) {
    this.numbers = { rows: generateTicketNumbers() };
  }

  next();
});

function generateTicketNumbers() {
  const rows = [];
  const usedNumbers = new Set();

  for (let row = 0; row < 3; row++) {
    const rowNumbers = Array(9).fill(null);

    // Pick 5 random positions for numbers in this row
    const positions = [];
    while (positions.length < 5) {
      const pos = Math.floor(Math.random() * 9);
      if (!positions.includes(pos)) positions.push(pos);
    }

    positions.sort((a, b) => a - b);

    for (const pos of positions) {
      let number;
      const min = pos * 10 + 1;
      const max = (pos + 1) * 10;

      do {
        number = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (usedNumbers.has(number));

      usedNumbers.add(number);
      rowNumbers[pos] = number;
    }

    rows.push(rowNumbers);
  }

  return rows;
}

module.exports = mongoose.model('Ticket', ticketSchema);
