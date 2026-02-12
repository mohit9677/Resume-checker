import 'dotenv/config' // Load env vars before anything else
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { connectDB } from './config/database.js'
import otpRoutes from './routes/otp.js'
import candidateRoutes from './routes/candidates.js'
import applicationRoutes from './routes/applications.js'
import errorHandler from './middleware/errorHandler.js'
import logger from './utils/logger.js'

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

// CORS Middleware - Strict Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'https://parashari-jobs-portal.vercel.app'
]

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Curl, etc.)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin) || origin?.endsWith('.vercel.app')) {
            callback(null, true)
        } else {
            console.warn(JSON.stringify({
                level: "warn",
                event: "cors_blocked",
                origin: origin,
                timestamp: new Date().toISOString()
            }))
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Body Parser with size limits (protection against memory abuse)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ limit: '1mb', extended: true }))

// Routes
app.use('/api/otp', otpRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/applications', applicationRoutes)

// API Documentation (Swagger) - Removed for production
// setupSwagger(app)

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    })
})

// TEMP DEBUG: Email Connection Check
import nodemailer from 'nodemailer'
app.get('/api/debug/email-check', async (req, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transporter.verify();
        res.json({ status: 'success', message: 'SMTP Connection Successful', user: process.env.EMAIL_USER });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            code: error.code,
            response: error.response
        });
    }
});

// Global Error Handler (must be last)
app.use(errorHandler)

// Start server
// Start server
async function startServer() {
    try {
        console.log("STEP 1: Starting server...")
        console.log("PORT:", PORT)
        console.log("NODE_ENV:", process.env.NODE_ENV)

        console.log("STEP 2: Connecting to DB...")
        await connectDB()

        console.log("STEP 3: DB connected. Starting listen...")

        app.listen(PORT, '0.0.0.0', () => {
            console.log("STEP 4: Server listening on port", PORT)
            logger.info(`🚀 Server running on port ${PORT}`)
        })

    } catch (error) {
        console.error("FATAL STARTUP ERROR:", error)
        process.exit(1)
    }
}

console.log("Process starting...")
startServer()

