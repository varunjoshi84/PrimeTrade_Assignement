const { z } = require('zod');

const registerSchema = z.object({
    name: z.string({ required_error: 'Name is required' })
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters')
        .trim(),
    email: z.string({ required_error: 'Email is required' })
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
    password: z.string({ required_error: 'Password is required' })
        .min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'admin']).optional(),
});

const loginSchema = z.object({
    email: z.string({ required_error: 'Email is required' })
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
    password: z.string({ required_error: 'Password is required' }),
});

const updateProfileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50).trim().optional(),
    avatar: z.string().optional(), // Base64 string
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
};
