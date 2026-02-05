# High Priority: CSP Configuration Allows Unsafe-Inline and Unsafe-Eval

## 🟠 Severity: HIGH

## Description
Content Security Policy (CSP) configuration allows `'unsafe-inline'` and `'unsafe-eval'`, which defeats the purpose of CSP and creates XSS vulnerabilities.

## Location
- **File:** `src/server/middleware/security.middleware.ts`
- **Lines:** 15-19

## Code
```typescript
"script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
"style-src": ["'self'", "'unsafe-inline'"],
```

## Impact
- ⚠️ XSS attacks can execute arbitrary JavaScript
- ⚠️ CSP protection is effectively disabled
- ⚠️ Users are vulnerable to script injection attacks
- ⚠️ Defeats the security benefit of CSP

## Recommended Fix
1. Remove `'unsafe-inline'` and `'unsafe-eval'` from CSP
2. Use nonce-based or hash-based inline scripts
3. Move all inline scripts to external files
4. Implement proper CSP with strict directives
5. Use Angular's built-in sanitization

## Example Fix
```typescript
// Generate nonce for each request
const nonce = crypto.randomBytes(16).toString('base64');

// Make the nonce available to your rendering layer (for example, via locals)
// so it can be added to <script> / <style> tags:
res.locals.cspNonce = nonce;

// Configure CSP to allow only scripts/styles with this nonce.
// NOTE: This is a simplified illustration. For Angular SSR you must also
// modify the server-side rendering pipeline to inject this nonce into the
// rendered <script> (and optionally <style>) tags. The exact integration
// depends on your SSR setup and is not shown here.

"script-src": ["'self'", `'nonce-${nonce}'`],
"style-src": ["'self'", `'nonce-${nonce}'`],
```

## Priority
🟠 **HIGH** - Fix to prevent XSS vulnerabilities
