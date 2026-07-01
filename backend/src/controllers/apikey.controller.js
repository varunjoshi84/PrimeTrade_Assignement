const crypto = require('crypto');
const ApiKey = require('../models/apikey.model');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper to generate a new API key
const generateKeyPayload = () => {
    const rawKey = `ak_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyLast4 = rawKey.slice(-4);
    return { rawKey, keyHash, keyLast4 };
};

// Create API Key
const createApiKey = asyncHandler(async (req, res) => {
    const { name, permissions, rateLimit, usageLimit, expiresAt } = req.body;
    const { rawKey, keyHash, keyLast4 } = generateKeyPayload();

    const apiKey = await ApiKey.create({
        name,
        keyHash,
        keyLast4,
        userId: req.user._id,
        permissions,
        rateLimit,
        usageLimit,
        expiresAt,
    });

    // Return the raw key ONCE along with the database record
    res.status(201).json(
        new ApiResponse(
            201,
            {
                apiKey,
                rawKey, // The raw unhashed key - returned only here
            },
            'API key created successfully'
        )
    );
});

// Get API Keys with pagination, filtering, searching, and sorting
const getApiKeys = asyncHandler(async (req, res) => {
    const { search, status, permissions, sort, page = 1, limit = 10 } = req.query;

    const query = {};

    // Standard user can only view their own keys, admin can view all
    if (req.user.role !== 'admin') {
        query.userId = req.user._id;
    }

    // Search by key name
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    // Filter by status (active, revoked, expired)
    if (status) {
        query.status = status;
    }

    // Filter by permissions (e.g. read, write)
    if (permissions) {
        const perms = Array.isArray(permissions) ? permissions : [permissions];
        query.permissions = { $all: perms };
    }

    // Pagination
    const skipIndex = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort === 'oldest') {
        sortOption = { createdAt: 1 };
    } else if (sort === 'usage') {
        sortOption = { usageCount: -1 };
    } else if (sort === 'name') {
        sortOption = { name: 1 };
    }

    const total = await ApiKey.countDocuments(query);
    const keys = await ApiKey.find(query)
        .populate('userId', 'name email')
        .sort(sortOption)
        .limit(parseInt(limit))
        .skip(skipIndex);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                keys,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
            },
            'API keys retrieved successfully'
        )
    );
});

// Update API Key (permissions, status, rateLimit, name)
const updateApiKey = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, permissions, rateLimit, usageLimit, status, expiresAt } = req.body;

    const key = await ApiKey.findById(id);
    if (!key) {
        throw new ApiError(404, 'API Key not found');
    }

    // Check authorization (only owner or admin)
    if (key.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to modify this API key');
    }

    if (name !== undefined) key.name = name;
    if (permissions !== undefined) key.permissions = permissions;
    if (rateLimit !== undefined) key.rateLimit = rateLimit;
    if (usageLimit !== undefined) key.usageLimit = usageLimit;
    if (status !== undefined) key.status = status;
    if (expiresAt !== undefined) key.expiresAt = expiresAt;

    const updatedKey = await key.save();

    res.status(200).json(new ApiResponse(200, updatedKey, 'API Key updated successfully'));
});

// Regenerate API Key (Generates a new key string but keeps metadata/usage stats)
const regenerateApiKey = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const key = await ApiKey.findById(id);
    if (!key) {
        throw new ApiError(404, 'API Key not found');
    }

    // Check authorization
    if (key.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to regenerate this API key');
    }

    const { rawKey, keyHash, keyLast4 } = generateKeyPayload();

    key.keyHash = keyHash;
    key.keyLast4 = keyLast4;
    key.status = 'active'; // Force active on regeneration
    await key.save();

    res.status(200).json(
        new ApiResponse(
            200,
            {
                apiKey: key,
                rawKey, // Return new raw key once
            },
            'API Key regenerated successfully'
        )
    );
});

// Delete API Key
const deleteApiKey = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const key = await ApiKey.findById(id);
    if (!key) {
        throw new ApiError(404, 'API Key not found');
    }

    // Check authorization
    if (key.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, 'Not authorized to delete this API key');
    }

    await ApiKey.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, 'API Key deleted successfully'));
});

module.exports = {
    createApiKey,
    getApiKeys,
    updateApiKey,
    regenerateApiKey,
    deleteApiKey,
};
