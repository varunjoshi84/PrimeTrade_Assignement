const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema(
    {
        keyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ApiKey',
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        endpoint: {
            type: String,
            required: true,
        },
        method: {
            type: String,
            required: true,
        },
        statusCode: {
            type: Number,
            required: true,
            index: true,
        },
        duration: {
            type: Number, // In milliseconds
            required: true,
        },
        ipAddress: {
            type: String,
            default: '127.0.0.1',
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt (as timestamp)
    }
);

module.exports = mongoose.model('ApiLog', apiLogSchema);
