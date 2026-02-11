// const mongoose = require('mongoose');
const Event = require('../models/eventModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsyncErrors = require('../utils/catchAsyncErrors'); //import the error function
const AppErrors = require('../utils/appError');

// Create a new event
exports.createEvent = catchAsyncErrors(async (req, res, next) => {
  // try {
  const newEvent = await Event.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      event: newEvent,
    },
  });
  // } catch (err) {
  //   res.status(400).json({
  //     status: 'fail',
  //     message: err.message,
  //   });
  // }
});

//update an event
exports.updateEvent = catchAsyncErrors(async (req, res, next) => {
  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!updatedEvent) {
    return next(new AppErrors('Event not found with this ID!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      event: updatedEvent,
    },
  });
});

//get top 5 events middleware
exports.aliasTopEvents = (req, res, next) => {
  req.query = {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    ...req.query,
    limit: '2',
    sort: '-capacity,price',
    fields: 'title,price,capacity,location,status',
  };
  console.log('Alias Top Events Middleware called');
  console.log('Original Query:', req.query);
  next();
};
// Get all events
exports.getAllEvents = catchAsyncErrors(async (req, res, next) => {
  //1) Filtering (req.query creates a shallow copy of req.query object)
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  // const queryObj = { ...req.query };

  // // 1A) Exclude non-filter fields
  // const excludedFields = ['page', 'sort', 'limit', 'fields'];
  // excludedFields.forEach((el) => delete queryObj[el]);

  // //1B) advanced filtering
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // // console.log(JSON.parse(queryStr));
  // // { difficulty: 'easy', duration: { $gte: 5 } }
  // let query = Event.find(JSON.parse(queryStr));

  // //2) SORTING
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   console.log(sortBy);
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('createdAt');
  // }

  // //3) FIELDS LIMITING
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v'); //excluding the version field
  // }

  // //4) PAGINATION

  // const page = req.query.page * 1 || 1; //default page 1
  // const limit = req.query.limit * 1 || 100; //default limit 100
  // const skip = (page - 1) * limit;
  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const totalEvents = await Event.countDocuments();
  //   if (skip >= totalEvents) throw new Error('This page does not exits!');
  // }
  // Execute query
  const features = new APIFeatures(Event.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // Execute query
  const events = await features.query;
  // Send response
  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events,
    },
  });
});

//get events stats
exports.getEventStats = catchAsyncErrors(async (req, res, next) => {
  console.log('event stats reached!');
  const stats = await Event.aggregate([
    {
      //events with capacity greater than or equal to 1000
      $match: { capacity: { $gte: 1000 } },
    },
    {
      //grouping by status
      $group: {
        _id: '$status',
        numEvents: { $sum: 1 },
        avgCapacity: { $avg: '$capacity' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    //sorting by avgPrice ascending
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// get event by id
exports.getEventById = catchAsyncErrors(async (req, res, next) => {
  // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  //   return res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid event ID format',
  //   });
  // }
  const eventById = await Event.findById(req.params.id);
  if (!eventById) {
    return next(new AppErrors('Event not found with this ID!', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      event: eventById,
    },
  });
  // if (!eventById) {
  //   return res.status(404).json({
  //     status: 'fail',
  //     message: 'No event found with that ID',
  //   });
  // }
});

// Delete an event
exports.deleteEvent = catchAsyncErrors(async (req, res, next) => {
  //check for valid mongoose id
  // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  //   return res.status(400).json({
  //     status: 'fail',
  //     message: 'Invalid event ID format',
  //   });
  // }
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) {
    return next(new AppErrors('Event not found with this ID!', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
