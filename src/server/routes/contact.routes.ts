import { Router, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware';
import { writeLimiter } from '../middleware/security.middleware';
import { getPool } from '../db/pool';

const router = Router();

const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid')
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters')
    .normalizeEmail(),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 5000 })
    .withMessage('Message must not exceed 5000 characters'),
];

router.post('/', writeLimiter, contactValidation, validateRequest, async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  const pool = getPool();

  if (!pool) {
    return res
      .status(503)
      .json({ message: 'Service temporarily unavailable. Please try again later.' });
  }

  try {
    await pool.query(
      'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    return res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    const requestIdHeader = req.headers['x-request-id'];
    const requestId = Array.isArray(requestIdHeader) ? requestIdHeader[0] : requestIdHeader;
    console.error('Contact form error:', {
      requestId: requestId ?? randomUUID(),
      operation: 'insert_contact_message',
      message: error instanceof Error ? error.message : String(error),
    });
    return res
      .status(500)
      .json({ message: 'Failed to process your message. Please try again later.' });
  }
});

export default router;
