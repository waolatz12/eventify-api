const event = require('../models/eventModel');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const newEvent = await event.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        event: newEvent,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await event.find();
    res.status(200).json({
      status: 'success',
      results: events.length,
      data: {
        events,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
