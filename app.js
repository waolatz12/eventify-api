const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const eventRouter = require('./routes/eventRouter');
const ticketRouter = require('./routes/ticketRouter');
const userRouter = require('./routes/userRouter');
const rateLimit = require('express-rate-limit');

const app = express();
app.set('query parser', 'extended'); // Use extended query string parsing

// Middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Global Middleware
// Limit requests from the same API
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter); // Apply rate limiting to all API routes
//converts the body of the request to json and makes it available in req.body
app.use(express.json());
//converts the body of the request to urlencoded data and makes it available in req.body
app.use(express.urlencoded({ extended: true }));
// add a timestamp to the request object for logging purposes and to track when the request was made
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); //current time property e.g., 2023-10-05T14:48:00.000Z
  // console.log(req.headers);
  next();
});
app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

// app.get('/api/v1/test', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'This is a test route',
//     requestTime: req.requestTime,
//   });
// });

// Routes
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/users', userRouter);
// Handle undefined Routes

app.use((req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });
  //using the built-in error handling mechanism of express
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); //anything passed to next() is considered an error and will skip all other middlewares and go to the global error handling middleware
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
