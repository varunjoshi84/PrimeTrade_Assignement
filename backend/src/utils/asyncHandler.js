/**
 * Wraps express middleware or controller functions to catch async errors
 * and forward them to the global error handling middleware.
 */
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    };
};

module.exports = asyncHandler;
