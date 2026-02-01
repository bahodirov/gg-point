import { Router, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { requireAuth, setSessionCookie, clearSessionCookie } from '../middleware/auth.middleware';
import { loginValidation, changePasswordValidation, validateRequest } from '../middleware/validation.middleware';
import { authLimiter } from '../middleware/security.middleware';

const router = Router();

/**
 * POST /api/auth/login
 * Login with username and password
 */
router.post('/login', authLimiter, loginValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const result = await authService.login(username, password);

    if (!result) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    setSessionCookie(res, result.sessionId);
    res.json({ success: true, user: result.user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post('/logout', requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.sessionId) {
      await authService.logout(req.sessionId);
    }
    clearSessionCookie(res);
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/session
 * Check current session status
 */
router.get('/session', async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.['ggpoint_session'];

    if (!sessionId) {
      res.json({ authenticated: false });
      return;
    }

    const user = await authService.validateSession(sessionId);

    if (!user) {
      clearSessionCookie(res);
      res.json({ authenticated: false });
      return;
    }

    res.json({ authenticated: true, user });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/change-password
 * Change current user's password
 */
router.post('/change-password', requireAuth, changePasswordValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    const success = await authService.changePassword(req.user!.id, currentPassword, newPassword);

    if (!success) {
      res.status(400).json({ error: 'Current password is incorrect' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
