# Missing Rate Limiting on API Endpoints

## 🟡 Severity: MEDIUM

## Description
Most API endpoints lack rate limiting, making them vulnerable to abuse, DoS attacks, and excessive resource usage.

## Current State

### Endpoints WITHOUT Rate Limiting
- ❌ `GET /api/products` - Public product listing
- ❌ `GET /api/products/:id` - Product details
- ❌ `GET /api/blog` - Blog listing
- ❌ `GET /api/blog/:slug` - Blog post details
- ❌ `POST /api/admin/login` - Admin login (!!!CRITICAL!!!)
- ❌ `GET /api/admin/products` - Admin product list
- ❌ `PUT /api/admin/products/:id` - Update product
- ❌ `DELETE /api/admin/products/:id` - Delete product
- ❌ Most other admin endpoints

### Endpoints WITH Rate Limiting
- ✅ `POST /api/admin/upload` - Image upload (has rate limiting)

**File:** `src/server/routes/admin.routes.ts:20`
```typescript
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: 'Too many uploads, please try again later'
});
```

## Impact
- ⚠️ Vulnerability to DoS attacks
- ⚠️ API abuse and scraping
- ⚠️ Brute force attacks on login endpoint
- ⚠️ Resource exhaustion
- ⚠️ Increased hosting costs
- ⚠️ Poor performance for legitimate users
- ⚠️ Database overload from excessive queries

## Attack Scenarios

### Scenario 1: Brute Force Login
```bash
# Attacker tries to brute force admin password
for i in {1..10000}; do
  curl -X POST 'https://gg-point.uz/api/admin/login' \
    -d "username=admin&password=attempt_$i"
done

# Without rate limiting, all 10,000 attempts go through
# Could crack weak passwords
```

### Scenario 2: DoS Attack
```bash
# Attacker floods product endpoint
while true; do
  curl 'https://gg-point.uz/api/products?limit=100' &
done

# Thousands of concurrent requests
# Server becomes unresponsive
# Legitimate users can't access site
```

### Scenario 3: Data Scraping
```bash
# Competitor scrapes entire product catalog
for id in {1..100000}; do
  curl "https://gg-point.uz/api/products/$id" >> products.json
done

# No rate limit = easy to scrape all data
```

## Recommended Fix

### 1. Install Rate Limiting Package
```bash
npm install express-rate-limit
```

### 2. Create Rate Limiting Configuration

```typescript
// src/server/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Strict rate limit for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests from counting toward limit
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many login attempts, please try again later',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Standard rate limit for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limit for write operations
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 write operations per 15 minutes
  message: 'Too many write operations, please try again later'
});

// Lenient rate limit for public read endpoints
export const publicLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests, please try again later'
});
```

### 3. Apply Rate Limiting to Routes

```typescript
// src/server/routes/auth.routes.ts
import { authLimiter } from '../middleware/rate-limit.middleware';

router.post('/login', authLimiter, async (req, res) => {
  // Login logic
});
```

```typescript
// src/server/routes/products.routes.ts
import { publicLimiter } from '../middleware/rate-limit.middleware';

router.get('/products', publicLimiter, async (req, res) => {
  // Product listing
});

router.get('/products/:id', publicLimiter, async (req, res) => {
  // Product details
});
```

```typescript
// src/server/routes/admin.routes.ts
import { apiLimiter, writeLimiter } from '../middleware/rate-limit.middleware';

// Read operations - moderate limit
router.get('/admin/products', apiLimiter, async (req, res) => {
  // Get products
});

// Write operations - strict limit
router.post('/admin/products', writeLimiter, async (req, res) => {
  // Create product
});

router.put('/admin/products/:id', writeLimiter, async (req, res) => {
  // Update product
});

router.delete('/admin/products/:id', writeLimiter, async (req, res) => {
  // Delete product
});
```

### 4. Add Redis Store for Distributed Rate Limiting (Optional)

For multi-server deployments:

```bash
npm install rate-limit-redis redis
```

```typescript
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL
});

await redisClient.connect();

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:'
  })
});
```

### 5. Add Monitoring and Logging

```typescript
import rateLimit from 'express-rate-limit';

export const monitoredLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: (req, res) => {
    // Log rate limit violations
    console.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
      timestamp: new Date().toISOString()
    });

    // Could send alert email or notification
    // Could add IP to temporary blocklist

    res.status(429).json({ error: 'Too many requests' });
  },
  onLimitReached: (req, res) => {
    console.info('Rate limit reached:', {
      ip: req.ip,
      path: req.path
    });
  }
});
```

## Recommended Rate Limits by Endpoint Type

| Endpoint Type | Window | Max Requests | Reasoning |
|--------------|--------|--------------|-----------|
| Login/Auth | 15 min | 5 | Prevent brute force |
| Password Reset | 1 hour | 3 | Prevent abuse |
| Public Read (products, blog) | 1 min | 60 | Allow browsing, prevent scraping |
| Admin Read | 15 min | 100 | Normal admin usage |
| Admin Write (create/update/delete) | 15 min | 20 | Prevent mass modifications |
| File Upload | 15 min | 10 | Prevent storage abuse |
| Contact Form | 1 hour | 5 | Prevent spam |
| Search | 1 min | 30 | Prevent abuse |

## Testing

### Test Rate Limiting
```bash
# Test login rate limit
for i in {1..10}; do
  echo "Attempt $i"
  curl -X POST http://localhost:4000/api/admin/login \
    -d "username=test&password=test"
  echo ""
done

# After 5 attempts, should get 429 Too Many Requests
```

### Test Headers
```bash
curl -I http://localhost:4000/api/products

# Should see rate limit headers:
# RateLimit-Limit: 60
# RateLimit-Remaining: 59
# RateLimit-Reset: 1643990400
```

## Implementation Steps
1. ✅ Install express-rate-limit package
2. ✅ Create rate limit middleware configuration
3. ✅ Apply strict rate limiting to auth endpoints
4. ✅ Apply moderate rate limiting to admin endpoints
5. ✅ Apply lenient rate limiting to public endpoints
6. ✅ Add monitoring and logging
7. ✅ Test all rate limits
8. ✅ Document rate limits in API documentation
9. ✅ Consider Redis store for production

## Priority
🟡 **MEDIUM** - Important for security and preventing abuse

**CRITICAL for login endpoint** - should be implemented ASAP
