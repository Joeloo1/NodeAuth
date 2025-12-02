const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'This route is not for password updates, Please use /updateMyPassword route instead',
                400
            )
        )
    }
    // update user document
    const filteredBody = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
        new: true,
        runValidators: true,
    }) 
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
    
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    (await User.findByIdAndUpdate(req.user._id, { active: false}))

    res.status(204).json({
        status: 'success',
        data: null
    })
})