import { Pool, PoolConfig } from 'pg';

// Environment variable validation
function validateEnvironment(): void {
  const isDev = process.env['NODE_ENV'] !== 'production';
  
  if (!process.env['DATABASE_URL'] && !process.env['DB_NAME']) {
    if (isDev) {
      console.warn('WARNING: No database configuration found. Please set DATABASE_URL or DB_* environment variables.');
      console.warn('Falling back to JSON file storage for development.');
    } else {
      throw new Error('DATABASE_URL or DB_* environment variables must be set in production');
    }
  }
}

// Get pool configuration from environment
function getPoolConfig(): PoolConfig | null {
  validateEnvironment();

  // Option 1: Use DATABASE_URL
  if (process.env['DATABASE_URL']) {
    const sslConfig = process.env['NODE_ENV'] === 'production'
      ? process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false'
        ? { rejectUnauthorized: false }
        : true
      : undefined;
    
    // Warn if SSL verification is disabled in production
    if (process.env['NODE_ENV'] === 'production' && process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false') {
      console.warn('WARNING: SSL certificate verification is disabled (DB_SSL_REJECT_UNAUTHORIZED=false).');
      console.warn('This makes the connection vulnerable to man-in-the-middle attacks.');
      console.warn('Use proper SSL certificates in production or keep this setting only for development with self-signed certificates.');
    }
    
    return {
      connectionString: process.env['DATABASE_URL'],
      ssl: sslConfig,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
    };
  }

  // Option 2: Use individual settings
  if (process.env['DB_NAME']) {
    const sslConfig = process.env['NODE_ENV'] === 'production'
      ? process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false'
        ? { rejectUnauthorized: false }
        : true
      : undefined;
    
    // Warn if SSL verification is disabled in production
    if (process.env['NODE_ENV'] === 'production' && process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false') {
      console.warn('WARNING: SSL certificate verification is disabled (DB_SSL_REJECT_UNAUTHORIZED=false).');
      console.warn('This makes the connection vulnerable to man-in-the-middle attacks.');
      console.warn('Use proper SSL certificates in production or keep this setting only for development with self-signed certificates.');
    }
    
    return {
      host: process.env['DB_HOST'] || 'localhost',
      port: parseInt(process.env['DB_PORT'] || '5432', 10),
      database: process.env['DB_NAME'],
      user: process.env['DB_USER'] || 'postgres',
      password: process.env['DB_PASSWORD'],
      ssl: sslConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  return null;
}

// Create pool instance
let pool: Pool | null = null;

export function getPool(): Pool | null {
  if (pool) {
    return pool;
  }

  const config = getPoolConfig();
  if (!config) {
    return null;
  }

  pool = new Pool(config);

  // Error handler
  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
  });

  // Log successful connection in development
  if (process.env['NODE_ENV'] !== 'production') {
    pool.on('connect', () => {
      console.log('PostgreSQL client connected to pool');
    });
  }

  return pool;
}

// Check if PostgreSQL is configured
export function isPostgreSQLConfigured(): boolean {
  return getPoolConfig() !== null;
}

// Close the pool
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('PostgreSQL pool closed');
  }
}

// Test connection
export async function testConnection(): Promise<boolean> {
  const poolInstance = getPool();
  if (!poolInstance) {
    return false;
  }

  try {
    const client = await poolInstance.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('PostgreSQL connection test successful');
    return true;
  } catch (error) {
    console.error('PostgreSQL connection test failed:', error);
    return false;
  }
}

export default getPool;
