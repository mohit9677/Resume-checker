import rateLimit from 'express-rate-limit'
import logger from '../utils/logger.js'

// Helper for structured logging
const logRateLimit = (req, limitType) => {
    console.warn(JSON.stringify({
        level: "warn",
        event: "rate_limit_exceeded",
        type: limitType,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    }))
}


// IP-based rate limiter for application submission
// 3 requests per hour per IP
export const applicationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
})
