import { getPool, isPostgreSQLConfigured } from './pool';
import { Pool } from 'pg';

// Type definitions
export interface UserData {
  id: string;
  username: string;
  password_hash: string;
  email: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ProductData {
  id: string;
  slug: string;
  name_ru: string;
  name_uz: string | null;
  description_ru: string | null;
  description_uz: string | null;
  price: number;
  old_price: number | null;
  category: string;
  images: string; // JSON string for compatibility
  specs: string; // JSON string for compatibility
  in_stock: number; // 0 or 1 for compatibility
  featured: number; // 0 or 1 for compatibility
  is_new: number; // 0 or 1 for compatibility
  related_products: string | null; // JSON string for compatibility
  created_at: string;
  updated_at: string;
}

export interface SessionData {
  sid: string;
  user_id: string;
  created_at: string;
  expires_at: string;
}

export interface UploadedImageData {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  path: string;
  url: string;
  uploaded_by: string | null;
  created_at: string;
}

// Check if using PostgreSQL
let pool: Pool | null = null;
let databaseWarning: string | null = null;
let postgreSQLInitializationPromise: Promise<void> | null = null;

async function initializePostgreSQL(): Promise<void> {
  if (postgreSQLInitializationPromise) {
    return postgreSQLInitializationPromise;
  }

  postgreSQLInitializationPromise = (async () => {
    if (isPostgreSQLConfigured()) {
      pool = getPool();
      if (pool) {
        try {
          // Test connection
          await pool.query('SELECT 1');
          databaseWarning = null;
          console.log('✅ Using PostgreSQL database');
        } catch (error: any) {
          const errorMsg = `PostgreSQL ma'lumotlar bazasiga ulanib bo'lmadi: ${error.message}`;
          databaseWarning = errorMsg;
          console.error('❌ ' + errorMsg);
        }
      }
    } else {
      databaseWarning = 'DATABASE_URL sozlanmagan';
      console.error('❌ DATABASE_URL sozlanmagan!');
    }
  })();

  return postgreSQLInitializationPromise;
}

// Initialize on module load
initializePostgreSQL().catch(err => {
  console.error('Database initialization failed:', err);
  if (process.env['NODE_ENV'] === 'production') {
    process.exit(1);
  }
});

// Export database warning getter
export function getDatabaseWarning(): string | null {
  return databaseWarning;
}

// Export database status
export function isDatabaseHealthy(): boolean {
  return pool !== null && databaseWarning === null;
}

// Helper to convert PostgreSQL boolean/integer to 0/1
function boolToInt(value: boolean | number): number {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return value;
}

// Helper to convert integer to boolean
function intToBool(value: number): boolean {
  return value === 1;
}

// PostgreSQL implementations
const pgDb = {
  users: {
    all: async (): Promise<UserData[]> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    },
    findByUsername: async (username: string): Promise<UserData | null> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0] || null;
    },
    findByEmail: async (email: string): Promise<UserData | null> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    },
    findById: async (id: string): Promise<UserData | null> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    },
    insert: async (user: UserData): Promise<void> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      await pool.query(
        `INSERT INTO users (id, username, password_hash, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, user.username, user.password_hash, user.email, user.role, user.created_at, user.updated_at]
      );
    },
    update: async (id: string, updates: Partial<UserData>): Promise<void> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id') {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (fields.length === 0) return;

      values.push(id);
      await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    },
    count: async (): Promise<number> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query('SELECT COUNT(*) as count FROM users');
      return parseInt(result.rows[0].count, 10);
    },
  },
  products: {
    all: async (): Promise<ProductData[]> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT id, slug, name_ru, name_uz, description_ru, description_uz, price, old_price, category, images::text, specs::text, in_stock, featured, is_new, related_products::text, created_at, updated_at FROM products ORDER BY created_at DESC'
      );
      return result.rows.map(row => ({
        ...row,
        in_stock: boolToInt(row.in_stock),
        featured: boolToInt(row.featured),
        is_new: boolToInt(row.is_new),
      }));
    },
    findById: async (id: string): Promise<ProductData | null> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT id, slug, name_ru, name_uz, description_ru, description_uz, price, old_price, category, images::text, specs::text, in_stock, featured, is_new, related_products::text, created_at, updated_at FROM products WHERE id = $1',
        [id]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        in_stock: boolToInt(row.in_stock),
        featured: boolToInt(row.featured),
        is_new: boolToInt(row.is_new),
      };
    },
    findBySlug: async (slug: string): Promise<ProductData | null> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT id, slug, name_ru, name_uz, description_ru, description_uz, price, old_price, category, images::text, specs::text, in_stock, featured, is_new, related_products::text, created_at, updated_at FROM products WHERE slug = $1',
        [slug]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        ...row,
        in_stock: boolToInt(row.in_stock),
        featured: boolToInt(row.featured),
        is_new: boolToInt(row.is_new),
      };
    },
    filterByOptions: async (options: {
      category?: string;
      inStock?: boolean;
      featured?: boolean;
      isNew?: boolean;
    }): Promise<ProductData[]> => {
      if (!pool) throw new Error('PostgreSQL not initialized');

      const conditions: string[] = [];
      const values: any[] = [];

      if (options.category !== undefined) {
        values.push(options.category);
        conditions.push(`LOWER(category) = LOWER($${values.length})`);
      }

      if (options.inStock !== undefined) {
        values.push(options.inStock);
        conditions.push(`in_stock = $${values.length}`);
      }

      if (options.featured !== undefined) {
        values.push(options.featured);
        conditions.push(`featured = $${values.length}`);
      }

      if (options.isNew !== undefined) {
        values.push(options.isNew);
        conditions.push(`is_new = $${values.length}`);
      }

      const whereClause =
        conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT id, slug, name_ru, name_uz, description_ru, description_uz,
               price, old_price, category, images::text, specs::text,
               in_stock, featured, is_new, related_products::text,
               created_at, updated_at
        FROM products
        ${whereClause}
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, values);

      return result.rows.map(row => ({
        ...row,
        in_stock: boolToInt(row.in_stock),
        featured: boolToInt(row.featured),
        is_new: boolToInt(row.is_new),
      }));
    },
    filterByCategory: async (category: string): Promise<ProductData[]> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT id, slug, name_ru, name_uz, description_ru, description_uz, price, old_price, category, images::text, specs::text, in_stock, featured, is_new, related_products::text, created_at, updated_at FROM products WHERE LOWER(category) = LOWER($1) ORDER BY created_at DESC',
        [category]
      );
      return result.rows.map(row => ({
        ...row,
        in_stock: boolToInt(row.in_stock),
        featured: boolToInt(row.featured),
        is_new: boolToInt(row.is_new),
      }));
    },
    searchByText: async (queryText: string): Promise<ProductData[]> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const searchValue = `%${queryText}%`;
      const result = await pool.query(
        `SELECT id, slug, name_ru, name_uz, description_ru, description_uz, price, old_price, category,
                images::text, specs::text, in_stock, featured, is_new, related_products::text,
                created_at, updated_at
         FROM products
         WHERE name_ru ILIKE $1
            OR COALESCE(name_uz, '') ILIKE $1
            OR COALESCE(description_ru, '') ILIKE $1
            OR COALESCE(description_uz, '') ILIKE $1
         ORDER BY created_at DESC`,
        [searchValue]
      );
      return result.rows.map(row => ({
        ...row,
        in_stock: boolToInt(row.in_stock),
        featured: boolToInt(row.featured),
        is_new: boolToInt(row.is_new),
      }));
    },
    insert: async (product: ProductData): Promise<void> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      await pool.query(
        `INSERT INTO products (id, slug, name_ru, name_uz, description_ru, description_uz, price, old_price, category, images, specs, in_stock, featured, is_new, related_products, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13, $14, $15::jsonb, $16, $17)`,
        [
          product.id,
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
          intToBool(product.in_stock),
          intToBool(product.featured),
          intToBool(product.is_new),
          product.related_products,
          product.created_at,
          product.updated_at,
        ]
      );
    },
    insertMany: async (products: ProductData[]): Promise<void> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const product of products) {
          await client.query(
            `INSERT INTO products (id, slug, name_ru, name_uz, description_ru, description_uz, price, old_price, category, images, specs, in_stock, featured, is_new, related_products, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, $13, $14, $15::jsonb, $16, $17)`,
            [
              product.id,
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
              intToBool(product.in_stock),
              intToBool(product.featured),
              intToBool(product.is_new),
              product.related_products,
              product.created_at,
              product.updated_at,
            ]
          );
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    update: async (id: string, updates: Partial<ProductData>): Promise<void> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const fields: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(updates).forEach(([key, value]) => {
        if (key !== 'id') {
          // Handle boolean fields
          if (key === 'in_stock' || key === 'featured' || key === 'is_new') {
            fields.push(`${key} = $${paramCount}`);
            values.push(intToBool(value as number));
          } else if (key === 'images' || key === 'specs' || key === 'related_products') {
            fields.push(`${key} = $${paramCount}::jsonb`);
            values.push(value);
          } else {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
          }
          paramCount++;
        }
      });

      if (fields.length === 0) return;

      values.push(id);
      await pool.query(
        `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    },
    delete: async (id: string): Promise<boolean> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    },
    count: async (): Promise<number> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query('SELECT COUNT(*) as count FROM products');
      return parseInt(result.rows[0].count, 10);
    },
  },
  sessions: {
    all: async (): Promise<SessionData[]> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT * FROM sessions ORDER BY created_at DESC'
      );
      return result.rows;
    },
    findBySid: async (sid: string): Promise<SessionData | null> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT * FROM sessions WHERE sid = $1 AND expires_at > NOW()',
        [sid]
      );
      return result.rows[0] || null;
    },
    insert: async (session: SessionData): Promise<void> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      await pool.query(
        `INSERT INTO sessions (sid, user_id, created_at, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (sid) DO UPDATE SET
           user_id = EXCLUDED.user_id,
           created_at = EXCLUDED.created_at,
           expires_at = EXCLUDED.expires_at`,
        [session.sid, session.user_id, session.created_at, session.expires_at]
      );
    },
    delete: async (sid: string): Promise<boolean> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query('DELETE FROM sessions WHERE sid = $1', [sid]);
      return result.rowCount !== null && result.rowCount > 0;
    },
    deleteExpired: async (): Promise<number> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
      return result.rowCount || 0;
    },
  },
  uploadedImages: {
    all: async (limit?: number, offset?: number): Promise<UploadedImageData[]> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const query = limit
        ? 'SELECT * FROM uploaded_images ORDER BY created_at DESC LIMIT $1 OFFSET $2'
        : 'SELECT * FROM uploaded_images ORDER BY created_at DESC';
      const params = limit ? [limit, offset || 0] : [];
      const result = await pool.query(query, params);
      return result.rows;
    },
    findById: async (id: string): Promise<UploadedImageData | null> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query(
        'SELECT * FROM uploaded_images WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    },
    insert: async (image: UploadedImageData): Promise<void> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      await pool.query(
        `INSERT INTO uploaded_images (id, filename, original_name, mime_type, size_bytes, path, url, uploaded_by, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          image.id,
          image.filename,
          image.original_name,
          image.mime_type,
          image.size_bytes,
          image.path,
          image.url,
          image.uploaded_by,
          image.created_at,
        ]
      );
    },
    delete: async (id: string): Promise<boolean> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query('DELETE FROM uploaded_images WHERE id = $1', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    },
    count: async (): Promise<number> => {
      if (!pool) throw new Error('PostgreSQL not initialized');
      const result = await pool.query('SELECT COUNT(*) as count FROM uploaded_images');
      return parseInt(result.rows[0].count, 10);
    },
  },
};

// Database interface that uses PostgreSQL
export const db = {
  users: {
    all: (): Promise<UserData[]> => {
      return pgDb.users.all();
    },
    findByUsername: (username: string): Promise<UserData | null> => {
      return pgDb.users.findByUsername(username);
    },
    findByEmail: (email: string): Promise<UserData | null> => {
      return pgDb.users.findByEmail(email);
    },
    findById: (id: string): Promise<UserData | null> => {
      return pgDb.users.findById(id);
    },
    insert: (user: UserData): Promise<void> => {
      return pgDb.users.insert(user);
    },
    update: (id: string, updates: Partial<UserData>): Promise<void> => {
      return pgDb.users.update(id, updates);
    },
    count: (): Promise<number> => {
      return pgDb.users.count();
    },
  },
  products: {
    all: (): Promise<ProductData[]> => {
      return pgDb.products.all();
    },
    findById: (id: string): Promise<ProductData | null> => {
      return pgDb.products.findById(id);
    },
    findBySlug: (slug: string): Promise<ProductData | null> => {
      return pgDb.products.findBySlug(slug);
    },
    filterByOptions: (options: {
      category?: string;
      inStock?: boolean;
      featured?: boolean;
      isNew?: boolean;
    }): Promise<ProductData[]> => {
      return pgDb.products.filterByOptions(options);
    },
    filterByCategory: (category: string): Promise<ProductData[]> => {
      return pgDb.products.filterByCategory(category);
    },
    searchByText: (queryText: string): Promise<ProductData[]> => {
      return pgDb.products.searchByText(queryText);
    },
    insert: (product: ProductData): Promise<void> => {
      return pgDb.products.insert(product);
    },
    insertMany: (products: ProductData[]): Promise<void> => {
      return pgDb.products.insertMany(products);
    },
    update: (id: string, updates: Partial<ProductData>): Promise<void> => {
      return pgDb.products.update(id, updates);
    },
    delete: (id: string): Promise<boolean> => {
      return pgDb.products.delete(id);
    },
    count: (): Promise<number> => {
      return pgDb.products.count();
    },
  },
  sessions: {
    all: (): Promise<SessionData[]> => {
      return pgDb.sessions.all();
    },
    findBySid: (sid: string): Promise<SessionData | null> => {
      return pgDb.sessions.findBySid(sid);
    },
    insert: (session: SessionData): Promise<void> => {
      return pgDb.sessions.insert(session);
    },
    delete: (sid: string): Promise<boolean> => {
      return pgDb.sessions.delete(sid);
    },
    deleteExpired: (): Promise<number> => {
      return pgDb.sessions.deleteExpired();
    },
  },
  uploadedImages: {
    all: (limit?: number, offset?: number): Promise<UploadedImageData[]> => {
      return pgDb.uploadedImages.all(limit, offset);
    },
    findById: (id: string): Promise<UploadedImageData | null> => {
      return pgDb.uploadedImages.findById(id);
    },
    insert: (image: UploadedImageData): Promise<void> => {
      return pgDb.uploadedImages.insert(image);
    },
    delete: (id: string): Promise<boolean> => {
      return pgDb.uploadedImages.delete(id);
    },
    count: (): Promise<number> => {
      return pgDb.uploadedImages.count();
    },
  },
};

// Initialize schema (create tables if they don't exist)
export async function initializeDatabase(): Promise<void> {
  // Ensure PostgreSQL initialization is complete
  await initializePostgreSQL();

  if (pool) {
    try {
      // Read and execute schema file
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');

      // Try multiple paths to find schema.sql
      let schemaPath = join(import.meta.dirname, 'schema.sql');
      let schema: string;

      try {
        schema = readFileSync(schemaPath, 'utf-8');
      } catch (err) {
        // Try alternative path for development/build environment
        schemaPath = join(process.cwd(), 'src', 'server', 'db', 'schema.sql');
        schema = readFileSync(schemaPath, 'utf-8');
      }

      await pool.query(schema);
      console.log('PostgreSQL schema initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PostgreSQL schema:', error);
      throw error;
    }
  } else {
    console.error('Cannot initialize database schema: Pool not available');
  }
}

// For compatibility with existing code
export function getDb() {
  return db;
}

// Check if PostgreSQL is being used
export function isUsingPostgreSQL(): boolean {
  return pool !== null;
}

export default db;
