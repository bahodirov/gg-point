import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';

// Validate and get SSL configuration
function getSSLConfig(): PoolConfig['ssl'] {
  const nodeEnv = process.env['NODE_ENV'];
  
  // Treat undefined/unset NODE_ENV as production for security (fail-safe to secure configuration)
  const isProduction = !nodeEnv || nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';
  
  // Fail startup if insecure SSL configuration detected in production
  if (isProduction && process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false') {
    throw new Error(
      'CRITICAL SECURITY ERROR: SSL certificate verification is disabled in production (DB_SSL_REJECT_UNAUTHORIZED=false). ' +
      'This makes the connection vulnerable to man-in-the-middle attacks. ' +
      'Remove DB_SSL_REJECT_UNAUTHORIZED or set it to "true" in production. ' +
      'Use rejectUnauthorized=false only in development environments with self-signed certificates.'
    );
  }

  const sslConfig = isProduction
    ? true  // Always enable SSL verification in production (including when NODE_ENV is undefined)
    : process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false'
      ? { rejectUnauthorized: false }
      : undefined;
  
  // Warn if SSL verification is disabled in development
  if (isDevelopment && process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false') {
    logger.warn('WARNING: SSL is configured with rejectUnauthorized: false');
    logger.warn('This is insecure and should only be used in development');
  }

  return sslConfig;
}

// Validate and get SSL configuration
function getSSLConfig(): PoolConfig['ssl'] {
  const nodeEnv = process.env['NODE_ENV'];
  
  // Treat undefined/unset NODE_ENV as production for security (fail-safe to secure configuration)
  const isProduction = !nodeEnv || nodeEnv === 'production';
  const isDevelopment = nodeEnv === 'development';
  
  // Fail startup if insecure SSL configuration detected in production
  if (isProduction && process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false') {
    throw new Error(
      'CRITICAL SECURITY ERROR: SSL certificate verification is disabled in production (DB_SSL_REJECT_UNAUTHORIZED=false). ' +
      'This makes the connection vulnerable to man-in-the-middle attacks. ' +
      'Remove DB_SSL_REJECT_UNAUTHORIZED or set it to "true" in production. ' +
      'Use rejectUnauthorized=false only in development environments with self-signed certificates.'
    );
  }

  const sslConfig = isProduction
    ? true  // Always enable SSL verification in production (including when NODE_ENV is undefined)
    : process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false'
      ? { rejectUnauthorized: false }
      : undefined;
  
  // Warn if SSL verification is disabled in development
  if (isDevelopment && process.env['DB_SSL_REJECT_UNAUTHORIZED'] === 'false') {
    console.warn('WARNING: SSL is configured with rejectUnauthorized: false');
    console.warn('This is insecure and should only be used in development');
  }

  return sslConfig;
}

// Environment variable validation
function validateEnvironment(): void {
  const isDev = process.env['NODE_ENV'] !== 'production';
  
  if (!process.env['DATABASE_URL'] && !process.env['DB_NAME']) {
    if (isDev) {
      logger.warn('WARNING: No database configuration found. Please set DATABASE_URL or DB_* environment variables.');
      logger.warn('Falling back to JSON file storage for development.');
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
    return {
      connectionString: process.env['DATABASE_URL'],
      ssl: getSSLConfig(),
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
    };
  }

  // Option 2: Use individual settings
  if (process.env['DB_NAME']) {
    return {
      host: process.env['DB_HOST'] || 'localhost',
      port: parseInt(process.env['DB_PORT'] || '5432', 10),
      database: process.env['DB_NAME'],
      user: process.env['DB_USER'] || 'postgres',
      password: process.env['DB_PASSWORD'],
      ssl: getSSLConfig(),
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
    logger.error('Unexpected error on idle PostgreSQL client', err);
  });

  // Log successful connection in development
  if (process.env['NODE_ENV'] !== 'production') {
    pool.on('connect', () => {
      logger.debug('PostgreSQL client connected to pool');
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
    logger.info('PostgreSQL pool closed');
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
    logger.info('PostgreSQL connection test successful');
    return true;
  } catch (error) {
    logger.error('PostgreSQL connection test failed:', error);
    return false;
  }
}

export default getPool;
