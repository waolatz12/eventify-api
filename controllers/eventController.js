const Event = require('../models/eventModel');

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);
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

//update an event
exports.updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({
      status: 'success',
      data: {
        event: updatedEvent,
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
    //1) Filtering (req.query creates a shallow copy of req.query object)
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...req.query };

    // 1A) Exclude non-filter fields
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1B) advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    // { difficulty: 'easy', duration: { $gte: 5 } }
    const query = Event.find(JSON.parse(queryStr));

    // Execute query
    const events = await query;
    // Send response
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

// get event by id
exports.getEventById = async (req, res) => {
  try {
    const eventById = await Event.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        event: eventById,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
