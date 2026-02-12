import rateLimit from 'express-rate-limit'

// Generic rate limit exceeded handler
const rateLimitHandler = (req, res) => {
    res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
    })
}

// IP-based rate limiter for OTP send
// 5 requests per 10 minutes per IP
export const otpSendLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
})

// IP-based rate limiter for OTP verify
// 10 requests per 10 minutes per IP
export const otpVerifyLimiterIP = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10,
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
})

// Email-based rate limiter for OTP verify
// 5 attempts per 10 minutes per email
export const otpVerifyLimiterEmail = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    keyGenerator: (req) => {
        // Use email from request body as the key
        return req.body.email || 'unknown_user'
    },
    message: {
        success: false,
        message: 'Too many requests. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler
})

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
