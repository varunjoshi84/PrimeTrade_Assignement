const User = require('../models/user.model');
const ApiKey = require('../models/apikey.model');
const ApiLog = require('../models/log.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Update User Profile
const updateProfile = asyncHandler(async (req, res) => {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (name !== undefined) user.name = name;
    if (avatar !== undefined) user.avatar = avatar; // Base64 avatar upload

    const updatedUser = await user.save();

    const userData = {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        createdAt: updatedUser.createdAt,
    };

    res.status(200).json(new ApiResponse(200, { user: userData }, 'Profile updated successfully'));
});

// Admin: Get all users with API Key count and logs count
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).sort({ createdAt: -1 });
    
    const usersData = [];
    for (const u of users) {
        const keyCount = await ApiKey.countDocuments({ userId: u._id });
        const logCount = await ApiLog.countDocuments({ userId: u._id });
        usersData.push({
            _id: u._id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar,
            createdAt: u.createdAt,
            keyCount,
            logCount,
        });
    }

    res.status(200).json(new ApiResponse(200, usersData, 'Users list retrieved successfully'));
});

// Admin: Update User Role (User/Admin)
const updateUserRole = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
        throw new ApiError(400, 'Invalid role');
    }

    // Prevent changing own role
    if (id === req.user.id) {
        throw new ApiError(400, 'You cannot change your own role');
    }

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    user.role = role;
    await user.save();

    res.status(200).json(new ApiResponse(200, user, `User role updated to ${role} successfully`));
});

// Admin: Delete User
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (id === req.user.id) {
        throw new ApiError(400, 'You cannot delete your own account');
    }

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Delete associated keys and logs
    await ApiKey.deleteMany({ userId: id });
    await ApiLog.deleteMany({ userId: id });
    await User.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, 'User and associated data deleted successfully'));
});

module.exports = {
    updateProfile,
    getAllUsers,
    updateUserRole,
    deleteUser,
};
