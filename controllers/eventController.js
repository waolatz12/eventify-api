const Event = require('../models/eventModel');
const APIFeatures = require('../utils/apiFeatures');

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
exports.getAllEvents = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

//get events stats
exports.getEventStats = async (req, res) => {
  try {
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
