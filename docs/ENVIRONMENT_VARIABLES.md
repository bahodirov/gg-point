# Environment Variables Guide

This document describes all environment variables used in the GGPoint application.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` according to your environment

3. For production deployment, set the appropriate values for your production environment

## Environment Variables

### Application Configuration

#### `NODE_ENV`
- **Description**: Application environment mode
- **Default**: `development`
- **Values**: `development`, `production`
- **Example**: `NODE_ENV=production`

#### `PORT`
- **Description**: Port on which the server listens
- **Default**: `4000`
- **Example**: `PORT=4000`

### Domain Configuration

#### `DOMAIN`
- **Description**: The domain URL where the frontend is hosted
- **Default**: `http://localhost:4200` (development)
- **Production Example**: `DOMAIN=https://gg-point.uz`
- **Used in**: CSP headers, CORS, SEO metadata, structured data

#### `API_URL`
- **Description**: The URL where the API/backend is hosted
- **Default**: `http://localhost:4000` (development)
- **Production Example**: `API_URL=https://gg-point.uz`
- **Used in**: CSP headers, CORS

### Contact Information

These values are used in the contact page and SEO structured data.

#### `CONTACT_PHONE`
- **Description**: Business phone number
- **Default**: `+998-XX-XXX-XXXX`
- **Example**: `CONTACT_PHONE=+998-90-123-45-67`

#### `CONTACT_EMAIL`
- **Description**: Business email address
- **Default**: `info@gg-point.uz`
- **Example**: `CONTACT_EMAIL=support@gg-point.uz`

#### `CONTACT_ADDRESS`
- **Description**: Business physical address
- **Default**: `Tashkent, Uzbekistan`
- **Example**: `CONTACT_ADDRESS=123 Main St, Tashkent, Uzbekistan`
- **Multi-line**: Use `\n` for line breaks: `CONTACT_ADDRESS=Tashkent, Uzbekistan\nAmir Temur Avenue`

#### `CONTACT_HOURS`
- **Description**: Business operating hours
- **Default**: `Monday - Sunday, 9:00 - 20:00`
- **Example**: `CONTACT_HOURS=Mon-Fri 9:00-18:00, Sat-Sun 10:00-16:00`
- **Multi-line**: Use `\n` for line breaks: `CONTACT_HOURS=Monday - Sunday\n9:00 - 20:00`

### CORS Configuration

#### `CORS_ORIGIN`
- **Description**: Comma-separated list of allowed CORS origins
- **Default**: `http://localhost:4200,http://localhost:4000` (development)
- **Production Example**: `CORS_ORIGIN=https://gg-point.uz,https://www.gg-point.uz`

### Database Configuration

#### Option 1: Database URL (Recommended for Production)

#### `DATABASE_URL`
- **Description**: Full PostgreSQL connection string
- **Format**: `postgresql://user:password@host:port/database`
- **Example**: `DATABASE_URL=postgresql://pguser:pgpass@localhost:5432/ggpoint`

#### Option 2: Individual Database Settings (For Development)

#### `DB_HOST`
- **Description**: Database host
- **Default**: `localhost`
- **Example**: `DB_HOST=localhost`

#### `DB_PORT`
- **Description**: Database port
- **Default**: `5432`
- **Example**: `DB_PORT=5432`

#### `DB_NAME`
- **Description**: Database name
- **Required**: Yes (unless using DATABASE_URL)
- **Example**: `DB_NAME=ggpoint`

#### `DB_USER`
- **Description**: Database user
- **Default**: `postgres`
- **Example**: `DB_USER=pguser`

#### `DB_PASSWORD`
- **Description**: Database password
- **Required**: Yes (unless using DATABASE_URL)
- **Example**: `DB_PASSWORD=securepassword`

#### `DB_SSL_REJECT_UNAUTHORIZED`
- **Description**: Whether to reject unauthorized SSL certificates
- **Default**: `true` (recommended for production)
- **Development**: Set to `false` only for self-signed certificates
- **Example**: `DB_SSL_REJECT_UNAUTHORIZED=false`
- **⚠️ Warning**: Only set to `false` in development with self-signed certificates

### Session Configuration

#### `SESSION_SECRET`
- **Description**: Secret key for session encryption
- **Required**: Yes
- **Minimum Length**: 32 characters
- **Example**: `SESSION_SECRET=your-super-secret-key-change-in-production-min-32-chars`
- **⚠️ Warning**: Never commit the actual secret to version control

### Upload Configuration

#### `UPLOAD_DIR`
- **Description**: Directory for uploaded files
- **Default**: `public/uploads`
- **Example**: `UPLOAD_DIR=public/uploads`

#### `MAX_FILE_SIZE`
- **Description**: Maximum file upload size in bytes
- **Default**: `5242880` (5MB)
- **Example**: `MAX_FILE_SIZE=10485760` (10MB)

#### `MAX_IMAGE_WIDTH`
- **Description**: Maximum width for uploaded images
- **Default**: `1920`
- **Example**: `MAX_IMAGE_WIDTH=2560`

#### `THUMBNAIL_WIDTH`
- **Description**: Width for generated thumbnails
- **Default**: `300`
- **Example**: `THUMBNAIL_WIDTH=400`

### Security Configuration

#### `RATE_LIMIT_WINDOW_MS`
- **Description**: Rate limit window in milliseconds
- **Default**: `900000` (15 minutes)
- **Example**: `RATE_LIMIT_WINDOW_MS=600000` (10 minutes)

#### `RATE_LIMIT_MAX_REQUESTS`
- **Description**: Maximum requests per window for general API
- **Default**: `100`
- **Example**: `RATE_LIMIT_MAX_REQUESTS=200`

#### `AUTH_RATE_LIMIT_MAX`
- **Description**: Maximum authentication attempts per window
- **Default**: `10`
- **Example**: `AUTH_RATE_LIMIT_MAX=5`

#### `UPLOAD_RATE_LIMIT_MAX`
- **Description**: Maximum upload attempts per window
- **Default**: `20`
- **Example**: `UPLOAD_RATE_LIMIT_MAX=10`

#### `PUBLIC_RATE_LIMIT_MAX`
- **Description**: Maximum requests per minute for public endpoints
- **Default**: `60`
- **Example**: `PUBLIC_RATE_LIMIT_MAX=100`

#### `WRITE_RATE_LIMIT_MAX`
- **Description**: Maximum write operations per window
- **Default**: `20`
- **Example**: `WRITE_RATE_LIMIT_MAX=30`

## Environment-Specific Configuration

### Development Environment

Create a `.env` file with development values:

```bash
NODE_ENV=development
PORT=4000
DOMAIN=http://localhost:4200
API_URL=http://localhost:4000
CONTACT_PHONE=+998-90-123-45-67
CONTACT_EMAIL=dev@gg-point.uz
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ggpoint_dev
SESSION_SECRET=dev-secret-key-at-least-32-characters-long
```

### Production Environment

Set environment variables directly in your hosting environment or create a `.env` file:

```bash
NODE_ENV=production
PORT=4000
DOMAIN=https://gg-point.uz
API_URL=https://gg-point.uz
CORS_ORIGIN=https://gg-point.uz,https://www.gg-point.uz
CONTACT_PHONE=+998-90-123-45-67
CONTACT_EMAIL=info@gg-point.uz
CONTACT_ADDRESS=123 Main St, Tashkent, Uzbekistan
DATABASE_URL=postgresql://user:password@prod-host:5432/ggpoint
SESSION_SECRET=your-very-long-random-production-secret-key-min-32-chars
```

## Angular Environment Files

The Angular application uses environment files for client-side configuration:

- **`src/environments/environment.ts`**: Development configuration
- **`src/environments/environment.prod.ts`**: Production configuration

These files are automatically selected based on the build configuration:
- `ng build` (development): Uses `environment.ts`
- `ng build --configuration=production`: Uses `environment.prod.ts`

### Customizing Angular Environment Files

To customize values for different environments, update the respective environment file:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000',
  domain: 'http://localhost:4200',
  contact: {
    phone: '+998-90-123-45-67',
    email: 'dev@gg-point.uz',
    // ... other contact info
  },
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://gg-point.uz',
  domain: 'https://gg-point.uz',
  contact: {
    phone: '+998-90-123-45-67',
    email: 'info@gg-point.uz',
    // ... other contact info
  },
};
```

## Best Practices

1. **Never commit `.env` files**: The `.env` file is in `.gitignore` for a reason
2. **Keep `.env.example` updated**: Always update `.env.example` when adding new variables
3. **Use strong secrets**: Generate strong random values for `SESSION_SECRET`
4. **Set appropriate CORS origins**: Only allow trusted origins in production
5. **Use environment variables in CI/CD**: Set environment variables in your CI/CD pipeline
6. **Validate on startup**: The application validates critical environment variables on startup
7. **Document changes**: Update this file when adding or modifying environment variables

## Troubleshooting

### Server fails to start

Check that all required environment variables are set:
- `DATABASE_URL` or `DB_NAME` is required
- `SESSION_SECRET` must be at least 32 characters

### CORS errors in production

Ensure `CORS_ORIGIN` includes your production domain:
```bash
CORS_ORIGIN=https://yourdomain.com
```

### Contact information not updating

1. Check that environment variables are set correctly
2. For server-side: Restart the server after changing `.env`
3. For client-side: Rebuild the Angular application with the correct configuration
