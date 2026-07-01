const express = require('express');
const router = express.Router();
const {
    updateProfile,
    getAllUsers,
    updateUserRole,
    deleteUser,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const validate = require('../middleware/validation.middleware');
const { updateProfileSchema } = require('../validators/auth.validator');

// Profile routes (Any authenticated user)
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

// Admin-only user management routes
router.get('/admin/users', protect, authorize(['admin']), getAllUsers);
router.put('/admin/users/:id/role', protect, authorize(['admin']), updateUserRole);
router.delete('/admin/users/:id', protect, authorize(['admin']), deleteUser);

module.exports = router;
