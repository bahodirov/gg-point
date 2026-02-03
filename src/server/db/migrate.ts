import { db } from './database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Default admin credentials
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

/**
 * Seed initial data if database is empty
 */
export async function migrateData(): Promise<void> {
  console.log('Checking database status...');

  try {
    // Check if users already exist
    const userCount = await db.users.count();

    if (userCount === 0) {
      console.log('No users found. Creating default admin user...');
      const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
      const userId = uuidv4();
      const now = new Date().toISOString();

      await db.users.insert({
        id: userId,
        username: DEFAULT_ADMIN_USERNAME,
        password_hash: passwordHash,
        email: null,
        role: 'admin',
        created_at: now,
        updated_at: now,
      });

      console.log('Default admin user created (username: admin, password: admin123)');
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
