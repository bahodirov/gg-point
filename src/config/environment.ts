/**
 * Server-side environment configuration
 * Centralizes all environment variables for better maintainability
 */

export const config = {
  // Application settings
  nodeEnv: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '4000', 10),
  production: process.env['NODE_ENV'] === 'production',

  // Domain configuration
  domain: process.env['DOMAIN'] || 'http://localhost:4200',
  apiUrl: process.env['API_URL'] || 'http://localhost:4000',

  // Contact information
  contact: {
    phone: process.env['CONTACT_PHONE'] || '+998-XX-XXX-XXXX',
    email: process.env['CONTACT_EMAIL'] || 'info@gg-point.uz',
    address: process.env['CONTACT_ADDRESS'] || 'Tashkent, Uzbekistan',
    hours: process.env['CONTACT_HOURS'] || 'Monday - Sunday, 9:00 - 20:00',
  },

  // CORS configuration
  corsOrigins: process.env['CORS_ORIGIN']
    ? process.env['CORS_ORIGIN'].split(',')
    : ['http://localhost:4200', 'http://localhost:4000'],

  // Database configuration
  database: {
    url: process.env['DATABASE_URL'],
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    name: process.env['DB_NAME'],
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'],
    sslRejectUnauthorized: process.env['DB_SSL_REJECT_UNAUTHORIZED'] !== 'false',
  },

  // Session configuration
  session: {
    secret: process.env['SESSION_SECRET'] || 'your-super-secret-key-change-in-production-min-32-chars',
  },

  // Upload configuration
  upload: {
    dir: process.env['UPLOAD_DIR'] || 'public/uploads',
    maxFileSize: parseInt(process.env['MAX_FILE_SIZE'] || '5242880', 10),
    maxImageWidth: parseInt(process.env['MAX_IMAGE_WIDTH'] || '1920', 10),
    thumbnailWidth: parseInt(process.env['THUMBNAIL_WIDTH'] || '300', 10),
  },

  // Security configuration
  security: {
    rateLimitWindowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
    authRateLimitMax: parseInt(process.env['AUTH_RATE_LIMIT_MAX'] || '10', 10),
    uploadRateLimitMax: parseInt(process.env['UPLOAD_RATE_LIMIT_MAX'] || '20', 10),
    publicRateLimitMax: parseInt(process.env['PUBLIC_RATE_LIMIT_MAX'] || '60', 10),
    writeRateLimitMax: parseInt(process.env['WRITE_RATE_LIMIT_MAX'] || '20', 10),
  },
};

export default config;
