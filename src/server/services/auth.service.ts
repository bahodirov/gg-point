import { db } from '../db/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  sid: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export class AuthService {
  /**
   * Authenticate user with username and password
   */
  async login(username: string, password: string): Promise<{ user: User; sessionId: string } | null> {
    const userRow = await db.users.findByUsername(username);

    if (!userRow) {
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!passwordMatch) {
      return null;
    }

    // Create session
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS).toISOString();

    await db.sessions.insert({
      sid: sessionId,
      user_id: userRow.id,
      created_at: now.toISOString(),
      expires_at: expiresAt,
    });

    // Return user without password hash
    const { password_hash, ...user } = userRow;
    return { user, sessionId };
  }

  /**
   * Validate session and return user if valid
   */
  async validateSession(sessionId: string): Promise<User | null> {
    const now = new Date().toISOString();
    console.log(`Validating session ${sessionId}, now=${now}`);
    const session = await db.sessions.findBySid(sessionId);

    if (!session) {
      logger.warn(`Session ${sessionId} not found in database`);
      return null;
    }

    if (session.expires_at <= now) {
      logger.warn(`Session ${sessionId} expired at ${session.expires_at}`);
      return null;
    }

    const userRow = await db.users.findById(session.user_id);
    if (!userRow) {
      return null;
    }

    const { password_hash, ...user } = userRow;
    return user;
  }

  /**
   * Logout - remove session
   */
  async logout(sessionId: string): Promise<boolean> {
    return await db.sessions.delete(sessionId);
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const userRow = await db.users.findById(userId);

    if (!userRow) {
      return false;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, userRow.password_hash);
    if (!passwordMatch) {
      return false;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await db.users.update(userId, {
      password_hash: newPasswordHash,
      must_change_password: false,
      updated_at: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Clean up expired sessions
   */
  async cleanExpiredSessions(): Promise<number> {
    return await db.sessions.deleteExpired();
  }
}

export const authService = new AuthService();
