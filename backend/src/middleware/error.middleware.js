const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
    let error = err;

    // Check if error is not an instance of ApiError
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, error.errors || [], err.stack);
    }

    // Handle Mongo Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        error = new ApiError(400, message);
    }

    // Handle Mongoose Cast Error (e.g. invalid ObjectId)
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new ApiError(404, message);
    }

    // Handle JWT Error
    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token');
    }

    const response = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
    };

    res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
