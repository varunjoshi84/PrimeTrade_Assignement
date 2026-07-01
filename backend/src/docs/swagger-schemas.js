/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         name:
 *           type: string
 *           example: Jane Doe
 *         email:
 *           type: string
 *           example: jane@example.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *         avatar:
 *           type: string
 *           description: Base64 formatted string representing user avatar
 *         createdAt:
 *           type: string
 *           format: date-time
 * 
 *     ApiKey:
 *       type: object
 *       required:
 *         - name
 *         - permissions
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           description: Display name of the key
 *           example: Production Key
 *         keyLast4:
 *           type: string
 *           description: Last 4 digits of the key for visual identifying
 *           example: f2e9
 *         userId:
 *           type: string
 *           description: Reference to the owner's User ID
 *         status:
 *           type: string
 *           enum: [active, revoked, expired]
 *           default: active
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [read, write, delete]
 *           example: ["read", "write"]
 *         rateLimit:
 *           type: integer
 *           description: Limit of requests per minute
 *           default: 60
 *         usageLimit:
 *           type: integer
 *           description: Max usage cap
 *           default: null
 *         usageCount:
 *           type: integer
 *           default: 0
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           default: null
 * 
 *     ApiLog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         keyId:
 *           type: string
 *         userId:
 *           type: string
 *         endpoint:
 *           type: string
 *           example: /api/v1/users
 *         method:
 *           type: string
 *           example: GET
 *         statusCode:
 *           type: integer
 *           example: 200
 *         duration:
 *           type: integer
 *           description: Request latency in ms
 *           example: 45
 *         ipAddress:
 *           type: string
 *           example: 127.0.0.1
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// Documentation annotations for Routes

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Validation or duplication error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /keys:
 *   post:
 *     summary: Create an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Production API Key
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [read, write, delete]
 *                 default: ["read"]
 *               rateLimit:
 *                 type: integer
 *                 default: 60
 *               usageLimit:
 *                 type: integer
 *                 default: null
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 default: null
 *     responses:
 *       201:
 *         description: Key created. Raw key ak_live_... is returned EXACTLY once here.
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: Get all API keys (Paginated, Searchable, Filterable)
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by key name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, revoked, expired]
 *         description: Filter by status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, usage, name]
 *         description: Sort criteria
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit per page (default 10)
 *     responses:
 *       200:
 *         description: API keys list retrieved successfully
 */
