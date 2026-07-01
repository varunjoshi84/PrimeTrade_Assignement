const express = require('express');
const router = express.Router();
const {
    createApiKey,
    getApiKeys,
    updateApiKey,
    regenerateApiKey,
    deleteApiKey,
} = require('../controllers/apikey.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { createKeySchema, updateKeySchema } = require('../validators/apikey.validator');

router.use(protect); // Apply protect to all routes below

router.post('/', validate(createKeySchema), createApiKey);
router.get('/', getApiKeys);
router.put('/:id', validate(updateKeySchema), updateApiKey);
router.post('/:id/regenerate', regenerateApiKey);
router.delete('/:id', deleteApiKey);

module.exports = router;
