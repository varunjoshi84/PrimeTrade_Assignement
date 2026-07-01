const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ApexKey Developer API SaaS',
            version: '1.0.0',
            description: 'Production-ready MERN SaaS API documentation for ApexKey - API Key management & analytics dashboard.',
            contact: {
                name: 'Backend Developer Candidate',
                email: 'candidate@example.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5001/api/v1',
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT access token to access protected routes.',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Paths to files containing OpenAPI annotations
    apis: ['./src/routes/*.js', './src/docs/swagger-schemas.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
