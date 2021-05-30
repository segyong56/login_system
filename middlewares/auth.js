const User = require('../models/User')
const jwt = require("jsonwebtoken");
const jwt_secret = 'slkdkdkekdksflddsfsfdd';
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncError");

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {

    const { token } = req.cookies

    if (!token) {
        return next(new ErrorHandler('Login first to access this resource.', 400))
    }

    const decoded = jwt.verify(token, jwt_secret)
    req.user = await User.findById(decoded.id);

    next()
})