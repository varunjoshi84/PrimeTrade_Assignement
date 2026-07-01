const ApiError = require('../utils/apiError');

/**
 * Zod validation middleware.
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @param {string} source - Request source: 'body', 'query', or 'params'
 */
const validate = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync(req[source]);
            // Replace request data with parsed/sanitized value
            req[source] = parsed;
            next();
        } catch (error) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            next(new ApiError(400, 'Validation Failed', errors));
        }
    };
};

module.exports = validate;
