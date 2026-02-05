# GitHub Issues to Create

Based on comprehensive code analysis, here are the critical issues that need to be tracked:

---

## 🔴 CRITICAL ISSUES

### Issue 1: Default Admin Credentials Hardcoded in Database Migration

**Severity:** CRITICAL

**Description:**
Default admin credentials (`admin`/`admin123`) are hardcoded in the database migration script and logged to console. This creates a critical security vulnerability.

**Location:**
- File: `src/server/db/migrate.ts`
- Lines: 6-7, 35

**Details:**
```typescript
const defaultUsername = 'admin';
const defaultPassword = 'admin123';
```

**Impact:**
- Attackers can gain admin access using well-known default credentials
- Credentials are exposed in logs and source code
- Major security risk in production environments

**Recommended Fix:**
1. Remove hardcoded credentials from migration script
2. Generate random admin password on first setup
3. Force password change on first login
4. Store credentials securely (environment variables or secure vault)
5. Add warning if default credentials are detected in production

---

### Issue 2: SSL Certificate Verification Disabled in Production

**Severity:** CRITICAL

**Description:**
SSL certificate verification is disabled in the database connection pool configuration, creating a man-in-the-middle (MITM) attack vulnerability.

**Location:**
- File: `src/server/db/pool.ts`
- Lines: 30-33, 54-57

**Details:**
The code logs warnings about SSL verification being disabled but doesn't enforce it:
```
WARNING: SSL is configured with rejectUnauthorized: false
This is insecure and should only be used in development
```

**Impact:**
- Database connections are vulnerable to MITM attacks
- Encrypted traffic can be intercepted and modified
- Production data can be compromised
- Violates security best practices

**Recommended Fix:**
1. Enable SSL certificate verification in production (`rejectUnauthorized: true`)
2. Use proper CA certificates for production databases
3. Only allow `rejectUnauthorized: false` in development environment
4. Fail startup if insecure SSL configuration detected in production

---

### Issue 3: CSP Configuration Allows Unsafe-Inline and Unsafe-Eval

**Severity:** HIGH

**Description:**
Content Security Policy (CSP) configuration allows 'unsafe-inline' and 'unsafe-eval', which defeats the purpose of CSP and creates XSS vulnerabilities.

**Location:**
- File: `src/server/middleware/security.middleware.ts`
- Lines: 15-19

**Details:**
```typescript
"script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
"style-src": ["'self'", "'unsafe-inline'"],
```

**Impact:**
- XSS attacks can execute arbitrary JavaScript
- CSP protection is effectively disabled
- Users are vulnerable to script injection attacks

**Recommended Fix:**
1. Remove 'unsafe-inline' and 'unsafe-eval' from CSP
2. Use nonce-based or hash-based inline scripts
3. Move all inline scripts to external files
4. Implement proper CSP with strict directives

---

## 🟠 HIGH PRIORITY ISSUES

### Issue 4: Hardcoded Configuration Values Throughout Codebase

**Severity:** HIGH

**Description:**
Multiple configuration values are hardcoded instead of being configurable through environment variables, making deployment and testing difficult.

**Affected Files:**
- `src/server/middleware/security.middleware.ts` (localhost origins in CSP/CORS)
- `src/app/shared/services/seo.service.ts` (domain URLs: `https://gg-point.uz`)
- `src/app/pages/contact/contact.component.ts` (contact information)
- `src/server.ts` (localhost in startup messages)
- `src/server/db/pool.ts` (default database host)

**Impact:**
- Difficult to deploy to different environments
- Testing is complicated
- Configuration changes require code changes
- Production/development parity issues

**Recommended Fix:**
1. Move all configuration to environment variables
2. Create a configuration service/module
3. Use .env files for different environments
4. Document all required environment variables

**Examples:**
```
Lines 20, 90 in security.middleware.ts: http://localhost:4200, http://localhost:4000
Lines 36, 47, 171+ in seo.service.ts: https://gg-point.uz
Lines 130-162 in contact.component.ts: phone, email, address, hours
```

---

### Issue 5: Console.log Statements in Production Code

**Severity:** MEDIUM

**Description:**
Over 50 console.log statements throughout the codebase that should be removed or replaced with proper logging.

**Affected Files (partial list):**
- `src/server.ts` (lines 36, 83, 138)
- `src/server/middleware/auth.middleware.ts` (lines 23, 31, 37)
- `src/server/routes/admin.routes.ts` (lines 28, 78, 106, 127, 164)
- `src/server/db/database.ts` (lines 72, 76, 81, 90, 613, 615)
- `src/server/db/pool.ts` (lines 9-10, 31-33, 55-57, 93, 99, 116, 131, 134)
- `src/app/admin/components/admin-layout/admin-layout.component.ts` (line 311)
- `src/app/admin/components/product-form/product-form.component.ts` (lines 638, 660)
- And many more...

**Impact:**
- Performance degradation
- Information leakage in production
- Console pollution
- Unprofessional production environment

**Recommended Fix:**
1. Replace console.log with proper logging library (winston, pino)
2. Remove debug console.log statements
3. Implement log levels (debug, info, warn, error)
4. Configure logging per environment

---

### Issue 6: Missing Error Handling in Subscriptions

**Severity:** HIGH

**Description:**
Multiple RxJS subscriptions lack error handlers, which can lead to unhandled exceptions and poor user experience.

**Affected Files:**
- `src/app/auth/services/auth.service.ts:88` - checkSession() missing error handler
- `src/app/pages/blog/blog-post.component.ts:211` - route params subscription
- `src/app/pages/catalog/product-detail.component.ts:235` - route params subscription
- `src/app/pages/catalog/catalog-list.component.ts:176` - query params subscription
- `src/app/admin/components/admin-layout/admin-layout.component.ts:306-318, 326`
- `src/app/admin/components/dashboard/dashboard.component.ts:359`
- `src/app/admin/components/product-list/product-list.component.ts:438, 497`
- `src/app/admin/components/change-password/change-password.component.ts:273`

**Impact:**
- Unhandled promise rejections
- Application crashes
- Poor error messages to users
- Difficult debugging

**Recommended Fix:**
1. Add error handlers to all subscriptions
2. Implement proper error logging
3. Show user-friendly error messages
4. Use catchError operator where appropriate

---

### Issue 7: Memory Leaks from setInterval/setTimeout Without Cleanup

**Severity:** HIGH

**Description:**
Multiple components use setInterval and setTimeout without proper cleanup in ngOnDestroy, causing memory leaks.

**Affected Files:**
- `src/app/admin/components/admin-layout/admin-layout.component.ts:302` - setInterval for health check runs indefinitely
- `src/app/pages/contact/contact.component.ts:215-224` - setTimeout without cleanup
- `src/app/admin/components/change-password/change-password.component.ts:280` - setTimeout without cleanup

**Impact:**
- Memory leaks in long-running sessions
- Performance degradation over time
- Increased resource usage
- Application slowdown

**Recommended Fix:**
1. Store timer IDs and clear them in ngOnDestroy
2. Use takeUntilDestroyed() for RxJS-based timing
3. Implement proper component cleanup
4. Add unit tests for cleanup

**Example Fix:**
```typescript
private healthCheckInterval?: number;

ngOnInit() {
  this.healthCheckInterval = setInterval(() => {
    // health check logic
  }, 30000);
}

ngOnDestroy() {
  if (this.healthCheckInterval) {
    clearInterval(this.healthCheckInterval);
  }
}
```

---

### Issue 8: Contact Form is Non-Functional (Simulated)

**Severity:** HIGH

**Description:**
The contact form doesn't actually send messages - it just shows a fake success message using setTimeout.

**Location:**
- File: `src/app/pages/contact/contact.component.ts`
- Lines: 208-226

**Details:**
```typescript
this.submitting = true;
setTimeout(() => {
  this.submitting = false;
  this.showSuccessMessage = true;
  this.contactForm.reset();
  // ... more fake logic
}, 1500);
```

**Impact:**
- Users think their messages are sent but they're not
- Lost customer inquiries
- Poor user experience
- Misleading functionality

**Recommended Fix:**
1. Implement actual backend API for contact form
2. Send emails using email service (SendGrid, Mailgun, etc.)
3. Store contact submissions in database
4. Add proper error handling for failed submissions
5. Add email notification to admin

---

## 🟠 MEDIUM PRIORITY ISSUES

### Issue 9: Performance Issues with Full Table Scans

**Severity:** MEDIUM

**Description:**
Several database queries perform full table scans and in-memory filtering instead of using proper database queries.

**Affected Files:**
- `src/server/services/image.service.ts:249-289` - LIKE query on JSONB cast to text (documented as slow)
- `src/server/db/database.ts:129-135` - find() loads all users into memory
- `src/server/db/database.ts:204-205` - find() loads all products into memory

**Impact:**
- Slow response times with large datasets
- High memory usage
- Database performance degradation
- Scalability issues

**Recommended Fix:**
1. Use proper database indexes
2. Implement database-level filtering
3. Use proper SQL WHERE clauses
4. Add pagination to prevent loading entire tables
5. Consider using database views or materialized views

---

### Issue 10: Missing Input Validation on Query Parameters

**Severity:** MEDIUM

**Description:**
Query parameters lack proper bounds checking and validation, which can lead to denial-of-service or unexpected behavior.

**Affected Files:**
- `src/server/routes/products.routes.ts:25` - parseInt without bounds checking on limit
- `src/server/routes/admin.routes.ts:89-90` - No bounds checking on page and perPage
- `src/server/services/products.service.ts:82-87` - No error handling for JSON.parse()

**Impact:**
- Potential DoS by requesting huge page sizes
- Application crashes from invalid JSON
- Unexpected behavior from negative values
- Resource exhaustion

**Recommended Fix:**
1. Add bounds checking (max limit of 100, max perPage of 50, etc.)
2. Validate all query parameters
3. Add error handling for JSON.parse()
4. Implement input sanitization
5. Add rate limiting

**Example Fix:**
```typescript
const limit = Math.min(Math.max(parseInt(req.query['limit'], 10) || 20, 1), 100);
const page = Math.max(parseInt(req.query['page'], 10) || 1, 1);
```

---

### Issue 11: TypeScript Type Safety Issues (Unsafe `any` Types)

**Severity:** MEDIUM

**Description:**
Multiple uses of `any` type throughout the codebase, reducing type safety and increasing risk of runtime errors.

**Affected Files:**
- `src/server/db/database.ts:73, 163, 252, 376`
- `src/server/middleware/validation.middleware.ts:201, 215, 233`
- `src/app/shared/services/product.service.ts:24, 33`
- `src/app/shared/services/seo.service.ts:130, 158, 188, 213, 275, 292, 305, 329`
- `src/app/core/config/translate.config.ts:9`
- `src/app/pages/blog/blog-list.component.ts:117`
- `src/app/admin/components/dashboard/dashboard.component.ts:359`

**Impact:**
- Loss of type safety
- Runtime type errors
- Harder to refactor
- Poor IDE support
- Difficult debugging

**Recommended Fix:**
1. Define proper interfaces for all data structures
2. Replace `any` with specific types
3. Use generics where appropriate
4. Enable strict TypeScript mode
5. Add type guards for runtime type checking

---

### Issue 12: Missing Rate Limiting on API Endpoints

**Severity:** MEDIUM

**Description:**
Most API endpoints lack rate limiting, making them vulnerable to abuse and DoS attacks.

**Affected Files:**
- `src/server/routes/products.routes.ts` - All public GET endpoints
- `src/server/routes/admin.routes.ts` - Most admin endpoints (only image upload has rate limiting)

**Impact:**
- Vulnerability to DoS attacks
- API abuse
- Resource exhaustion
- Increased hosting costs
- Poor performance for legitimate users

**Recommended Fix:**
1. Implement rate limiting middleware (express-rate-limit)
2. Different limits for public vs authenticated endpoints
3. Different limits for read vs write operations
4. IP-based rate limiting
5. Monitor and log rate limit violations

**Example:**
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

router.get('/products', apiLimiter, productController.getProducts);
```

---

## 🔵 LOW PRIORITY / MAINTENANCE ISSUES

### Issue 13: TODO Comment - Missing OG Image File

**Location:** `public/assets/images/README.md:118`

**Description:**
TODO comment indicates missing og-image.png file for social media sharing.

**Recommended Fix:**
Create og-image.png file with proper branding and dimensions (1200x630px recommended).

---

### Issue 14: Mixed Language Comments (Uzbek in Code)

**Affected Files:**
- `src/app/admin/components/admin-layout/admin-layout.component.ts:48, 216-263, 301`
- `src/server/db/database.ts:80`

**Description:**
Some comments and error messages are in Uzbek, making it harder for international developers to understand the code.

**Recommended Fix:**
1. Translate all code comments to English
2. Keep user-facing messages in Uzbek (use i18n for UI)
3. Use English for technical error messages
4. Document code in English

---

## Summary Statistics

- **Total Issues Found:** 14
- **Critical Issues:** 2
- **High Priority:** 5
- **Medium Priority:** 5
- **Low Priority:** 2

## Recommended Implementation Order

1. **Critical Security Issues** (Issues #1, #2, #3) - Fix immediately
2. **Hardcoded Configuration** (Issue #4) - Enables proper deployment
3. **Contact Form** (Issue #8) - Affects user experience directly
4. **Error Handling** (Issue #6) - Improves stability
5. **Memory Leaks** (Issue #7) - Improves long-term stability
6. **Performance** (Issue #9) - Improves scalability
7. **Input Validation** (Issue #10) - Improves security
8. **Rate Limiting** (Issue #12) - Prevents abuse
9. **Type Safety** (Issue #11) - Improves code quality
10. **Console.log** (Issue #5) - Code cleanup
11. **Low Priority** (Issues #13, #14) - Polish

---

**Note:** This analysis was performed on 2026-02-05. Some issues may have been addressed since then.
