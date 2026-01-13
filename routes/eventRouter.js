const express = require('express');

const eventController = require('../controllers/eventController');

const router = express.Router();

// Route to create a new event
router
  .route('/')
  .post(eventController.createEvent)
  .get(eventController.getAllEvents);

module.exports = router;
