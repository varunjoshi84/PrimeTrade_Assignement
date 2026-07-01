const User = require('../models/user.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');

/**
 * Cookie options helper.
 */
const getCookieOptions = () => {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Lax works best for local development cross-origin requests
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
};

/**
 * Generate access and refresh tokens, update user, and set cookie.
 */
const generateTokensAndSend = async (user, res, statusCode, message) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    // Send response (exclude password and refresh token in returned user object)
    const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
    };

    res.status(statusCode).json(
        new ApiResponse(
            statusCode,
            { user: userData, accessToken },
            message
        )
    );
};

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, 'User with this email already exists');
    }

    // Force first user to be admin for convenience, else use role (default user)
    const count = await User.countDocuments();
    const userRole = count === 0 ? 'admin' : (role || 'user');

    const user = await User.create({
        name,
        email,
        password,
        role: userRole,
    });

    await generateTokensAndSend(user, res, 201, 'User registered successfully');
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and select password explicitly
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(400, 'Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        throw new ApiError(400, 'Invalid email or password');
    }

    await generateTokensAndSend(user, res, 200, 'Logged in successfully');
});

// Refresh Token
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Look for refresh token in cookies or request headers/body as fallback
    let refreshToken = req.cookies?.refreshToken;

    if (!refreshToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Fallback for custom clients
        refreshToken = req.headers.authorization.split(' ')[1];
    }

    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token is missing');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            throw new ApiError(401, 'Invalid or expired refresh token');
        }

        // Generate new tokens
        const newAccessToken = user.generateAccessToken();
        const newRefreshToken = user.generateRefreshToken();

        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, getCookieOptions());

        res.status(200).json(
            new ApiResponse(
                200,
                { accessToken: newAccessToken },
                'Token refreshed successfully'
            )
        );
    } catch (error) {
        console.error('Refresh token verification failed:', error.message);
        throw new ApiError(401, 'Invalid refresh token session');
    }
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
});

// Get Current User Profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        throw new ApiError(404, 'User profile not found');
    }

    res.status(200).json(new ApiResponse(200, { user }, 'Profile retrieved successfully'));
});

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getUserProfile,
};
