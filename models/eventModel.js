const mongoose = require('mongoose');
const slugify = require('slugify');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      minlength: [5, 'Event title must be at least 5 characters'],
      maxlength: [100, 'Event title must be at most 100 characters'],
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
      min: [1, 'Event capacity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Event price is required'],
      min: [0, 'Event price cannot be negative'],
    },
    status: {
      type: String,
      // required: [true, 'Event status is required'],
      enum: ['draft', 'active', 'closed'], // future-proof
      default: 'draft',
    },
    slug: {
      type: String,
      // unique: true,
    },
    secretEvent: {
      type: Boolean,
      default: false,
    },
    ticketsAvailable: {
      type: Number,
      required: true,
      min: [0, 'Tickets available cannot be negative'],
    },
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: [true, 'Event must have a creator'],
    // },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // include virtuals when data is output as JSON
    toObject: { virtuals: true }, // include virtuals when data is output as Object
  },
);

//virtual property to check if event is sold out
eventSchema.virtual('isSoldOut').get(function () {
  return this.ticketsAvailable === 0;
});
//pre-save document middleware to generate slug from title
eventSchema.pre('save', async function () {
  //generate slug from title
  this.slug = slugify(this.title, { lower: true });
  // next();
});
//post-save document middleware to log event creation
eventSchema.post('save', async (doc) => {
  console.log(
    `New event "${doc.title}" has been created with slug "${doc.slug}"`,
  );
});

//Query middleware to exclude secret events from find queries
eventSchema.pre('find', async function () {
  //this points to the current query
  this.find({ secretEvent: { $ne: true } }); //secretEvent not equal to true
  // next();
});
//compiling the schema into a model andd export it
module.exports = mongoose.model('Event', eventSchema);
