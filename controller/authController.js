const JWT = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const sendMail = require('./../utils/email')

const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSignToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: 'succcess',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  createSignToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // CHECK IS EMAIL AND PASSWORD EXIST
  if (!email || !password) {
    return next(new AppError('Please enter email or password', 401));
  }
  // CHECK IF USER STILL EXIST && PASSWORD IS CORRECT
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 400));
  }
  // SERVER TOKEN
  createSignToken(user._id, 200, res);
});
//  PROTECT ROUTE
exports.protect = catchAsync(async (req, res, next) => {
  // GET THE TOKEN AND CHECK IF IT THERE
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are logged out! Please log in again', 401));
  }
  // TOKEN VERIFICATION
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);
  // CHECK IF USER STILL EXIST
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user  belonging to this token does no longer exist',
        401
      )
    );
  }
  // CHECK IF USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
  if (currentUser.changedPasswordAfter(decoded.id)) {
    return next(
      new AppError('User recently changed  password! Please log in again', 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTES
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']ra
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
 
// FORGET PASSWORD
exports.forgetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the email 
  const user = await User.findOne({ email: req.body.email})
   if (!user) {
    return next(
     new AppError('There is no user with the Email',
      404
     )
    )
   }

   const resetToken = createPasswordResetToken()
   await user.save({ validateBeforeSave: false })

   // send token to user's email 
   const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`
   const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to  : ${resetURL}.\nIf you didn't forget your password,please ignore this Email!`
 
   try {
    await sendMail({
      email: user.email,
       subject: 'Your password reset token (vaild for 10 min)',
       message
    })
    res.status(200).json({
      status: 'success',
      message: 'Token sent to the  Email'
    })
   }catch (err) {
       user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false })

      return next(
        new AppError('There was an error sending the email, try again later ',
          500
        )
      )
   }
})