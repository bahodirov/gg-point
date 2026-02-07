import winston from 'winston';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Create logs directory if it doesn't exist
const logsDir = join(process.cwd(), 'logs');
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

/**
 * Application logger using Winston
 * 
 * Log levels:
 * - error: Error conditions that require immediate attention
 * - warn: Warning conditions
 * - info: Informational messages (server start, user actions, etc.)
 * - debug: Debug information (only in development)
 */
export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || (process.env['NODE_ENV'] === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'ggpoint' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// If we're not in production, log to console with a simpler format
if (process.env['NODE_ENV'] !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp, ...metadata }: any) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        // Exclude winston-internal metadata fields (service, timestamp, level)
        const { service, ...customMetadata } = metadata;
        if (Object.keys(customMetadata).length > 0) {
          msg += ` ${JSON.stringify(customMetadata)}`;
        }
        return msg;
      })
    )
  }));
}
