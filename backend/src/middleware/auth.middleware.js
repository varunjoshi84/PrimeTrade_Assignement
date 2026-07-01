const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        throw new ApiError(401, 'Not authorized, token missing');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Get user from token and exclude password
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new ApiError(401, 'User not found for this token');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token expired');
        }
        throw new ApiError(401, 'Not authorized, invalid token');
    }
});

module.exports = { protect };
