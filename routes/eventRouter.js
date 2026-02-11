const express = require('express');

const eventController = require('../controllers/eventController');
const authController = require('../controllers/authController');
const router = express.Router();

// Route to get Top 5 Events
// Static routes FIRST
router.get(
  '/top-5-events',
  eventController.aliasTopEvents,
  eventController.getAllEvents,
);
router.get('/event-stats', eventController.getEventStats);
// router
//   .route('/top-5-events')
//   .get(eventController.aliasTopEvents, eventController.getAllEvents);

// // Route to get event statistics
// router.get('/event-stats').get(eventController.getEventStats);
// Route to create a new event
router
  .route('/')
  .post(authController.protect, eventController.createEvent)
  .get(authController.protect, eventController.getAllEvents);

// Route to update an existing event
router
  .route('/:id')
  .patch(authController.protect, eventController.updateEvent)
  .get(eventController.getEventById)
  .delete(authController.protect, eventController.deleteEvent);

module.exports = router;
