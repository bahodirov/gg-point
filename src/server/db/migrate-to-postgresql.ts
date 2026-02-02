import { getPool, isPostgreSQLConfigured, testConnection } from './pool';
import { db as jsonDb } from './database-json';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Get current directory for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Default admin credentials
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

/**
 * Migration script to move data from JSON files to PostgreSQL
 */
export async function migrateToPostgreSQL(): Promise<void> {
  console.log('\n=== Starting PostgreSQL Migration ===\n');

  // Check if PostgreSQL is configured
  if (!isPostgreSQLConfigured()) {
    console.log('PostgreSQL is not configured. Skipping migration.');
    console.log('Set DATABASE_URL or DB_* environment variables to enable PostgreSQL.');
    return;
  }

  const pool = getPool();
  if (!pool) {
    console.error('Failed to get PostgreSQL pool');
    return;
  }

  try {
    // Test connection
    console.log('Testing PostgreSQL connection...');
    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to PostgreSQL');
      return;
    }

    // Step 1: Initialize schema
    console.log('\nStep 1: Initializing database schema...');
    try {
      // Try multiple paths to find schema.sql
      let schemaPath = join(__dirname, 'schema.sql');
      let schema: string;

      try {
        schema = readFileSync(schemaPath, 'utf-8');
      } catch (err) {
        // Try alternative path for development/build environment
        schemaPath = join(process.cwd(), 'src', 'server', 'db', 'schema.sql');
        schema = readFileSync(schemaPath, 'utf-8');
      }

      await pool.query(schema);
      console.log('✓ Schema initialized');
    } catch (error: any) {
      if (error.code === '42710' || error.code === '42P07') {
        // Trigger or table already exists, skip
        console.log('✓ Schema already initialized (skipped)');
      } else {
        throw error;
      }
    }

    // Step 2: Migrate users
    console.log('\nStep 2: Migrating users...');
    await migrateUsers(pool);

    // Step 3: Migrate products
    console.log('\nStep 3: Migrating products...');
    await migrateProducts(pool);

    // Step 4: Validate migration
    console.log('\nStep 4: Validating migration...');
    await validateMigration(pool);

    console.log('\n=== PostgreSQL Migration Completed Successfully ===\n');
    console.log('IMPORTANT: Backup your JSON files before removing them!');
    console.log('JSON files location: data/users.json, data/products-db.json, data/sessions.json');
  } catch (error) {
    console.error('\n=== Migration Failed ===');
    console.error('Error:', error);
    console.log('\nRollback: To rollback, simply remove PostgreSQL configuration and restart.');
    throw error;
  }
}

/**
 * Migrate users from JSON to PostgreSQL
 */
async function migrateUsers(pool: any): Promise<void> {
  const client = await pool.connect();
  try {
    // Check if users already exist
    const countResult = await client.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(countResult.rows[0].count, 10);

    if (userCount > 0) {
      console.log(`  Found ${userCount} existing users in PostgreSQL. Skipping user migration.`);
      return;
    }

    // Get users from JSON
    const jsonUsers = jsonDb.users.all();

    if (jsonUsers.length === 0) {
      // Create default admin user if no users exist
      console.log('  No users in JSON. Creating default admin user...');
      const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
      const userId = uuidv4();
      const now = new Date().toISOString();

      await client.query(
        `INSERT INTO users (id, username, password_hash, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, DEFAULT_ADMIN_USERNAME, passwordHash, null, 'admin', now, now]
      );

      console.log(`  ✓ Created default admin user (username: ${DEFAULT_ADMIN_USERNAME}, password: ${DEFAULT_ADMIN_PASSWORD})`);
      console.log('  WARNING: Change the default password immediately!');
      return;
    }

    // Migrate users
    await client.query('BEGIN');
    let migratedCount = 0;

    for (const user of jsonUsers) {
      await client.query(
        `INSERT INTO users (id, username, password_hash, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (username) DO NOTHING`,
        [user.id, user.username, user.password_hash, user.email, user.role, user.created_at, user.updated_at]
      );
      migratedCount++;
    }

    await client.query('COMMIT');
    console.log(`  ✓ Migrated ${migratedCount} users`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('  ✗ User migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Migrate products from JSON to PostgreSQL
 */
async function migrateProducts(pool: any): Promise<void> {
  const client = await pool.connect();
  try {
    // Check if products already exist
    const countResult = await client.query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(countResult.rows[0].count, 10);

    if (productCount > 0) {
      console.log(`  Found ${productCount} existing products in PostgreSQL. Skipping product migration.`);
      return;
    }

    // Try to get products from JSON
    let jsonProducts = jsonDb.products.all();

    // If no products in database JSON, try to import from data/products.ts
    if (jsonProducts.length === 0) {
      try {
        const rawProductsModule = await import('../../../data/products');
        const rawProductsData = rawProductsModule.default || rawProductsModule;

        if (Array.isArray(rawProductsData) && rawProductsData.length > 0) {
          console.log(`  Found ${rawProductsData.length} products in data/products.ts`);

          const now = new Date().toISOString();
          jsonProducts = rawProductsData.map(p => ({
            id: p.id,
            slug: p.slug,
            name_ru: p.name.ru,
            name_uz: p.name.uz || null,
            description_ru: p.description.ru || null,
            description_uz: p.description.uz || null,
            price: p.price,
            old_price: p.oldPrice || null,
            category: p.category,
            images: JSON.stringify(p.images || []),
            specs: JSON.stringify(p.specs || {}),
            in_stock: p.inStock ? 1 : 0,
            featured: p.featured ? 1 : 0,
            is_new: p.isNew ? 1 : 0,
            related_products: JSON.stringify(p.relatedProducts || []),
            created_at: now,
            updated_at: now,
          }));
        }
      } catch (error) {
        console.log('  No products found in data/products.ts');
      }
    }

    if (jsonProducts.length === 0) {
      console.log('  No products to migrate');
      return;
    }

    // Migrate products
    await client.query('BEGIN');
    let migratedCount = 0;

    for (const product of jsonProducts) {
      // Convert 0/1 to boolean for PostgreSQL
      const inStock = product.in_stock === 1;
      const featured = product.featured === 1;
      const isNew = product.is_new === 1;

      // Generate UUID if the ID is not already a UUID
      const productId = product.id && product.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
        ? product.id
        : uuidv4();

      await client.query(
        `INSERT INTO products (id, slug, name_ru, name_uz, description_ru, description_uz, price, old_price, category, images, specs, in_stock, featured, is_new, related_products, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13, $14, $15::jsonb, $16, $17)
         ON CONFLICT (slug) DO NOTHING`,
        [
          productId,
          product.slug,
          product.name_ru,
          product.name_uz,
          product.description_ru,
          product.description_uz,
          product.price,
          product.old_price,
          product.category,
          product.images,
          product.specs,
          inStock,
          featured,
          isNew,
          product.related_products,
          product.created_at,
          product.updated_at,
        ]
      );
      migratedCount++;
    }

    await client.query('COMMIT');
    console.log(`  ✓ Migrated ${migratedCount} products`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('  ✗ Product migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Validate that migration was successful
 */
async function validateMigration(pool: any): Promise<void> {
  try {
    // Count users
    const userResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(userResult.rows[0].count, 10);
    console.log(`  ✓ Users in PostgreSQL: ${userCount}`);

    // Count products
    const productResult = await pool.query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(productResult.rows[0].count, 10);
    console.log(`  ✓ Products in PostgreSQL: ${productCount}`);

    // Test a sample query
    const sampleUser = await pool.query('SELECT username FROM users LIMIT 1');
    if (sampleUser.rows.length > 0) {
      console.log(`  ✓ Sample user query successful: ${sampleUser.rows[0].username}`);
    }

    const sampleProduct = await pool.query('SELECT name_ru FROM products LIMIT 1');
    if (sampleProduct.rows.length > 0) {
      console.log(`  ✓ Sample product query successful: ${sampleProduct.rows[0].name_ru}`);
    }

    console.log('  ✓ Validation complete');
  } catch (error) {
    console.error('  ✗ Validation failed:', error);
    throw error;
  }
}

/**
 * Rollback migration (drops all tables)
 * WARNING: This will delete all data in PostgreSQL!
 */
export async function rollbackMigration(): Promise<void> {
  console.log('\n=== Rolling Back PostgreSQL Migration ===\n');
  console.log('WARNING: This will delete all data in PostgreSQL!');

  if (!isPostgreSQLConfigured()) {
    console.log('PostgreSQL is not configured. Nothing to rollback.');
    return;
  }

  const pool = getPool();
  if (!pool) {
    console.error('Failed to get PostgreSQL pool');
    return;
  }

  try {
    await pool.query('DROP TABLE IF EXISTS audit_logs CASCADE');
    await pool.query('DROP TABLE IF EXISTS uploaded_images CASCADE');
    await pool.query('DROP TABLE IF EXISTS sessions CASCADE');
    await pool.query('DROP TABLE IF EXISTS products CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');
    await pool.query('DROP FUNCTION IF EXISTS update_updated_at_column CASCADE');

    console.log('✓ All tables dropped');
    console.log('\n=== Rollback Complete ===\n');
    console.log('Application will now use JSON file storage.');
  } catch (error) {
    console.error('Rollback failed:', error);
    throw error;
  }
}

export default migrateToPostgreSQL;
