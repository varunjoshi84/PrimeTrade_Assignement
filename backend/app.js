const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./src/docs/swagger');
const authRoutes = require('./src/routes/auth.routes');
const apiKeyRoutes = require('./src/routes/apikey.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const userRoutes = require('./src/routes/user.routes');
const errorHandler = require('./src/middleware/error.middleware');
const ApiError = require('./src/utils/apiError');
const { apiLimiter } = require('./src/middleware/limiter.middleware');

const app = express();

// Security HTTP headers
app.use(
    helmet({
        contentSecurityPolicy: false, // Turn off CSP warning issues for Swagger
    })
);

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// CORS configuration
app.use(
    cors({
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Body parser, reading data from body into req.body (limit size to 10kb to avoid DOS)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Apply general API rate limiting to all requests under /api/v1
app.use('/api/v1/', apiLimiter);

// API Documentation (Swagger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/keys', apiKeyRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/users', userRoutes);

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the ApexKey Developer API Server. Access documentation at /api-docs',
    });
});

// Fallback for unhandled routes
app.use((req, res, next) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server`));
});

// Global Centralized Error Handler
app.use(errorHandler);

module.exports = app;