# Critical Security: Default Admin Credentials Hardcoded

## 🔴 Severity: CRITICAL

## Description
Default admin credentials (`admin`/`admin123`) are hardcoded in the database migration script and logged to console. This creates a critical security vulnerability that could allow attackers to gain unauthorized admin access.

## Location
- **File:** `src/server/db/migrate.ts`
- **Lines:** 6-7, 35

## Code
```typescript
const defaultUsername = 'admin';
const defaultPassword = 'admin123';
```

## Impact
- ⚠️ Attackers can gain admin access using well-known default credentials
- ⚠️ Credentials are exposed in logs and source code
- ⚠️ Major security risk in production environments
- ⚠️ Violates security best practices

## Recommended Fix
1. Remove hardcoded credentials from migration script
2. Generate random admin password on first setup
3. Force password change on first login
4. Store credentials securely (environment variables or secure vault)
5. Add warning if default credentials are detected in production
6. Document secure setup process

## Priority
🔴 **CRITICAL** - Fix immediately before production deployment
