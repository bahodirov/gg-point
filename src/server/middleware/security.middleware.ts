import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/environment';

// Rate limit time constants (in seconds)
const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;
const ONE_MINUTE_IN_SECONDS = 60;

/**
 * Helmet configuration for security headers
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      // NOTE: 'unsafe-inline' and 'unsafe-eval' significantly weaken XSS protection
      // Angular production builds don't require 'unsafe-eval'
      // Consider migrating to nonce-based or hash-based CSP for inline scripts
      // and removing 'unsafe-eval' entirely for production builds
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", config.apiUrl, config.domain],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
});

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes default
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
    });
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env['AUTH_RATE_LIMIT_MAX'] || '5', 10), // 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Too many login attempts, please try again in 15 minutes',
      retryAfter: FIFTEEN_MINUTES_IN_SECONDS
    });
  },
});

/**
 * Rate limiter for upload endpoints
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env['UPLOAD_RATE_LIMIT_MAX'] || '10', 10), // 10 uploads per 15 minutes
  skipSuccessfulRequests: true, // Only increment counter for failed uploads (status >= 400)
  message: 'Too many uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Upload limit exceeded',
      message: 'Too many uploads, please try again later',
      retryAfter: FIFTEEN_MINUTES_IN_SECONDS
    });
  },
});

/**
 * Lenient rate limit for public read endpoints
 */
export const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env['PUBLIC_RATE_LIMIT_MAX'] || '60', 10), // 60 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many requests, please try again later',
      retryAfter: ONE_MINUTE_IN_SECONDS
    });
  },
});

/**
 * Stricter rate limit for write operations
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env['WRITE_RATE_LIMIT_MAX'] || '20', 10), // 20 write operations per 15 minutes
  message: 'Too many write operations, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many write operations',
      message: 'Too many write operations, please try again later',
      retryAfter: FIFTEEN_MINUTES_IN_SECONDS
    });
  },
});

/**
 * CORS configuration
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowedOrigins = config.corsOrigins;

  const origin = req.headers.origin;
  const isAllowedOrigin = !origin || allowedOrigins.includes(origin);

  if (isAllowedOrigin && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    // For same-origin requests that don't send Origin header
    // No need for Access-Control-Allow-Origin but good practice to be explicit if needed
  } else if (process.env['NODE_ENV'] === 'production') {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
}

/**
 * Request logging middleware for audit trail
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Log request
  const requestLog = {
    method: req.method,
    url: req.url,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString(),
  };

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const responseLog = {
      ...requestLog,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    };

    // Only log errors and admin actions
    if (res.statusCode >= 400 || req.url.includes('/admin') || req.url.includes('/auth')) {
      console.log(JSON.stringify(responseLog));
    }
  });

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env['NODE_ENV'] !== 'production';

  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack }),
  });
}

export default {
  helmetConfig,
  apiLimiter,
  authLimiter,
  uploadLimiter,
  publicLimiter,
  writeLimiter,
  corsMiddleware,
  requestLogger,
  errorHandler,
};
