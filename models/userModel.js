const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
// eslint-disable-next-line import/no-unresolved
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'User email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail], //validate if it's an email
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never return password in queries
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      minlength: 8,
      //validate if the password confirm and the password are the same
      validator: function (el) {
        return el === this.password;
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'vendor'], // future-proof
      default: 'user',
    },

    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },

    passwordChangedAt: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);
// Pre-save middleware to hash password if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

// Pre-save middleware to set passwordChangedAt if password was modified and not new
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = Date.now() - 1000; // subtract 1 second to avoid issues with timestamp precision
});

// Instance method to check password validity
userSchema.methods.correctPassword = async function (
  candidatePassword,
  storedPassword,
) {
  return await bcrypt.compare(candidatePassword, storedPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    console.log(changedTimestamp, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // if jwt was issued before password was changed, return true (password was changed after token was issued)
  }
  return false; // Password not changed
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); //generate random token
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex'); //hash the token and store it in the database
  console.log({resetToken}, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //set expiration time to 10 minutes from now
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;


//notes:
//1) We use pre-save middleware to hash the password before saving it to the database. This ensures that the password is always stored securely.
//2) We use instance methods to check if the password is correct and if the password was changed after the token was issued. This allows us to easily check these conditions in our authentication logic.
//3) We set select: false for the password field to ensure that it is never returned in queries by default. This adds an extra layer of security by preventing the password from being exposed accidentally.
//4) We use timestamps: true in the schema options to automatically add createdAt and updatedAt fields to the user documents. This can be useful for tracking when users were created and last updated.
//5) We use the validator library to validate that the email field contains a valid email address. This helps ensure data integrity and prevents invalid email addresses from being stored in the database.
//6) We use this keyword in the instance methods to access the current user document, allowing us to perform operations based on the user's data.
//7) iat stands for "issued at" and is a timestamp that indicates when the JWT token was issued. We can use this timestamp to check if the password was changed after the token was issued, which can help us invalidate tokens if the user changes their password.
//8) this.passwordChangedAt.getTime() is in milliseconds, while JWTTimestamp is in seconds, so we need to convert it to seconds by dividing by 1000. We also use parseInt to convert it to an integer, and we specify the radix as 10 to ensure that it is parsed as a decimal number.
