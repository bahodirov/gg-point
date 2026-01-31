import { db } from '../db/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
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
    const userRow = db.users.find(u => u.username === username);

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

    db.sessions.insert({
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
  validateSession(sessionId: string): User | null {
    const now = new Date().toISOString();
    const session = db.sessions.find(s => s.sid === sessionId && s.expires_at > now);

    if (!session) {
      return null;
    }

    const userRow = db.users.find(u => u.id === session.user_id);
    if (!userRow) {
      return null;
    }

    const { password_hash, ...user } = userRow;
    return user;
  }

  /**
   * Logout - remove session
   */
  logout(sessionId: string): boolean {
    return db.sessions.delete(sessionId);
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const userRow = db.users.find(u => u.id === userId);

    if (!userRow) {
      return false;
    }

    const passwordMatch = await bcrypt.compare(currentPassword, userRow.password_hash);
    if (!passwordMatch) {
      return false;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    db.users.update(userId, {
      password_hash: newPasswordHash,
      updated_at: new Date().toISOString(),
    });

    return true;
  }

  /**
   * Clean up expired sessions
   */
  cleanExpiredSessions(): number {
    return db.sessions.deleteExpired();
  }
}

export const authService = new AuthService();
