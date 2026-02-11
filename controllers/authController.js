const User = require('../models/userModel');
const{ promisify } = require('util');
const jwt = require('jsonwebtoken');
const catchAsyncErrors = require('../utils/catchAsyncErrors'); //import the error function
const AppErrors = require('../utils/appError');

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
    passwordConfirm: req.body.passwordConfirm,
  });

  // Generate JWT token, we send parameter id and secret
  const token = signToken({id: newUser._id});

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
  const token = signToken({id: user._id});

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
  console.log(decoded);
  // //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppErrors('The user belonging to this token does no longer exist.', 401));
  }

  //4) Check if user changed password after the token was issued

  
  next();
  
});
