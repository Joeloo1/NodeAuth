const crypto = require('crypto')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String, 
  passwordResetExpires: Date,
});
// HASH USER PASSWORD BEFORE SAVING TO DB
userSchema.pre('save', async function (next) {
  // ONLY RUN IF THE PASSWORD WAS MODIFIED
  if (!this.isModified('password')) return next();
  //  HASH USER PASSWORD
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// CONPARE IF THE USER PASSWORD IS THE SAME TO THE ONE IN THE DB
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changedTimestamp
  }
  // false means NOT changed 
  return false 
};

// Generate a random token 
userSchema.method.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  // Hash the token 
  this.passwordResetToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex')

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}
const User = mongoose.model('User', userSchema);

module.exports = User;
