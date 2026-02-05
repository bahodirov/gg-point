# Missing Input Validation on Query Parameters

## 🟡 Severity: MEDIUM

## Description
Query parameters lack proper bounds checking and validation, which can lead to denial-of-service, unexpected behavior, or application crashes.

## Affected Files

### 1. Products Routes - Unbounded Limit Parameter
**File:** `src/server/routes/products.routes.ts:25`

```typescript
const limit = parseInt(String(req.query['limit']), 10);
```

**Problem:**
- No maximum limit check
- User can request `?limit=999999999`
- Could load entire database into memory
- Potential DoS vector

### 2. Admin Routes - Unbounded Pagination
**File:** `src/server/routes/admin.routes.ts:89-90`

```typescript
const page = parseInt(String(req.query['page']), 10) || 1;
const perPage = parseInt(String(req.query['perPage']), 10) || 10;
```

**Problem:**
- No bounds checking on page or perPage
- User can request `?perPage=1000000`
- Negative values not handled
- Could cause memory exhaustion

### 3. JSON Parsing - No Error Handling
**File:** `src/server/services/products.service.ts:82-87`

```typescript
images: typeof product.images === 'string'
  ? JSON.parse(product.images)  // No try-catch!
  : product.images,
specs: typeof product.specs === 'string'
  ? JSON.parse(product.specs)   // No try-catch!
  : product.specs
```

**Problem:**
- No error handling for malformed JSON
- Could crash the entire request
- No validation of parsed data structure

### 4. Frontend Product Service - Unsafe Object Manipulation
**File:** `src/app/shared/services/product.service.ts:35-40`

```typescript
Object.entries(specs).forEach(([key, value]) => {  // What if specs is null?
  // ...
});
```

**Problem:**
- No null/undefined check
- Will crash if specs is null
- No validation of key/value types

## Impact
- ⚠️ Potential DoS by requesting huge page sizes
- ⚠️ Application crashes from invalid JSON
- ⚠️ Unexpected behavior from negative values
- ⚠️ Resource exhaustion
- ⚠️ Poor user experience from crashes

## Attack Scenarios

### Scenario 1: Memory Exhaustion
```bash
# Request 1 million products
curl 'https://gg-point.uz/api/products?limit=1000000'

# Server tries to load 1M products into memory
# Server runs out of memory
# Application crashes or becomes unresponsive
```

### Scenario 2: Malformed JSON Crash
```sql
-- Corrupt product JSON in database
UPDATE products SET specs = 'invalid{json}' WHERE id = 1;

-- User requests this product
-- JSON.parse() throws exception
-- Entire request crashes with 500 error
```

## Recommended Fixes

### Fix 1: Add Bounds Checking
```typescript
// src/server/routes/products.routes.ts
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;

const rawLimit = parseInt(String(req.query['limit']), 10);
const limit = Math.min(
  Math.max(rawLimit || DEFAULT_LIMIT, MIN_LIMIT),
  MAX_LIMIT
);
```

### Fix 2: Validate Pagination Parameters
```typescript
// src/server/routes/admin.routes.ts
const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 10;
const MAX_PER_PAGE = 100;

const page = Math.max(
  parseInt(String(req.query['page']), 10) || DEFAULT_PAGE,
  1
);

const perPage = Math.min(
  Math.max(
    parseInt(String(req.query['perPage']), 10) || DEFAULT_PER_PAGE,
    1
  ),
  MAX_PER_PAGE
);
```

### Fix 3: Safe JSON Parsing
```typescript
// src/server/services/products.service.ts
function safeJSONParse<T>(value: any, defaultValue: T): T {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

// Usage
images: safeJSONParse(product.images, []),
specs: safeJSONParse(product.specs, {})
```

### Fix 4: Create Validation Middleware
```typescript
// src/server/middleware/pagination.middleware.ts
export function validatePagination(
  maxLimit = 100,
  defaultLimit = 20
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const limit = Math.min(
      Math.max(parseInt(String(req.query['limit']), 10) || defaultLimit, 1),
      maxLimit
    );

    const page = Math.max(parseInt(String(req.query['page']), 10) || 1, 1);
    const offset = (page - 1) * limit;

    // Attach validated values to request
    req.pagination = { limit, page, offset };

    next();
  };
}

// Usage
router.get('/products', validatePagination(100, 20), async (req, res) => {
  const { limit, offset } = req.pagination;
  // Use validated values
});
```

### Fix 5: Input Validation Schema (Using Joi or Zod)
```typescript
import Joi from 'joi';

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).max(10000).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sort: Joi.string().valid('asc', 'desc').default('desc')
});

export function validateQuery(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: error.details
      });
    }

    req.query = value;
    next();
  };
}

// Usage
router.get('/products', validateQuery(paginationSchema), handler);
```

## Implementation Steps
1. ✅ Add constants for max/min/default values
2. ✅ Implement bounds checking on all numeric parameters
3. ✅ Add try-catch for all JSON.parse() calls
4. ✅ Create validation middleware
5. ✅ Add input sanitization
6. ✅ Test with edge cases (negative, zero, huge numbers)
7. ✅ Add API documentation for valid ranges
8. ✅ Add monitoring for invalid inputs

## Testing Checklist
- [ ] Test with `limit=0` (should use default or minimum)
- [ ] Test with `limit=-10` (should use default or minimum)
- [ ] Test with `limit=999999999` (should be capped at maximum)
- [ ] Test with `limit=abc` (should use default)
- [ ] Test with malformed JSON in database
- [ ] Test with null/undefined specs
- [ ] Verify error responses are user-friendly

## Priority
🟡 **MEDIUM** - Should be fixed to prevent abuse and crashes
