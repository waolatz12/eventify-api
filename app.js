const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const eventRouter = require('./routes/eventRouter');
const ticketRouter = require('./routes/ticketRouter');

const app = express();
app.set('query parser', 'extended'); // Use extended query string parsing

// Middleware

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); //current time property e.g., 2023-10-05T14:48:00.000Z
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
