const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getUserProfile,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { authLimiter } = require('../middleware/limiter.middleware');

router.post('/register', authLimiter, validate(registerSchema), registerUser);
router.post('/login', authLimiter, validate(loginSchema), loginUser);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
