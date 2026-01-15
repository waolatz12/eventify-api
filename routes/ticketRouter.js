const express = require('express');

const ticketController = require('../controllers/ticketController');

const router = express.Router();

// Route to create a new ticket and get all tickets
router
  .route('/')
  .post(ticketController.createTicket)
  .get(ticketController.getAllTickets);
router
  .route('/:id')
  .get(ticketController.getTicketById)
  .patch(ticketController.updateTicketById)
  .delete(ticketController.deleteTicketById);

module.exports = router;
