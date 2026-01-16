const express = require('express');

const eventController = require('../controllers/eventController');

const router = express.Router();

// Route to get Top 5 Events
router
  .route('/top-5-events')
  .get(eventController.aliasTopEvents, eventController.getAllEvents);

// Route to get event statistics
router.route('/event-stats').get(eventController.getEventStats);
// Route to create a new event
router
  .route('/')
  .post(eventController.createEvent)
  .get(eventController.getAllEvents);

// Route to update an existing event
router
  .route('/:id')
  .patch(eventController.updateEvent)
  .get(eventController.getEventById)
  .delete(eventController.deleteEvent);

module.exports = router;
