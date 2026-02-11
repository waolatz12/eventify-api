const mongoose = require('mongoose');
const validator = require('validator');
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

    // passwordChangedAt: Date,

    // passwordResetToken: String,
    // passwordResetExpires: Date,
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

// Instance method to check password validity
userSchema.methods.correctPassword = async function (
  candidatePassword,
  storedPassword,
) {
  return await bcrypt.compare(candidatePassword, storedPassword);
};
const User = mongoose.model('User', userSchema);
module.exports = User;
