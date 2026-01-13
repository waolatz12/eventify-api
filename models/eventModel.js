const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: 1,
    },
    price: {
      type: Number,
      required: [true, 'Event price is required'],
      min: 0,
    },
    status: {
      type: String,
      // required: [true, 'Event status is required'],
      enum: ['draft', 'active', 'closed'], // future-proof
      default: 'draft',
    },

    ticketsAvailable: {
      type: Number,
      required: true,
      min: 0,
    },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: [true, 'Event must have a creator'],
    // },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

module.exports = mongoose.model('Event', eventSchema);
