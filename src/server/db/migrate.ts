import { db } from './database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createHash, randomBytes } from 'node:crypto';

const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_PASSWORD_CHECK_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

function hashForDefaultCredentialCheck(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function generateAdminPassword(): string {
  return randomBytes(24).toString('hex');
}

/**
 * Seed initial data if database is empty
 */
export async function migrateData(): Promise<void> {
  console.log('Checking database status...');

  try {
    // Check if users already exist
    const userCount = await db.users.count();

    if (userCount === 0) {
      console.log('No users found. Creating admin user...');
      const adminUsername = process.env['ADMIN_USERNAME']?.trim() || DEFAULT_ADMIN_USERNAME;
      const envAdminPassword = process.env['ADMIN_PASSWORD']?.trim();
      const adminPassword = envAdminPassword ?? generateAdminPassword();
      const isProduction = process.env['NODE_ENV'] === 'production';

      if (!envAdminPassword) {
        console.warn('ADMIN_PASSWORD not set. Generated a temporary admin password.');
        if (isProduction) {
          console.warn('Set ADMIN_PASSWORD in production to avoid logging credentials.');
        }
        console.warn(`Generated admin password for ${adminUsername}: ${adminPassword}`);
      } else if (
        isProduction &&
        adminUsername === DEFAULT_ADMIN_USERNAME &&
        hashForDefaultCredentialCheck(envAdminPassword) === DEFAULT_PASSWORD_CHECK_HASH
      ) {
        console.warn('Default admin credentials detected in production. Update ADMIN_PASSWORD immediately.');
      }

      const passwordHash = await bcrypt.hash(adminPassword, 12);
      const userId = uuidv4();
      const now = new Date().toISOString();

      await db.users.insert({
        id: userId,
        username: adminUsername,
        password_hash: passwordHash,
        email: null,
        role: 'admin',
        must_change_password: true,
        created_at: now,
        updated_at: now,
      });

      console.log(`Admin user created for ${adminUsername}. Password change required on first login.`);
    } else {
      console.log(`Database has ${userCount} users.`);
    }

    // Check if products already exist
    const productCount = await db.products.count();
    console.log(`Database has ${productCount} products.`);
  } catch (error) {
    console.error('Migration/Seeding failed:', error);
  }
}

export default migrateData;
