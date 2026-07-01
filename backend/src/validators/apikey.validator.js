const { z } = require('zod');

const createKeySchema = z.object({
    name: z.string({ required_error: 'Key name is required' })
        .min(1, 'Key name must be at least 1 character')
        .max(100, 'Key name must not exceed 100 characters')
        .trim(),
    permissions: z.array(z.enum(['read', 'write', 'delete']))
        .min(1, 'At least one permission is required')
        .default(['read']),
    rateLimit: z.number().int().min(1, 'Rate limit must be at least 1 request/min').default(60),
    usageLimit: z.number().int().min(1, 'Usage limit must be at least 1 request').nullable().optional().default(null),
    expiresAt: z.preprocess(
        (val) => (val === '' || val === undefined ? null : new Date(val)),
        z.date().nullable().optional()
    ).default(null),
});

const updateKeySchema = z.object({
    name: z.string().min(1).max(100).trim().optional(),
    permissions: z.array(z.enum(['read', 'write', 'delete'])).min(1).optional(),
    rateLimit: z.number().int().min(1).optional(),
    usageLimit: z.number().int().min(1).nullable().optional(),
    status: z.enum(['active', 'revoked', 'expired']).optional(),
    expiresAt: z.preprocess(
        (val) => (val === '' || val === undefined ? null : new Date(val)),
        z.date().nullable().optional()
    ).optional(),
});

module.exports = {
    createKeySchema,
    updateKeySchema,
};
