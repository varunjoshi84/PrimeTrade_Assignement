const express = require('express');
const router = express.Router();
const { getAnalyticsOverview, getApiLogs } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/overview', protect, getAnalyticsOverview);
router.get('/logs', protect, getApiLogs);

module.exports = router;
