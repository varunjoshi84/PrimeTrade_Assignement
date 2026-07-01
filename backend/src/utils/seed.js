require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const ApiKey = require('../models/apikey.model');
const ApiLog = require('../models/log.model');
const crypto = require('crypto');

const endpoints = [
    { path: '/api/v1/users', methods: ['GET', 'POST'] },
    { path: '/api/v1/payments', methods: ['POST'] },
    { path: '/api/v1/data', methods: ['GET', 'PUT'] },
    { path: '/api/v1/webhooks', methods: ['POST'] },
    { path: '/api/v1/auth', methods: ['POST'] }
];

const statusCodes = [
    { code: 200, weight: 80 }, // 80% success
    { code: 201, weight: 10 }, 
    { code: 400, weight: 4 },
    { code: 401, weight: 3 },
    { code: 403, weight: 1 },
    { code: 404, weight: 1 },
    { code: 500, weight: 1 }  // 1% server error
];

const getRandomStatusCode = () => {
    const totalWeight = statusCodes.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.floor(Math.random() * totalWeight);
    for (const item of statusCodes) {
        if (random < item.weight) return item.code;
        random -= item.weight;
    }
    return 200;
};

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/apexkey');
        console.log('Connected to database.');

        // Find standard user or admin
        const user = await User.findOne({});
        if (!user) {
            console.log('No users found in database. Please register a user via the frontend or API first before running the seed script.');
            process.exit(0);
        }

        console.log(`Found user: ${user.email}. Seeding keys and analytics logs for this user...`);

        // Clear existing keys and logs for this user to make it idempotent
        await ApiKey.deleteMany({ userId: user._id });
        await ApiLog.deleteMany({ userId: user._id });

        const mockKeysConfig = [
            { name: 'Production Gateway Key', permissions: ['read', 'write'] },
            { name: 'Stripe Webhook Sync Key', permissions: ['read'] },
            { name: 'Vercel Deployment Hook', permissions: ['read', 'write', 'delete'] }
        ];

        const createdKeys = [];

        for (const config of mockKeysConfig) {
            const rawKey = `ak_live_${crypto.randomBytes(24).toString('hex')}`;
            const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
            const keyLast4 = rawKey.slice(-4);

            const apiKey = await ApiKey.create({
                name: config.name,
                keyHash,
                keyLast4,
                userId: user._id,
                permissions: config.permissions,
                rateLimit: 60,
                usageLimit: null,
                usageCount: 0,
                expiresAt: null
            });

            createdKeys.push({ apiKey, rawKey });
            console.log(`Created key: "${config.name}" -> Last 4 digits: ${keyLast4} (Simulated Raw: ${rawKey})`);
        }

        console.log('Generating request logs for the past 7 days...');

        const logsToInsert = [];
        const now = new Date();

        // Let's seed 7 days of logs
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            
            // Random number of requests per day
            const dailyRequestsCount = 50 + Math.floor(Math.random() * 100); // 50 to 150 requests per day

            for (let j = 0; j < dailyRequestsCount; j++) {
                // Select a random key
                const chosenKeyObj = createdKeys[Math.floor(Math.random() * createdKeys.length)];
                const key = chosenKeyObj.apiKey;

                // Select random endpoint
                const endpointObj = endpoints[Math.floor(Math.random() * endpoints.length)];
                const method = endpointObj.methods[Math.floor(Math.random() * endpointObj.methods.length)];

                const statusCode = getRandomStatusCode();
                const duration = 20 + Math.floor(Math.random() * 280) + (statusCode === 500 ? 500 : 0); // slower response for server errors

                // Scatter request times across the day
                const requestDate = new Date(date);
                requestDate.setHours(Math.floor(Math.random() * 24));
                requestDate.setMinutes(Math.floor(Math.random() * 60));
                requestDate.setSeconds(Math.floor(Math.random() * 60));

                logsToInsert.push({
                    keyId: key._id,
                    userId: user._id,
                    endpoint: endpointObj.path,
                    method,
                    statusCode,
                    duration,
                    ipAddress: `192.168.1.${10 + Math.floor(Math.random() * 90)}`,
                    createdAt: requestDate
                });

                // Increment key usage count
                key.usageCount += 1;
            }
        }

        // Save updated keys
        for (const item of createdKeys) {
            await item.apiKey.save();
        }

        // Insert logs
        await ApiLog.insertMany(logsToInsert);
        console.log(`Successfully seeded ${logsToInsert.length} logs for ${user.email}.`);

        console.log('\n--- SEED COMPLETE ---');
        console.log(`Use email: ${user.email} to log in. Try using these keys in your code!`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seed();
