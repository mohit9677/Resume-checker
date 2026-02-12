import 'dotenv/config'
import winston from 'winston'

const { combine, timestamp, printf, colorize, errors } = winston.format

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`
})

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
    transports: [
        // Write all logs to combined.log
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: combine(
                timestamp(),
                winston.format.json()
            )
        }),
        // Write error logs to error.log
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: combine(
                timestamp(),
                winston.format.json()
            )
        })
    ]
})

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp({ format: 'HH:mm:ss' }),
            logFormat
        )
    }))
}

export default logger
