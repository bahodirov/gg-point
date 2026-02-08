# API Patterns & Conventions

## Overview

All API communication follows a standardized request/response pattern with consistent error handling. The backend uses Express.js with PostgreSQL, and the frontend consumes APIs through Angular's HttpClient.

---

## Standard Response Format

### Success Response

All successful API calls return a response object with this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;        // Always true for success
  data: T | T[];          // Single object or array of objects
  total?: number;         // For paginated responses - total records
  page?: number;          // For paginated responses - current page (1-indexed)
  pageSize?: number;      // For paginated responses - records per page
  message?: string;       // Optional success message
}
```

**Success HTTP Status Codes**:
- `200 OK`: Successful GET, PUT, or DELETE
- `201 CREATED`: Successful POST (new resource created)

**Example Success Response**:
```json
{
  "success": true,
  "data": {
    "id": "prod-123",
    "name": { "ru": "Мышь", "uz": "Sichqoncha" },
    "price": 50000,
    "inStock": true,
    "createdAt": "2025-02-08T10:30:00Z"
  },
  "message": "Product created successfully"
}
```

### Paginated Response Example

```json
{
  "success": true,
  "data": [
    { "id": "1", "name": { "ru": "Товар 1", "uz": "Tovar 1" } },
    { "id": "2", "name": { "ru": "Товар 2", "uz": "Tovar 2" } },
    { "id": "3", "name": { "ru": "Товар 3", "uz": "Tovar 3" } }
  ],
  "total": 150,      // Total records in database
  "page": 1,         // Current page
  "pageSize": 3,     // Records per page
  "message": "3 products retrieved"
}
```

---

## Error Response Format

### Error Response Structure

```typescript
interface ApiError {
  success: boolean;      // Always false for errors
  error: string;         // User-friendly error message
  code: string;          // Machine-readable error code
  details?: any;         // Optional detailed error information
  timestamp?: string;    // ISO 8601 timestamp
}
```

**Error HTTP Status Codes**:
- `400 BAD REQUEST`: Invalid input, validation errors
- `401 UNAUTHORIZED`: Authentication required (not logged in)
- `403 FORBIDDEN`: Authenticated but not authorized for this action
- `404 NOT FOUND`: Resource not found
- `409 CONFLICT`: Data conflict (e.g., duplicate entry)
- `422 UNPROCESSABLE ENTITY`: Validation failure
- `500 INTERNAL SERVER ERROR`: Server error
- `503 SERVICE UNAVAILABLE`: Server maintenance or overload

**Example Error Response**:
```json
{
  "success": false,
  "error": "Продукт не найден",
  "code": "PRODUCT_NOT_FOUND",
  "details": {
    "productId": "prod-invalid"
  }
}
```

**Validation Error Response** (400):
```json
{
  "success": false,
  "error": "Ошибка валидации",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "name_ru",
        "message": "Название на русском языке обязательно"
      },
      {
        "field": "price",
        "message": "Цена должна быть положительным числом"
      }
    ]
  }
}
```

---

## API Endpoint Patterns

### RESTful Conventions

All endpoints follow REST conventions with standard HTTP methods:

```
GET     /api/[resource]              # List all (with pagination)
GET     /api/[resource]/:id          # Get single resource
POST    /api/[resource]              # Create new resource
PUT     /api/[resource]/:id          # Update full resource
PATCH   /api/[resource]/:id          # Partial update
DELETE  /api/[resource]/:id          # Delete resource
```

### Query Parameters for Lists

**Pagination**:
```
GET /api/products?page=1&pageSize=10
```

**Filtering**:
```
GET /api/products?category=mice&inStock=true
```

**Sorting**:
```
GET /api/products?sortBy=createdAt&order=desc
```

**Combined**:
```
GET /api/products?page=1&pageSize=20&category=keyboards&sortBy=price&order=asc&search=gaming
```

**Query Parameter Types**:
```typescript
interface ListQueryParams {
  page?: number;         // Pagination: 1-indexed
  pageSize?: number;     // Pagination: records per page (default: 10)
  search?: string;       // Full-text search
  sortBy?: string;       // Field to sort by
  order?: 'asc' | 'desc'; // Sort direction
  // Resource-specific filters
  category?: string;
  inStock?: boolean;
  featured?: boolean;
  // Date range
  startDate?: string;    // ISO 8601 format
  endDate?: string;      // ISO 8601 format
}
```

---

## Authentication & Session

### Session-Based Authentication

All API requests use HTTP-only session cookies. The authentication flow:

1. User logs in: `POST /api/auth/login`
2. Server sets `connect.sid` cookie (HTTP-only, Secure, SameSite)
3. Client automatically includes cookie in all requests
4. Server validates session on each request

### Required Headers

```typescript
// All requests automatically include:
{
  'Content-Type': 'application/json',
  'Cookie': 'connect.sid=...' // Automatic (httpOnly cookie)
}
```

### Authentication Endpoints

**Login**:
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "secure_password"
}

Response (200):
{
  "success": true,
  "user": {
    "id": "user-1",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**Check Session**:
```
GET /api/auth/session

Response (200):
{
  "authenticated": true,
  "user": {
    "id": "user-1",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}

// If not authenticated:
Response (401):
{
  "authenticated": false
}
```

**Logout**:
```
POST /api/auth/logout

Response (200):
{
  "success": true
}
```

**Change Password**:
```
POST /api/auth/change-password
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}

Response (200):
{
  "success": true,
  "message": "Пароль успешно изменен"
}
```

---

## Resource-Specific Endpoints

### Products API

**List Products**:
```
GET /api/products?page=1&pageSize=20&sortBy=createdAt&order=desc

Response (200):
{
  "success": true,
  "data": [...],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

**Get Single Product**:
```
GET /api/products/prod-123

Response (200):
{
  "success": true,
  "data": {
    "id": "prod-123",
    "slug": "gaming-mouse",
    "name": { "ru": "Игровая мышь", "uz": "O'yin sichqonchasi" },
    "category": "mice",
    "price": 50000,
    "oldPrice": 65000,
    "description": { "ru": "...", "uz": "..." },
    "specs": {
      "sensor": "HERO 25K",
      "dpi": "100-25600",
      "weight": "59g"
    },
    "images": ["https://...", "https://..."],
    "inStock": true,
    "featured": false,
    "isNew": true,
    "relatedProducts": ["prod-124", "prod-125"],
    "createdAt": "2025-02-01T10:30:00Z"
  }
}
```

**Create Product**:
```
POST /api/products
Content-Type: application/json

{
  "slug": "new-keyboard",
  "name_ru": "Новая клавиатура",
  "name_uz": "Yangi klaviatura",
  "description_ru": "Описание на русском",
  "description_uz": "Tavsif o'zbek tilida",
  "price": 100000,
  "old_price": 120000,
  "category": "keyboards",
  "images": ["https://...", "https://..."],
  "specs": {
    "switch_type": "Mechanical",
    "layout": "Full Size",
    "backlight": "RGB"
  },
  "in_stock": true,
  "featured": false,
  "is_new": true,
  "related_products": []
}

Response (201):
{
  "success": true,
  "data": { /* created product */ },
  "message": "Продукт успешно создан"
}
```

**Update Product**:
```
PUT /api/products/prod-123
Content-Type: application/json

{
  "slug": "updated-slug",
  "name_ru": "Обновленное название",
  /* all fields required */
}

Response (200):
{
  "success": true,
  "data": { /* updated product */ },
  "message": "Продукт успешно обновлен"
}
```

**Delete Product**:
```
DELETE /api/products/prod-123

Response (200):
{
  "success": true,
  "message": "Продукт успешно удален"
}
```

### File Upload API

**Upload Image**:
```
POST /api/admin/upload-image
Content-Type: multipart/form-data

FormData:
  - image: File (image/*) [required, max 5MB]

Response (200):
{
  "success": true,
  "image": {
    "url": "https://cdn.example.com/uploads/img-123.webp",
    "filename": "img-123.webp",
    "size": 245000,
    "width": 1920,
    "height": 1080
  }
}
```

---

## Error Handling Examples

### Validation Error (400)

```json
{
  "success": false,
  "error": "Ошибка валидации входных данных",
  "code": "VALIDATION_ERROR",
  "details": {
    "errors": [
      {
        "field": "price",
        "message": "Цена должна быть числом больше 0"
      },
      {
        "field": "name_ru",
        "message": "Поле обязательно для заполнения"
      }
    ]
  }
}
```

### Not Found (404)

```json
{
  "success": false,
  "error": "Продукт не найден",
  "code": "PRODUCT_NOT_FOUND",
  "details": {
    "productId": "prod-nonexistent"
  }
}
```

### Unauthorized (401)

```json
{
  "success": false,
  "error": "Требуется аутентификация",
  "code": "UNAUTHORIZED"
}
```

### Forbidden (403)

```json
{
  "success": false,
  "error": "У вас нет прав доступа к этому ресурсу",
  "code": "FORBIDDEN",
  "details": {
    "requiredRole": "admin",
    "userRole": "moderator"
  }
}
```

### Server Error (500)

```json
{
  "success": false,
  "error": "Внутренняя ошибка сервера",
  "code": "INTERNAL_SERVER_ERROR",
  "details": {
    "requestId": "req-12345",
    "timestamp": "2025-02-08T10:30:00Z"
  }
}
```

---

## Rate Limiting

### Rate Limit Headers

All API responses include rate limit information:

```
X-RateLimit-Limit: 1000        # Requests allowed per window
X-RateLimit-Remaining: 999     # Requests remaining
X-RateLimit-Reset: 1649920800  # Unix timestamp when limit resets
```

### Rate Limit Policies

- **Login endpoint**: 5 requests per 15 minutes per IP
- **General endpoints**: 1000 requests per hour per user
- **File upload**: 100 MB per hour per user

---

## Pagination Best Practices

### Default Pagination

```typescript
interface PaginationDefaults {
  page: 1;           // First page
  pageSize: 10;      // Records per page
  maxPageSize: 100;  // Server won't return more than 100
}
```

### Frontend Implementation

```typescript
// Example: Get page 3 with 20 items per page
this.http.get('/api/products', {
  params: {
    page: 3,
    pageSize: 20,
    sortBy: 'createdAt',
    order: 'desc'
  }
}).subscribe(response => {
  this.items = response.data;
  this.totalItems = response.total;
  this.currentPage = response.page;
});
```

---

## Caching Strategy

### Cache Headers

```
Cache-Control: no-cache           # Always revalidate
Cache-Control: public, max-age=300 # 5-minute cache
Cache-Control: private            # User-specific (no proxy cache)
```

### API Caching Guidelines

- **Products list**: 5-minute cache (public)
- **Product details**: No cache (might be updated)
- **User data**: No cache (user-specific)
- **Images**: 1-year cache (versioned URLs)

---

## CORS Configuration

All API endpoints accept requests from:
- `http://localhost:4200` (development)
- `https://ggpoint.com` (production)
- `https://*.ggpoint.com` (subdomains)

Cross-origin requests include:
- `credentials: 'include'` (for session cookies)
- Custom headers (as needed)

---

## API Documentation Reference

For more details:
- **Express Server Setup**: Backend documentation
- **PostgreSQL Schema**: [database-schema.md](./database-schema.md)
- **Service Implementation**: [examples/service.example.ts](./examples/service.example.ts)

---

*Last updated: 2025-02-08*
*Maintained by: Development Team*
