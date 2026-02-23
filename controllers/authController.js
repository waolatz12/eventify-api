const User = require('../models/userModel');
const{ promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsyncErrors = require('../utils/catchAsyncErrors'); //import the error function
const AppErrors = require('../utils/appError');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// Function to sign a JWT token with the user's ID and a secret key, and set an expiration time of 90 days
const signToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: '90d',
  });

}
exports.signup = catchAsyncErrors(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  // Generate JWT token, we send parameter id and secret
  const token = signToken(newUser._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  const {email, password} = req.body;

  //1) Check if email and password exist
  if (!email || !password) {
    return next(new AppErrors('Please provide email and password', 400));
  }

  //2) Check if user exists && password is correct
  const user = await User.findOne({email}).select('+password'); //we need to select password because in userModel we set select to false

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErrors('Incorrect email or password', 401));
  }

  //3) If everything is ok, send token to client
  // const token = signToken({id: user._id});
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsyncErrors(async (req, res, next) => {
  //1) Getting token and check if it's there

  let token;  
  // Check if token is in Authorization header or in cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // else if (req.cookies.jwt) { // If token is in cookies
  //   token = req.cookies.jwt;
  // } 
  else {
    return next(new AppErrors('You are not logged in! Please log in to get access.', 401)); //401 means unauthorized
  }

  // console.log(token);
  //2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); //promisify converts a callback-based function to a promise-based function, so we can use async/await
  // console.log(decoded);
  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppErrors('The user belonging to this token does no longer exist.', 401));
  }

  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppErrors('User recently changed password! Please log in again.', 401));
  }
  
  //grant access to protected route
  req.user = currentUser; //we can access the user in the next middleware or route handler using req.user
  next();
  
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array of allowed roles, e.g. ['admin', 'vendor']
    if (!roles.includes(req.user.role)) {
      return next(new AppErrors('You do not have permission to perform this action', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  //1) Get user based on POSTed email
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return next(new AppErrors('There is no user with that email address.', 404));
  }

  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({validateBeforeSave: false}); //we need to save the user to get the reset token in the database, but we don't want to run the validators because we only want to update the passwordResetToken and passwordResetExpires fields hence using validateBeforeSave: false

  //3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({validateBeforeSave: false});
    return next(new AppErrors('There was an error sending the email. Try again later!', 500));
  }
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  //1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex'); //we need to hash the token because we store the hashed token in the database for security reasons
  const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gt: Date.now()}}); //we need to check if the token has not expired

  //2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppErrors('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // createSendToken(user, 200, res);

  //3) Update changedPasswordAt property for the user

  //4) Log the user in, send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});