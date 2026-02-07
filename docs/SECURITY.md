# Security Best Practices

This document outlines security best practices for deploying and maintaining the GGPoint application.

## Table of Contents
- [Authentication & Authorization](#authentication--authorization)
- [Database Security](#database-security)
- [API Security](#api-security)
- [File Upload Security](#file-upload-security)
- [Session Management](#session-management)
- [Network Security](#network-security)
- [Monitoring & Logging](#monitoring--logging)
- [Security Checklist](#security-checklist)

## Authentication & Authorization

### Password Policy

The application enforces strong password requirements:
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Implementation:**
```typescript
// Validation middleware in src/server/middleware/validation.middleware.ts
export const passwordValidation = [
  body('password')
    .isLength({ min: 12 })
    .matches(/[A-Z]/)
    .matches(/[a-z]/)
    .matches(/[0-9]/)
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
];
```

### Change Default Credentials

⚠️ **CRITICAL**: Change the default admin password immediately after deployment!

Default credentials:
- Username: `admin`
- Password: `admin123`

**Change password via Admin Panel:**
1. Login to `/admin`
2. Navigate to Settings → Change Password
3. Enter current password and new strong password

**Change password via API:**
```bash
curl -X POST https://yourdomain.com/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: ggpoint_session=YOUR_SESSION_ID" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "YourNewStrongPassword123!"
  }'
```

### Rate Limiting

Rate limiting prevents brute force attacks:

**Authentication Endpoints:**
- **10 attempts per 15 minutes** per IP address
- Applies to `/api/auth/login`
- Returns 429 (Too Many Requests) when exceeded

**General API Endpoints:**
- **100 requests per 15 minutes** per IP address
- Applies to all API routes

**Upload Endpoints:**
- **20 uploads per hour** per authenticated user
- Applies to `/api/admin/upload-image`

**Configuration** (`.env`):
```env
AUTH_RATE_LIMIT_MAX=10
RATE_LIMIT_MAX_REQUESTS=100
UPLOAD_RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
```

## Database Security

### PostgreSQL Configuration

**1. Use Strong Passwords**
```sql
-- Never use default or weak passwords
CREATE USER ggpoint_user WITH ENCRYPTED PASSWORD 'StrongP@ssw0rd123!';
```

**2. Grant Minimum Required Privileges**
```sql
-- Only grant necessary permissions
GRANT CONNECT ON DATABASE ggpoint TO ggpoint_user;
GRANT USAGE ON SCHEMA public TO ggpoint_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ggpoint_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ggpoint_user;

-- Revoke unnecessary permissions
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
```

**3. Use SSL/TLS for Connections**

In production, always use SSL for database connections:

`.env`:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

**4. Restrict Network Access**

Edit PostgreSQL `pg_hba.conf`:
```
# Allow only specific IP addresses
host    ggpoint    ggpoint_user    10.0.1.5/32    md5
host    ggpoint    ggpoint_user    10.0.1.6/32    md5

# Deny all others
host    all        all             0.0.0.0/0      reject
```

**5. Regular Backups**
```bash
# Daily backup script
pg_dump -U ggpoint_user -h localhost ggpoint > backup-$(date +%Y%m%d).sql

# Encrypt backup
gpg --encrypt --recipient admin@ggpoint.com backup-$(date +%Y%m%d).sql
```

### SQL Injection Prevention

The application uses **parameterized queries** for all database operations:

```typescript
// GOOD - Parameterized query
await pool.query('SELECT * FROM users WHERE username = $1', [username]);

// BAD - String concatenation (NEVER DO THIS)
// await pool.query(`SELECT * FROM users WHERE username = '${username}'`);
```

All database queries use the PostgreSQL `pg` library with parameterized queries to prevent SQL injection.

## API Security

### Input Validation

All API endpoints validate input using `express-validator`:

**Example: Product Creation**
```typescript
router.post('/products', 
  requireAuth,
  productValidation,
  validateRequest,
  async (req, res) => {
    // All inputs are validated before reaching here
  }
);
```

**Validation Rules:**
- String length limits
- Data type validation (string, number, boolean, array, object)
- Format validation (UUID, slug, email)
- Required field checks
- Sanitization (XSS prevention)

### XSS Prevention

**1. Input Sanitization**

All user inputs are sanitized to remove malicious scripts:

```typescript
// Removes <script> tags and dangerous attributes
export function sanitizeInput(req, res, next) {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  next();
}
```

**2. Content Security Policy (CSP)**

The application uses a strict nonce-based CSP configuration to prevent XSS attacks:

```typescript
// Import crypto module for nonce generation
import { randomBytes } from 'crypto';

// Middleware to generate unique nonce for each request
export function cspNonceMiddleware(req: Request, res: Response, next: NextFunction): void {
  const nonce = randomBytes(16).toString('base64');
  // Store nonce in res.locals to pass it to helmet config
  res.locals.cspNonce = nonce;
  next();
}

// Helmet configuration that uses the nonce from res.locals
export function helmetConfig(req: Request, res: Response, next: NextFunction): void {
  const nonce = res.locals.cspNonce;
  
  // Set CSP header with nonce
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}'`,  // Nonce-based, no unsafe-inline
    `style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com`,
    `style-src-attr 'unsafe-inline'`,  // Allow inline style attributes only
    `img-src 'self' data: https:`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' http://localhost:4000 http://localhost:4200`,
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspDirectives);
  next();
}
```

**Key Security Features:**
- ✅ **Removed `'unsafe-inline'` and `'unsafe-eval'`** from script-src - Prevents arbitrary script execution
- ✅ **Nonce-based CSP** - Each request gets a unique nonce for inline scripts/styles
- ✅ **Strict directives** - Only allows scripts and styles from trusted sources
- ✅ **Per-request nonces** - Fresh cryptographically random nonce for each HTTP request
- ✅ **Granular style control** - Inline style attributes allowed via `style-src-attr`, while `<style>` tags require nonce

**Note:** The nonce must be added to any inline `<script>` or `<style>` tags:
```html
<script nonce="${cspNonce}">
  // Inline script code
</script>
```

### CORS Configuration

**Development:**
```env
CORS_ORIGIN=http://localhost:4200,http://localhost:4000
NODE_ENV=development
```

**Production:**
```env
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

The application restricts CORS to configured origins in production mode.

### Security Headers

Helmet.js adds multiple security headers:

- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-Frame-Options**: `DENY` - Prevents clickjacking
- **X-XSS-Protection**: `1; mode=block` - Enables XSS filter
- **Strict-Transport-Security**: `max-age=31536000; includeSubDomains; preload` - Enforces HTTPS
- **Content-Security-Policy**: Restricts resource loading

## File Upload Security

### Validation

**1. File Type Validation**

Only image files are allowed:
```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
```

**2. File Size Limit**

Default: 5MB per file

```env
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

**3. File Name Sanitization**

Uploaded files are renamed to prevent directory traversal:
```typescript
filename: `product-${timestamp}-${uuid}.${ext}`
```

**4. Image Optimization**

All uploaded images are:
- Converted to WebP format
- Resized to maximum 1920px width
- Thumbnail generated (300px width)
- Original file deleted after optimization

### Storage Security

**1. Store Outside Webroot** (if possible)

Move `public/uploads` outside the web-accessible directory and serve via application.

**2. Access Control**

Only authenticated admin users can upload images:
```typescript
router.post('/upload-image', requireAuth, uploadLimiter, ...);
```

**3. Deletion Protection**

Images in use by products cannot be deleted:
```typescript
const isUsed = await imageService.isImageUsedInProducts(image.url);
if (isUsed) {
  return res.status(400).json({ error: 'Image is in use' });
}
```

## Session Management

### Secure Cookies

Session cookies are configured with security flags:

```typescript
res.cookie('ggpoint_session', sessionId, {
  httpOnly: true,           // Prevents JavaScript access
  secure: NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'lax',         // CSRF protection
  maxAge: 24 * 60 * 60 * 1000,  // 24 hours
});
```

### Session Expiration

- Default session duration: **24 hours**
- Sessions are automatically cleaned up on expiration
- Users must re-authenticate after expiration

### Session Secret

⚠️ **CRITICAL**: Use a strong, random session secret!

```env
# Generate a strong random string (32+ characters)
SESSION_SECRET=your-super-secret-random-string-min-32-chars
```

**Generate a secure secret:**
```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Network Security

### HTTPS/TLS

**Production Deployment:**
1. Obtain SSL/TLS certificate (Let's Encrypt, Cloudflare, etc.)
2. Configure reverse proxy (Nginx, Apache)
3. Redirect HTTP to HTTPS
4. Enable HSTS header

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Firewall Configuration

**UFW (Ubuntu):**
```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PostgreSQL only from specific IP
sudo ufw allow from 10.0.1.5 to any port 5432

# Enable firewall
sudo ufw enable
```

## Monitoring & Logging

### Audit Logging

All admin actions are logged to the `audit_logs` table:

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Logged events:**
- User login/logout
- Product creation/update/deletion
- Image upload/deletion
- Password changes
- Failed authentication attempts

### Error Logging

Errors are logged with:
- Timestamp
- Error message and stack trace
- Request URL and method
- User IP address (if available)

**Configuration:**
```typescript
// Don't expose internal errors in production
const isDevelopment = process.env.NODE_ENV !== 'production';

res.status(500).json({
  error: 'Internal server error',
  message: isDevelopment ? err.message : 'An unexpected error occurred',
  ...(isDevelopment && { stack: err.stack }),
});
```

### Security Monitoring

**Monitor for:**
- Multiple failed login attempts from same IP
- Unusual API request patterns
- Large file uploads
- Database connection errors
- Expired or invalid sessions

**Tools:**
- Application logs
- PostgreSQL logs (`/var/log/postgresql/`)
- System logs (`/var/log/syslog`)
- Monitoring services (e.g., Sentry, LogRocket)

## Security Checklist

### Pre-Deployment

- [ ] Change default admin password
- [ ] Generate strong SESSION_SECRET
- [ ] Configure DATABASE_URL with strong password
- [ ] Enable PostgreSQL SSL connections
- [ ] Set NODE_ENV=production
- [ ] Review and configure CORS_ORIGIN
- [ ] Set up HTTPS/TLS certificates
- [ ] Configure firewall rules
- [ ] Review PostgreSQL pg_hba.conf
- [ ] Test rate limiting
- [ ] Test input validation on all endpoints
- [ ] Review security headers
- [ ] Set up database backups
- [ ] Configure monitoring and logging

### Post-Deployment

- [ ] Verify HTTPS is working
- [ ] Test authentication and authorization
- [ ] Verify rate limiting is active
- [ ] Check security headers (use securityheaders.com)
- [ ] Test file upload restrictions
- [ ] Review audit logs
- [ ] Monitor error logs
- [ ] Test session expiration
- [ ] Verify database backups
- [ ] Document incident response procedures

### Regular Maintenance

- [ ] **Weekly**: Review audit logs for suspicious activity
- [ ] **Weekly**: Check error logs
- [ ] **Monthly**: Update dependencies (`npm audit fix`)
- [ ] **Monthly**: Review and rotate session secrets
- [ ] **Monthly**: Test backup restoration
- [ ] **Quarterly**: Security audit
- [ ] **Quarterly**: Review and update firewall rules
- [ ] **Annually**: Penetration testing
- [ ] **Annually**: Security policy review

## Vulnerability Disclosure

If you discover a security vulnerability, please email: **security@ggpoint.com**

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We take security seriously and will respond within 48 hours.

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Angular Security Guide](https://angular.io/guide/security)

## Updates

This document should be reviewed and updated regularly as new security features are added or vulnerabilities are discovered.

Last updated: 2026-02-06
