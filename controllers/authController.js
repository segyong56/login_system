const User = require('../models/User')
const crypto = require('crypto')
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncError')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail');
const multer = require('multer')

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        if (ext !== '.jpg' || ext !== '.jpeg' || ext !== '.png') {
            return cb(res.status(400).end('only jpg, png, jpeg is allowed'), false);
        }
        cb(null, true)
    }
})


var upload = multer({ storage: storage }).single("file")


//profileImg upload => /api/profile_img
exports.profileImgUpload = catchAsyncErrors(async (req, res, next) => {

    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err })
        }

        return res.json({ success: true, image: res.req.file.path, fileName: res.req.file.filename })
    })

})


//register user => /api/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    const { name, email, password } = req.body
    const user = await User.create({
        name, email, password
    })

    sendToken(user, 200, res)

})


//login user => /api/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler('please enter email & password', 404))
    }

    const user = await (await User.findOne({ email }).select('+password'))

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 404))
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 404))
    }

    sendToken(user, 200, res)

})


//forgot password => /api/forgot
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorHandler('User not found with this email', 404))
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false })

    const resetUrl = `http://localhost:5000/password/reset/${resetToken}`

    const message = `your password reset token is as follow:\n\n${resetUrl}\n\n if you have not requested this email, then ignore it`

    try {

        await sendEmail({
            email: user.email,
            subject: 'password recovery',
            message
        })

        res.status(200).json({
            success: true,
            message: `Email sent to : ${user.email}`
        })
    } catch (error) {
        user.resetPasswordToken = undefined,
            user.resetPasswordExpire = undefined,

            await user.save({ validateBeforeSave: false })

        return next(new ErrorHandler(error.message, 500))
    }

})


//reset password => /api/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHandler('password reset token is invalid or has been expired', 404))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('password does not match', 404))
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res)

})


//logout user => /api/logout
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {

    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "logged out"
    })

})


//edit profile info => /api/me/mypage/edit
exports.editProfileInfo = catchAsyncErrors(async (req, res, next) => {

    let user = await User.findById(req.body.userId)

    if (!user) {
        return next(new ErrorHandler('user cannot be found', 404))
    }

    user = await User.findOneAndUpdate({ "_id": req.body.userId }, {
        "profile.profileName": req.body.profileName,
        "profile.profileImg": req.body.profileImg,
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })

})


//add to my followinglist 
exports.addToMyFollowingList = catchAsyncErrors(async (req, res, next) => {

    let user = await User.findById(req.body.userFrom)

    if (!user)
        return next(new ErrorHandler('user cannot be found', 404))

    user = await User.findByIdAndUpdate(req.body.userFrom, {
        $push:
            { "myFollowing_list": { "userTo": req.params.userId } }
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message: 'add to my followinglist'
    })

})


//remove from my followinglist 
exports.removeFromMyFollowingList = catchAsyncErrors(async (req, res, next) => {

    let user = await User.findById(req.body.userFrom)

    if (!user)
        return next(new ErrorHandler('user cannot be found', 404))

    user = await User.findByIdAndUpdate(req.body.userFrom, 
    {
        $pull: 
            { "myFollowing_list": { "userTo": req.params.userId }}
    }, 
    {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message: 'remove from my followinglist'
    })

})


//get my follower list => /api/get_myfollower/:userId
exports.getMyfollower = catchAsyncErrors(async (req, res, next) => {

   const users = await User.find({ "myFollowing_list.userTo" : req.params.userId })

   if(!users) {
       return next(new ErrorHandler('users cannot be found', 404))
   }

   res.status(200).json({
       success: true,
       users
   })

})
