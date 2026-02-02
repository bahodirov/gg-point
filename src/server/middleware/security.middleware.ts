import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

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
      connectSrc: ["'self'", "http://localhost:4000", "http://localhost:4200"],
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
  max: parseInt(process.env['AUTH_RATE_LIMIT_MAX'] || '10', 10),
  skipSuccessfulRequests: false,
  message: 'Too many authentication attempts, please try again later.',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Account temporarily locked. Please try again in 15 minutes.',
    });
  },
});

/**
 * Rate limiter for upload endpoints
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env['UPLOAD_RATE_LIMIT_MAX'] || '20', 10),
  skipSuccessfulRequests: false,
  message: 'Too many uploads, please try again later.',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Upload limit exceeded',
      message: 'You have exceeded the upload limit. Please try again in an hour.',
    });
  },
});

/**
 * CORS configuration
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const allowedOrigins = process.env['CORS_ORIGIN']
    ? process.env['CORS_ORIGIN'].split(',')
    : ['http://localhost:4200', 'http://localhost:4000'];

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
  corsMiddleware,
  requestLogger,
  errorHandler,
};
