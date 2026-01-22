class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; //if status code starts with 4xx it's a client error else server error
    this.isOperational = true; //to distinguish operational errors from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
