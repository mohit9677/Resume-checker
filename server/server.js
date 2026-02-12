import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDB } from './config/database.js'
import otpRoutes from './routes/otp.js'
import candidateRoutes from './routes/candidates.js'
import applicationRoutes from './routes/applications.js'
import adminRoutes from './routes/admin.js'
import errorHandler from './middleware/errorHandler.js'
import logger from './utils/logger.js'
import { setupSwagger } from './docs/swagger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Trust proxy for Render/Vercel
app.set('trust proxy', 1)

// Security Middleware - Helmet
app.use(helmet({
    frameguard: { action: 'deny' },
    noSniff: true,
    hidePoweredBy: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    contentSecurityPolicy: false  // Disable CSP for API
}))

// CORS Middleware
// CORS Middleware
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://parashari-jobs-portal.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            console.log('Blocked by CORS:', origin) // Debugging log
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

// Body Parser with size limits (protection against memory abuse)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ limit: '1mb', extended: true }))

// Routes
app.use('/api/otp', otpRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/admin', adminRoutes)

// API Documentation (Swagger) - Protected in production
setupSwagger(app)

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    })
})

// Global Error Handler (must be last)
app.use(errorHandler)

// Start server
async function startServer() {
    try {
        await connectDB()
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`)
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
        })
    } catch (error) {
        logger.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()

