const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Key name is required'],
            trim: true,
        },
        keyHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        keyLast4: {
            type: String,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'revoked', 'expired'],
            default: 'active',
        },
        permissions: {
            type: [String],
            enum: ['read', 'write', 'delete'],
            default: ['read'],
        },
        rateLimit: {
            type: Number,
            default: 60, // Requests per minute
        },
        usageLimit: {
            type: Number,
            default: null, // Null means unlimited
        },
        usageCount: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            default: null, // Null means never expires
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ApiKey', apiKeySchema);
