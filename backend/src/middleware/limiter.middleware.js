const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/apiError');

// Limiter for authentication routes (login/register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 auth requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next) => {
        next(new ApiError(429, 'Too many login or registration attempts. Please try again after 15 minutes.'));
    },
});

// General API request limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 general requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, 'Too many requests from this IP. Please wait a few minutes.'));
    },
});

module.exports = {
    authLimiter,
    apiLimiter,
};
