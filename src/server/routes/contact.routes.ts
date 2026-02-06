import { Router, Request, Response } from 'express';
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
    res.status(503).json({ error: 'Unable to submit message. Please try again later.' });
    return;
  }

  try {
    await pool.query(
      'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Unable to submit message. Please try again later.' });
  }
});

export default router;
