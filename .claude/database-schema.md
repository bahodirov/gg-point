# Database Schema & Data Models

## Overview

The GGPoint database uses PostgreSQL 12+ with a relational schema optimized for e-commerce operations. This document describes the key tables, relationships, and data types.

---

## Core Tables

### `users`

Stores user account information and authentication data.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| `email` | VARCHAR(255) | UNIQUE, NULLABLE | User email address |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'user' | 'admin', 'moderator', or 'user' |
| `must_change_password` | BOOLEAN | DEFAULT false | Forced password change flag |
| `is_active` | BOOLEAN | DEFAULT true | Account status |
| `last_login_at` | TIMESTAMP | NULLABLE | Last login timestamp |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "admin",
  "email": "admin@ggpoint.com",
  "role": "admin",
  "must_change_password": false,
  "is_active": true,
  "created_at": "2025-01-01T10:00:00Z"
}
```

---

### `products`

Main product table with multilingual support.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PRIMARY KEY | Unique product identifier |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly identifier |
| `name` | JSONB | NOT NULL | `{ "ru": "...", "uz": "..." }` |
| `description` | JSONB | NULLABLE | `{ "ru": "...", "uz": "..." }` |
| `category` | VARCHAR(100) | NOT NULL | Product category |
| `price` | DECIMAL(12,2) | NOT NULL | Current price in primary currency |
| `old_price` | DECIMAL(12,2) | NULLABLE | Original/discount price |
| `currency` | VARCHAR(3) | DEFAULT 'UZS' | ISO 4217 currency code |
| `images` | TEXT[] | NULLABLE | Array of image URLs |
| `thumbnail` | VARCHAR(500) | NULLABLE | Thumbnail image URL |
| `specs` | JSONB | NULLABLE | `{ "key": "value", ... }` |
| `in_stock` | BOOLEAN | DEFAULT true | Inventory status |
| `featured` | BOOLEAN | DEFAULT false | Featured product flag |
| `is_new` | BOOLEAN | DEFAULT false | New product flag |
| `tags` | TEXT[] | NULLABLE | Product tags for search |
| `related_products` | UUID[] | NULLABLE | Related product IDs |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |
| `created_by` | UUID | NULLABLE, FK | User who created product |

**Indexes**:
```sql
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_in_stock ON products(in_stock);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_name_gin ON products USING GIN(name);
```

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "slug": "gaming-mouse-pro",
  "name": {
    "ru": "Игровая мышь Pro",
    "uz": "O'yin sichqonchasi Pro"
  },
  "description": {
    "ru": "Профессиональная игровая мышь...",
    "uz": "Professional o'yin sichqonchasi..."
  },
  "category": "mice",
  "price": 50000,
  "old_price": 65000,
  "currency": "UZS",
  "specs": {
    "sensor": "HERO 25K",
    "dpi": "100-25600",
    "weight": "59g"
  },
  "images": ["https://cdn.../img1.webp", "https://cdn.../img2.webp"],
  "in_stock": true,
  "featured": true,
  "is_new": false,
  "tags": ["gaming", "professional", "rgb"],
  "created_at": "2025-02-01T10:30:00Z"
}
```

---

### `categories`

Product categories with hierarchy support.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PRIMARY KEY | Category identifier |
| `name` | JSONB | NOT NULL | `{ "ru": "...", "uz": "..." }` |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | URL-friendly slug |
| `description` | JSONB | NULLABLE | Category description |
| `icon` | VARCHAR(500) | NULLABLE | Icon URL or Material icon name |
| `parent_id` | UUID | NULLABLE, FK | Parent category for hierarchy |
| `sort_order` | INTEGER | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

**Indexes**:
```sql
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
```

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "name": {
    "ru": "Компьютерные мыши",
    "uz": "Kompyuter sichqonchalari"
  },
  "slug": "mice",
  "icon": "mouse",
  "sort_order": 1,
  "is_active": true
}
```

---

### `orders`

Customer orders and transactions.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PRIMARY KEY | Order identifier |
| `order_number` | VARCHAR(20) | UNIQUE, NOT NULL | Human-readable order number |
| `user_id` | UUID | NULLABLE, FK | Customer user ID |
| `customer_name` | VARCHAR(255) | NOT NULL | Customer full name |
| `customer_email` | VARCHAR(255) | NOT NULL | Customer email |
| `customer_phone` | VARCHAR(20) | NULLABLE | Customer phone number |
| `shipping_address` | JSONB | NOT NULL | `{ "street", "city", "country", ... }` |
| `items` | JSONB | NOT NULL | `[{ "productId", "quantity", "price" }]` |
| `subtotal` | DECIMAL(12,2) | NOT NULL | Items total |
| `tax_amount` | DECIMAL(12,2) | DEFAULT 0 | Tax calculation |
| `shipping_cost` | DECIMAL(12,2) | DEFAULT 0 | Shipping fee |
| `total_amount` | DECIMAL(12,2) | NOT NULL | Final total |
| `currency` | VARCHAR(3) | DEFAULT 'UZS' | Order currency |
| `status` | VARCHAR(20) | DEFAULT 'pending' | 'pending', 'paid', 'shipped', 'delivered', 'cancelled' |
| `payment_method` | VARCHAR(50) | NULLABLE | 'card', 'kaspi', 'transfer', etc. |
| `payment_status` | VARCHAR(20) | DEFAULT 'pending' | 'pending', 'paid', 'failed', 'refunded' |
| `tracking_number` | VARCHAR(100) | NULLABLE | Shipping tracking number |
| `notes` | TEXT | NULLABLE | Order notes |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Order creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
```sql
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

**Example Data**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440020",
  "order_number": "ORD-2025-0001",
  "customer_name": "Abdulla Karimov",
  "customer_email": "abdulla@example.com",
  "customer_phone": "+998901234567",
  "shipping_address": {
    "street": "Amir Temur ko'chasi, 100",
    "city": "Tashkent",
    "state": "Tashkent",
    "country": "Uzbekistan",
    "postal_code": "100000"
  },
  "items": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 2,
      "price": 50000,
      "name": { "ru": "Игровая мышь Pro" }
    }
  ],
  "subtotal": 100000,
  "tax_amount": 15000,
  "total_amount": 115000,
  "status": "shipped",
  "payment_status": "paid",
  "created_at": "2025-02-05T14:30:00Z"
}
```

---

### `inventory`

Track product stock levels and movements.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PRIMARY KEY | Inventory record ID |
| `product_id` | UUID | NOT NULL, FK | Product reference |
| `quantity` | INTEGER | NOT NULL | Current stock quantity |
| `reserved` | INTEGER | DEFAULT 0 | Reserved for pending orders |
| `available` | INTEGER | GENERATED | `quantity - reserved` |
| `warehouse` | VARCHAR(100) | DEFAULT 'main' | Warehouse location |
| `last_restock` | TIMESTAMP | NULLABLE | Last stock addition date |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes**:
```sql
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse);
```

---

### `audit_logs`

Track administrative actions for security and compliance.

| Column | Type | Constraints | Notes |
|--------|------|-----------|-------|
| `id` | UUID | PRIMARY KEY | Log record ID |
| `user_id` | UUID | NULLABLE, FK | Admin user who performed action |
| `action` | VARCHAR(100) | NOT NULL | 'create', 'update', 'delete', 'login', etc. |
| `resource_type` | VARCHAR(50) | NOT NULL | 'product', 'user', 'order', etc. |
| `resource_id` | UUID | NULLABLE | ID of affected resource |
| `details` | JSONB | NULLABLE | Change details/before-after |
| `ip_address` | VARCHAR(45) | NULLABLE | Client IP address |
| `user_agent` | TEXT | NULLABLE | Browser user agent |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Action timestamp |

**Indexes**:
```sql
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

---

## Data Type Mappings

### PostgreSQL → TypeScript

| PostgreSQL | TypeScript | Notes |
|-----------|-----------|-------|
| `UUID` | `string` | v4 format |
| `VARCHAR(n)` | `string` | Limited length |
| `TEXT` | `string` | Unlimited length |
| `INTEGER` | `number` | Whole numbers |
| `DECIMAL(12,2)` | `number` | Monetary values |
| `BOOLEAN` | `boolean` | true/false |
| `TIMESTAMP` | `Date` or `string` | ISO 8601 format |
| `JSONB` | `Record<string, any>` | JSON objects |
| `TEXT[]` | `string[]` | Array of strings |
| `UUID[]` | `string[]` | Array of UUIDs |

---

## Relationships & Foreign Keys

```sql
-- Products to Categories
ALTER TABLE products
ADD CONSTRAINT fk_products_category
FOREIGN KEY (category) REFERENCES categories(slug) ON DELETE RESTRICT;

-- Users to Products (created_by)
ALTER TABLE products
ADD CONSTRAINT fk_products_created_by
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Orders to Users
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Inventory to Products
ALTER TABLE inventory
ADD CONSTRAINT fk_inventory_product_id
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Audit Logs to Users
ALTER TABLE audit_logs
ADD CONSTRAINT fk_audit_logs_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
```

---

## JSONB Data Structures

### Multilingual Text (JSONB)

```typescript
interface MultilingualText {
  ru: string;    // Russian
  uz?: string;   // Uzbek (optional)
  en?: string;   // English (optional)
}

// Example
{
  "ru": "Игровая мышь",
  "uz": "O'yin sichqonchasi",
  "en": "Gaming Mouse"
}
```

### Address (JSONB)

```typescript
interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  phone?: string;
  notes?: string;
}

// Example
{
  "street": "Amir Temur ko'chasi, 100",
  "city": "Tashkent",
  "country": "Uzbekistan",
  "postal_code": "100000"
}
```

### Order Item (JSONB)

```typescript
interface OrderItem {
  productId: string;
  name: MultilingualText;
  quantity: number;
  price: number;
  image?: string;
}

// Example
{
  "productId": "550e8400-e29b-41d4-a716-446655440001",
  "name": { "ru": "Игровая мышь Pro", "uz": "O'yin sichqonchasi Pro" },
  "quantity": 2,
  "price": 50000,
  "image": "https://cdn.../img.webp"
}
```

### Audit Details (JSONB)

```typescript
interface AuditDetails {
  before?: Record<string, any>;
  after?: Record<string, any>;
  changes?: string[];
}

// Example
{
  "before": { "price": 50000, "featured": false },
  "after": { "price": 45000, "featured": true },
  "changes": ["price", "featured"]
}
```

---

## Common Queries

### List Products with Pagination

```sql
SELECT *
FROM products
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
```

### Get Product by Slug

```sql
SELECT *
FROM products
WHERE slug = 'gaming-mouse-pro'
LIMIT 1;
```

### Get Category with Product Count

```sql
SELECT
  c.id,
  c.name,
  c.slug,
  COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category = c.slug
WHERE c.is_active = true
GROUP BY c.id
ORDER BY c.sort_order;
```

### Get Recent Orders with Details

```sql
SELECT
  o.id,
  o.order_number,
  o.customer_name,
  o.total_amount,
  o.status,
  o.payment_status,
  o.created_at,
  COUNT(jsonb_array_length(o.items)) as item_count
FROM orders o
ORDER BY o.created_at DESC
LIMIT 50;
```

### Get Inventory Status

```sql
SELECT
  p.id,
  p.slug,
  p.name,
  i.quantity,
  i.reserved,
  i.quantity - i.reserved as available,
  CASE
    WHEN i.quantity - i.reserved <= 0 THEN 'out_of_stock'
    WHEN i.quantity - i.reserved < 5 THEN 'low_stock'
    ELSE 'in_stock'
  END as status
FROM products p
LEFT JOIN inventory i ON i.product_id = p.id
WHERE p.category = 'mice'
ORDER BY available ASC;
```

### Get User Activity (Audit Log)

```sql
SELECT *
FROM audit_logs
WHERE user_id = '...'
  AND action IN ('create', 'update', 'delete')
ORDER BY created_at DESC
LIMIT 100;
```

---

## Database Administration

### Backup

```bash
# Full database backup
pg_dump ggpoint_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -Fc ggpoint_db > backup.sql.gz
```

### Restore

```bash
# From SQL file
psql ggpoint_db < backup.sql

# From compressed backup
pg_restore -d ggpoint_db backup.sql.gz
```

### Performance Optimization

```sql
-- Analyze query plans
EXPLAIN ANALYZE
SELECT * FROM products WHERE category = 'mice';

-- Vacuum and analyze
VACUUM ANALYZE products;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## Migration Strategy

When modifying schema:

1. Create migration file: `migrations/YYYY-MM-DD_description.sql`
2. Test in development
3. Review with team
4. Apply to staging
5. Apply to production (with backup)

**Example migration**:
```sql
-- Migration: Add new column to products
ALTER TABLE products
ADD COLUMN seo_description VARCHAR(160) NULLABLE;

-- Create index if needed
CREATE INDEX idx_products_seo ON products(seo_description);

-- Backfill data if required
UPDATE products
SET seo_description = substring(description->>'ru', 1, 160)
WHERE seo_description IS NULL;
```

---

## Data Retention Policy

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| Products | Indefinite | Keep archived (not deleted) |
| Orders | 7 years | Tax/legal requirement |
| Audit Logs | 2 years | Security & compliance |
| User Sessions | 30 days | Auto-cleanup |
| Temporary Uploads | 7 days | Auto-cleanup |

---

## Security Considerations

- All password hashes use bcryptjs (cost: 10)
- Sensitive data (passwords, tokens) not logged in audit_logs
- JSONB fields use parameterized queries (prevent injection)
- Foreign keys enforce data integrity
- Regular backups stored securely
- Access logs reviewed for suspicious activity

---

*Last updated: 2025-02-08*
*Maintained by: Development Team*
