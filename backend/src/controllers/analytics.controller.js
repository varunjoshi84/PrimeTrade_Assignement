const mongoose = require('mongoose');
const ApiLog = require('../models/log.model');
const ApiKey = require('../models/apikey.model');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// Fetch Analytics Summary
const getAnalyticsOverview = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    // Base query filter
    const filter = {};
    if (!isAdmin) {
        filter.userId = userId;
    }

    // 1. Total Requests
    const totalRequests = await ApiLog.countDocuments(filter);

    // 2. Status Code Distribution (2xx, 4xx, 5xx)
    const statusCodes = await ApiLog.aggregate([
        { $match: filter },
        {
            $group: {
                _id: {
                    $cond: [
                        { $and: [{ $gte: ['$statusCode', 200] }, { $lt: ['$statusCode', 300] }] },
                        'success',
                        {
                            $cond: [
                                { $and: [{ $gte: ['$statusCode', 400] }, { $lt: ['$statusCode', 500] }] },
                                'client_error',
                                'server_error',
                            ],
                        },
                    ],
                },
                count: { $sum: 1 },
            },
        },
    ]);

    // Format status codes
    const statusDistribution = { success: 0, clientError: 0, serverError: 0 };
    statusCodes.forEach((item) => {
        if (item._id === 'success') statusDistribution.success = item.count;
        else if (item._id === 'client_error') statusDistribution.clientError = item.count;
        else if (item._id === 'server_error') statusDistribution.serverError = item.count;
    });

    // 3. Average Latency (overall duration)
    const latencyStats = await ApiLog.aggregate([
        { $match: filter },
        { $group: { _id: null, avgLatency: { $avg: '$duration' } } },
    ]);
    const averageLatency = latencyStats.length > 0 ? Math.round(latencyStats[0].avgLatency) : 0;

    // 4. Requests Over Time (Daily - Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const timeFilter = {
        ...filter,
        createdAt: { $gte: sevenDaysAgo }
    };

    const requestsOverTime = await ApiLog.aggregate([
        { $match: timeFilter },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 },
                avgLatency: { $avg: '$duration' },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with 0 requests for smoother charts
    const filledRequestsOverTime = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const match = requestsOverTime.find((r) => r._id === dateStr);
        filledRequestsOverTime.push({
            date: dateStr,
            requests: match ? match.count : 0,
            latency: match ? Math.round(match.avgLatency) : 0,
        });
    }

    // 5. Top API Keys by Usage
    const topKeysAgg = await ApiLog.aggregate([
        { $match: filter },
        { $group: { _id: '$keyId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
    ]);

    const topKeys = [];
    for (const item of topKeysAgg) {
        const apiKey = await ApiKey.findById(item._id).select('name keyLast4');
        if (apiKey) {
            topKeys.push({
                name: apiKey.name,
                keyLast4: apiKey.keyLast4,
                count: item.count,
            });
        }
    }

    // 6. Top Endpoints hit
    const topEndpoints = await ApiLog.aggregate([
        { $match: filter },
        { $group: { _id: { endpoint: '$endpoint', method: '$method' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
            $project: {
                _id: 0,
                endpoint: '$_id.endpoint',
                method: '$_id.method',
                count: '$count',
            },
        },
    ]);

    // 7. Recent Log Feed
    const query = {};
    if (!isAdmin) {
        query.userId = req.user._id;
    }
    const recentLogs = await ApiLog.find(query)
        .populate('keyId', 'name keyLast4')
        .sort({ createdAt: -1 })
        .limit(10);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                totalRequests,
                statusDistribution,
                averageLatency,
                requestsOverTime: filledRequestsOverTime,
                topKeys,
                topEndpoints,
                recentLogs,
            },
            'Analytics overview retrieved successfully'
        )
    );
});

// Fetch Paginated Logs with Search & Filters
const getApiLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search, status } = req.query;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const query = {};
    if (!isAdmin) {
        query.userId = userId;
    }

    // Filter by endpoint path
    if (search) {
        query.endpoint = { $regex: search, $options: 'i' };
    }

    // Filter by status codes
    if (status) {
        if (status === '2xx') {
            query.statusCode = { $gte: 200, $lt: 300 };
        } else if (status === '4xx') {
            query.statusCode = { $gte: 400, $lt: 500 };
        } else if (status === '5xx') {
            query.statusCode = { $gte: 500, $lt: 600 };
        }
    }

    const skipIndex = (parseInt(page) - 1) * parseInt(limit);

    const total = await ApiLog.countDocuments(query);
    const logs = await ApiLog.find(query)
        .populate('keyId', 'name keyLast4')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skipIndex);

    res.status(200).json(
        new ApiResponse(
            200,
            {
                logs,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalItems: total,
            },
            'Logs retrieved successfully'
        )
    );
});

module.exports = {
    getAnalyticsOverview,
    getApiLogs,
};
