import { Request, Response, NextFunction } from 'express';
import { authService, User } from '../services/auth.service';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionId?: string;
    }
  }
}

const SESSION_COOKIE_NAME = 'ggpoint_session';

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  
  if (!sessionId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const user = await authService.validateSession(sessionId);
  
  if (!user) {
    res.clearCookie(SESSION_COOKIE_NAME);
    res.status(401).json({ error: 'Session expired or invalid' });
    return;
  }

  req.user = user;
  req.sessionId = sessionId;
  next();
}

/**
 * Middleware to optionally load user if authenticated (but don't require it)
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME];
  
  if (sessionId) {
    const user = await authService.validateSession(sessionId);
    if (user) {
      req.user = user;
      req.sessionId = sessionId;
    }
  }
  
  next();
}

/**
 * Helper to set session cookie
 */
export function setSessionCookie(res: Response, sessionId: string): void {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });
}

/**
 * Helper to clear session cookie
 */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME);
}

export { SESSION_COOKIE_NAME };
