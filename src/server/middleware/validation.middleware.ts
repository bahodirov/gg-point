import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to check validation results
 */
export function validateRequest(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    logger.warn('Validation failed for request:', { url: req.url, errors: errors.array() });
    res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }

  next();
}

/**
 * Password strength validation
 */
export const passwordValidation = [
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
];

/**
 * Login validation
 */
export const loginValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Change password validation
 */
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 12 })
    .withMessage('New password must be at least 12 characters long')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('New password must contain at least one special character'),
];

/**
 * Product validation
 */
export const productValidation = [
  body('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
    .isLength({ max: 255 })
    .withMessage('Slug must not exceed 255 characters'),
  body('name_ru')
    .trim()
    .notEmpty()
    .withMessage('Russian name is required')
    .isLength({ max: 500 })
    .withMessage('Name must not exceed 500 characters'),
  body('name_uz')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Name must not exceed 500 characters'),
  body('description_ru')
    .optional()
    .trim(),
  body('description_uz')
    .optional()
    .trim(),
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => value >= 0)
    .withMessage('Price must be positive'),
  body('old_price')
    .optional()
    .isNumeric()
    .withMessage('Old price must be a number'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('specs')
    .optional()
    .isObject()
    .withMessage('Specs must be an object'),
  body('in_stock')
    .optional()
    .isBoolean()
    .withMessage('in_stock must be a boolean'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('featured must be a boolean'),
  body('is_new')
    .optional()
    .isBoolean()
    .withMessage('is_new must be a boolean'),
  body('related_products')
    .optional()
    .isArray()
    .withMessage('related_products must be an array'),
];

/**
 * UUID validation
 */
export const uuidValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
];

/**
 * Pagination validation
 */
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('per_page')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Per page must be between 1 and 100'),
];

/**
 * Search query validation
 */
export const searchValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Search query must be between 1 and 200 characters'),
  query('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
];

/**
 * Sanitize user input to prevent XSS
 *
 * NOTE: This is a basic XSS prevention approach using regex patterns.
 * It handles common XSS vectors like <script> tags, inline event handlers,
 * and javascript: protocol. For more comprehensive XSS protection in
 * high-security applications, consider using dedicated libraries like:
 * - DOMPurify (for HTML sanitization)
 * - validator.js escape() (for text escaping)
 * - express-validator's escape() (already included)
 *
 * Current limitations:
 * - May not catch sophisticated encoding-based XSS attacks
 * - Does not handle SVG-based XSS vectors
 * - Does not sanitize CSS expressions
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  // Recursively sanitize objects
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Basic XSS prevention - remove script tags and dangerous attributes
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '');
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }

    return obj;
  };

  if (req.body) {
    const sanitizedBody = sanitize(req.body);
    Object.keys(req.body).forEach(key => delete req.body[key]);
    Object.assign(req.body, sanitizedBody);
  }

  if (req.query) {
    const sanitizedQuery = sanitize(req.query);
    Object.keys(req.query).forEach(key => delete (req.query as any)[key]);
    Object.assign(req.query, sanitizedQuery);
  }

  next();
}

export default {
  validateRequest,
  passwordValidation,
  loginValidation,
  changePasswordValidation,
  productValidation,
  uuidValidation,
  paginationValidation,
  searchValidation,
  sanitizeInput,
};
