const express = require('express');
const router = express.Router();
const ticketBookingService = require('../services/ticketBookingService');
const validate = require('../middleware/validate');
const logger = require('../utils/logger');

/**
 * GET /api/tickets/available
 * Get all available tickets
 */
router.get('/available', async (req, res, next) => {
  try {
    const tickets = await ticketBookingService.getAvailableTickets();
    res.json({
      success: true,
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tickets/stats
 * Get ticket statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await ticketBookingService.getTicketStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/tickets/book
 * Book a ticket
 */
router.post('/book', validate('bookTicket'), async (req, res, next) => {
  try {
    const { serialNumber, playerName, email, phone } = req.body;

    const bookedTicket = await ticketBookingService.bookTicket({
      ticketSerialNumber: serialNumber,
      playerName,
      email,
      phone,
    });

    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully',
      data: bookedTicket,
    });
  } catch (err) {
    if (err.message === 'Ticket not found') {
      res.status(404);
    } else if (err.message === 'Ticket already booked') {
      res.status(409);
    }
    next(err);
  }
});

/**
 * GET /api/tickets/:loginId
 * Get ticket by login ID
 */
router.get('/:loginId', async (req, res, next) => {
  try {
    const { loginId } = req.params;
    const ticket = await ticketBookingService.getTicketByLoginId(loginId);

    res.json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    if (err.message === 'Ticket not found') {
      res.status(404);
    }
    next(err);
  }
});

module.exports = router;
