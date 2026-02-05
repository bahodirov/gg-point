# High Priority: Hardcoded Configuration Values Throughout Codebase

## 🟠 Severity: HIGH

## Description
Multiple configuration values are hardcoded instead of being configurable through environment variables, making deployment, testing, and environment management difficult.

## Affected Files
1. **`src/server/middleware/security.middleware.ts`** (lines 20, 90)
   - Hardcoded localhost origins in CSP/CORS: `http://localhost:4200`, `http://localhost:4000`

2. **`src/app/shared/services/seo.service.ts`** (lines 36, 47, 171, 193, 194, 208, 219, 221, 262, 279, 280, 285, 300, 321)
   - Hardcoded domain URLs: `https://gg-point.uz`
   - Hardcoded phone number: `+998-XX-XXX-XXXX`

3. **`src/app/pages/contact/contact.component.ts`** (lines 130-162)
   - Hardcoded contact information (phone, email, address, hours)

4. **`src/server.ts`** (line 138)
   - Hardcoded localhost in startup messages

5. **`src/server/db/pool.ts`** (line 61)
   - Hardcoded default database host: `localhost`

## Impact
- 🔴 Difficult to deploy to different environments (dev/staging/prod)
- 🔴 Testing is complicated and error-prone
- 🔴 Configuration changes require code changes and redeployment
- 🔴 Production/development parity issues
- 🔴 Cannot easily switch between environments

## Recommended Fix

### 1. Create Environment Configuration
```typescript
// src/config/environment.ts
export const config = {
  domain: process.env.DOMAIN || 'http://localhost:4200',
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  production: process.env.NODE_ENV === 'production',
  contact: {
    phone: process.env.CONTACT_PHONE,
    email: process.env.CONTACT_EMAIL,
    address: process.env.CONTACT_ADDRESS
  }
};
```

### 2. Use Environment Variables
- Create `.env.development`, `.env.production` files
- Document all required environment variables in README
- Use `dotenv` package to load environment variables
- Validate required environment variables on startup

### 3. Update Angular Environment Files
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000',
  domain: 'http://localhost:4200'
};
```

## Priority
🟠 **HIGH** - Required for proper deployment and testing
