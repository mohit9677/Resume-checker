import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'


const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'AstroBharatAI Resume Checker API',
            version: '1.0.0',
            description: 'Production-grade recruitment platform API with ATS scoring, OTP verification, and admin authentication',
            contact: {
                name: 'AstroBharatAI',
                email: 'mohitdhanuka01@gmail.com'
            }
        },
        servers: [
            {
                url: process.env.FRONTEND_URL?.replace('://astrobharat', '://parashari') || 'http://localhost:5000',
                description: 'Production server'
            },
            {
                url: 'http://localhost:5000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        message: { type: 'string' }
                    }
                },
                OTPSendRequest: {
                    type: 'object',
                    required: ['email'],
                    properties: {
                        email: { type: 'string', format: 'email', example: 'candidate@example.com' }
                    }
                },
                OTPVerifyRequest: {
                    type: 'object',
                    required: ['email', 'otp'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        otp: { type: 'string', pattern: '^[0-9]{6}$', example: '123456' }
                    }
                },
                AdminLoginRequest: {
                    type: 'object',
                    required: ['username', 'password'],
                    properties: {
                        username: { type: 'string', example: 'admin' },
                        password: { type: 'string', format: 'password' }
                    }
                },
                AdminLoginResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        token: { type: 'string' },
                        expiresIn: { type: 'number', example: 3600 }
                    }
                }
            }
        },
        tags: [
            { name: 'OTP', description: 'Email verification endpoints' },
            { name: 'Candidates', description: 'Candidate management' },
            { name: 'Applications', description: 'Application submission endpoints' },
            { name: 'Admin', description: 'Admin authentication and management (Protected)' },
            { name: 'Health', description: 'System health check' }
        ]
    },
    apis: ['./routes/*.js'] // Path to API routes for JSDoc comments
}

const swaggerSpec = swaggerJsdoc(options)

// Setup function to configure Swagger in Express
export function setupSwagger(app) {
    // Public Swagger UI - Admin system removed
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    // Swagger JSON endpoint
    app.get('/api/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })
}
