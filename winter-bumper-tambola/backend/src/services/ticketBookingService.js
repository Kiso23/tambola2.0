const Ticket = require('../models/Ticket');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Initialize 80 tickets with random numbers and serial numbers
 */
async function initializeTickets() {
  const existingCount = await Ticket.countDocuments();
  if (existingCount >= 80) {
    logger.info('Tickets already initialized');
    return;
  }

  const tickets = [];
  for (let i = 1; i <= 80; i++) {
    const serialNumber = `TB-${String(i).padStart(4, '0')}`;
    tickets.push({
      serialNumber,
      ticketNumber: i,
      status: 'available',
    });
  }

  await Ticket.insertMany(tickets);
  logger.info('80 tickets initialized');
}

/**
 * Get all available tickets
 */
async function getAvailableTickets() {
  return Ticket.find({ status: 'available' }).select('serialNumber ticketNumber price');
}

/**
 * Book a ticket for a player
 */
async function bookTicket({ ticketSerialNumber, playerName, email, phone }) {
  const ticket = await Ticket.findOne({ serialNumber: ticketSerialNumber });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  if (ticket.status === 'booked') {
    throw new Error('Ticket already booked');
  }

  // Generate unique login ID
  const loginId = generateLoginId();

  ticket.status = 'booked';
  ticket.bookedBy = {
    name: playerName,
    email,
    phone,
    loginId,
    bookedAt: new Date(),
  };

  await ticket.save();

  logger.info(`Ticket ${ticket.serialNumber} booked by ${playerName} with login ID: ${loginId}`);

  return {
    serialNumber: ticket.serialNumber,
    ticketNumber: ticket.ticketNumber,
    loginId,
    numbers: ticket.numbers,
    price: ticket.price,
  };
}

/**
 * Get ticket details by login ID
 */
async function getTicketByLoginId(loginId) {
  const ticket = await Ticket.findOne({ 'bookedBy.loginId': loginId });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  if (ticket.status !== 'booked') {
    throw new Error('Ticket is not booked');
  }

  return {
    serialNumber: ticket.serialNumber,
    ticketNumber: ticket.ticketNumber,
    playerName: ticket.bookedBy.name,
    numbers: ticket.numbers,
    email: ticket.bookedBy.email,
    phone: ticket.bookedBy.phone,
  };
}

/**
 * Get ticket by serial number (admin only)
 */
async function getTicketBySerialNumber(serialNumber) {
  const ticket = await Ticket.findOne({ serialNumber });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  return {
    serialNumber: ticket.serialNumber,
    ticketNumber: ticket.ticketNumber,
    status: ticket.status,
    bookedBy: ticket.bookedBy || null,
    numbers: ticket.numbers,
    price: ticket.price,
  };
}

/**
 * Generate unique login ID
 */
function generateLoginId() {
  return `TID-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

/**
 * Get ticket statistics
 */
async function getTicketStats() {
  const total = await Ticket.countDocuments();
  const available = await Ticket.countDocuments({ status: 'available' });
  const booked = await Ticket.countDocuments({ status: 'booked' });

  return {
    total,
    available,
    booked,
    bookedPercentage: ((booked / total) * 100).toFixed(2),
  };
}

module.exports = {
  initializeTickets,
  getAvailableTickets,
  bookTicket,
  getTicketByLoginId,
  getTicketBySerialNumber,
  getTicketStats,
};
