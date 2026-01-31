# Admin Panel Implementation Plan

## 1. Analysis Report

### Current Project Structure and Tech Stack

**Framework**: Angular 20 with SSR (Server-Side Rendering)
**UI Libraries**: Angular Material, Tailwind CSS
**Language**: TypeScript
**Server**: Express.js (Node.js)
**Internationalization**: @ngx-translate/core
**Build Tool**: Angular CLI

### Current Data Storage

Products are stored in two locations:
- `data/products.ts` - TypeScript file exporting product array (primary source)
- `src/assets/data/products.json` - JSON file (alternative format)

### Files That Need Modification

| File/Location | Purpose |
|---------------|---------|
| `src/server.ts` | Add API endpoints for authentication and product management |
| `src/app/app.routes.ts` | Add admin routes with guards |
| `src/app/shared/services/product.service.ts` | Update to use API endpoints instead of local data |

### Current Dependencies

Already available:
- Express.js (server-side)
- Angular Forms (@angular/forms)
- Angular Router (@angular/router)

Required new packages:
- `bcrypt` or `bcryptjs` - Password hashing
- `better-sqlite3` - SQLite database (lightweight, file-based)
- `express-session` - Session management
- `uuid` - Generate unique IDs

---

## 2. Implementation Plan

### Phase 1: Backend Setup (Server-Side)

#### Step 1.1: Install Dependencies
```bash
npm install bcryptjs better-sqlite3 express-session uuid
npm install -D @types/bcryptjs @types/better-sqlite3 @types/express-session @types/uuid
```

#### Step 1.2: Database Schema Design (SQLite)

```sql
-- Users table for admin authentication
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'admin',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name_ru TEXT NOT NULL,
    name_uz TEXT,
    description_ru TEXT,
    description_uz TEXT,
    price INTEGER NOT NULL,
    old_price INTEGER,
    category TEXT NOT NULL,
    images TEXT, -- JSON array
    specs TEXT,  -- JSON object
    in_stock INTEGER DEFAULT 1,
    featured INTEGER DEFAULT 0,
    is_new INTEGER DEFAULT 0,
    related_products TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expired DATETIME NOT NULL
);
```

#### Step 1.3: API Endpoints Structure

**Authentication Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Admin login |
| POST | `/api/auth/logout` | Admin logout |
| GET | `/api/auth/session` | Check current session |
| POST | `/api/auth/change-password` | Change password |

**Product Management Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/products` | List all products |
| GET | `/api/admin/products/:id` | Get single product |
| POST | `/api/admin/products` | Create new product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |

**Public Product Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Public product list |
| GET | `/api/products/:slug` | Public product detail |

### Phase 2: Authentication System

#### Step 2.1: Create Auth Service (Backend)
- Password hashing with bcrypt (cost factor: 12)
- Session-based authentication using express-session
- Secure cookie configuration

#### Step 2.2: Create Auth Guard (Frontend)
- Angular route guard for admin routes
- Redirect to login if not authenticated

#### Step 2.3: Create Login Component
- Username/password form with validation
- Error handling and feedback
- Optional: Remember me functionality

### Phase 3: Admin Panel Dashboard

#### Step 3.1: Create Admin Layout Component
- Navigation sidebar
- Header with logout button
- Main content area

#### Step 3.2: Create Product List Component
- Table with all products
- Search and filter functionality
- Pagination
- Actions: Edit, Delete

#### Step 3.3: Create Product Form Component
- Form for creating/editing products
- Image URL management
- Specifications editor
- Category selection
- Validation

### Phase 4: Data Migration

#### Step 4.1: Create Migration Script
- Read existing products from `data/products.ts`
- Insert into SQLite database
- Create default admin user

#### Step 4.2: Update Product Service
- Switch from local data to API calls
- Maintain backward compatibility with existing components

---

## 3. Architecture Recommendations

### Folder Structure for Admin Features

```
src/
├── app/
│   ├── admin/                          # Admin module
│   │   ├── components/
│   │   │   ├── admin-layout/           # Admin layout wrapper
│   │   │   ├── product-list/           # Product list table
│   │   │   ├── product-form/           # Create/edit product form
│   │   │   └── dashboard/              # Dashboard overview
│   │   ├── guards/
│   │   │   └── auth.guard.ts           # Route protection
│   │   └── services/
│   │       └── admin-product.service.ts # Admin product API service
│   ├── auth/                           # Authentication module
│   │   ├── components/
│   │   │   └── login/                  # Login page
│   │   └── services/
│   │       └── auth.service.ts         # Auth state management
│   └── ...
├── server/                             # Backend server code
│   ├── db/
│   │   ├── database.ts                 # Database connection
│   │   ├── schema.ts                   # Table schemas
│   │   └── migrations/
│   │       └── 001-initial.ts          # Initial migration
│   ├── middleware/
│   │   └── auth.middleware.ts          # Authentication middleware
│   ├── routes/
│   │   ├── auth.routes.ts              # Auth endpoints
│   │   └── products.routes.ts          # Product endpoints
│   └── services/
│       ├── auth.service.ts             # Auth business logic
│       └── products.service.ts         # Product business logic
└── server.ts                           # Main server entry
```

### Route Protection Strategy

```typescript
// Admin routes configuration
{
  path: 'admin',
  canActivate: [authGuard],
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'products', component: ProductListComponent },
    { path: 'products/new', component: ProductFormComponent },
    { path: 'products/:id/edit', component: ProductFormComponent }
  ]
}
```

---

## 4. Code Examples

### Authentication Flow Example

```typescript
// auth.service.ts (Frontend)
@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticatedSignal = signal(false);
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor(private http: HttpClient) {
    this.checkSession();
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ success: boolean }>('/api/auth/login', { username, password })
      .pipe(
        tap(res => this.isAuthenticatedSignal.set(res.success)),
        map(res => res.success)
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {})
      .pipe(tap(() => this.isAuthenticatedSignal.set(false)));
  }

  private checkSession(): void {
    this.http.get<{ authenticated: boolean }>('/api/auth/session')
      .subscribe(res => this.isAuthenticatedSignal.set(res.authenticated));
  }
}
```

### Database Connection Example

```typescript
// database.ts (Backend)
import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'data', 'ggpoint.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
```

### CRUD Operations Example

```typescript
// products.service.ts (Backend)
export class ProductsService {
  getAllProducts() {
    return db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  }

  getProductById(id: string) {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  }

  createProduct(product: CreateProductDto) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO products (id, slug, name_ru, name_uz, description_ru, description_uz, 
        price, old_price, category, images, specs, in_stock, featured, is_new)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, product.slug, product.name_ru, product.name_uz, 
      product.description_ru, product.description_uz, product.price, 
      product.old_price, product.category, JSON.stringify(product.images), 
      JSON.stringify(product.specs), product.in_stock ? 1 : 0, 
      product.featured ? 1 : 0, product.is_new ? 1 : 0);
    return this.getProductById(id);
  }

  updateProduct(id: string, updates: UpdateProductDto) {
    // Update logic
  }

  deleteProduct(id: string) {
    return db.prepare('DELETE FROM products WHERE id = ?').run(id);
  }
}
```

---

## 5. Security Best Practices

1. **Password Security**
   - Hash passwords with bcrypt (cost factor 12)
   - Never store plain text passwords
   - Enforce minimum password length (8 characters)

2. **Session Security**
   - Use HTTP-only cookies
   - Set secure flag in production
   - Implement session expiration (24 hours)
   - Regenerate session ID on login

3. **API Security**
   - Validate all input data
   - Use parameterized queries (SQLite prepared statements)
   - Rate limiting for login attempts
   - CSRF protection

4. **Frontend Security**
   - Route guards for admin pages
   - Handle unauthorized responses (401/403)
   - Don't expose sensitive data in localStorage

---

## 6. Development Phases

### Phase 1: Foundation (Est. 2-3 hours)
- Install dependencies
- Set up database with schema
- Create initial migration script

### Phase 2: Authentication (Est. 2-3 hours)
- Backend auth routes
- Frontend auth service and guard
- Login page component

### Phase 3: Admin Dashboard (Est. 3-4 hours)
- Admin layout
- Product list with table
- Product create/edit form
- Delete functionality

### Phase 4: Integration & Testing (Est. 1-2 hours)
- Update product service for API
- Test all CRUD operations
- Test authentication flow

### Phase 5: Polish (Est. 1 hour)
- Error handling
- Loading states
- UI improvements

**Total Estimated Time: 9-13 hours**

---

## 7. Default Admin Credentials

For initial setup, a default admin user will be created:
- **Username**: `admin`
- **Password**: `admin123` (should be changed immediately after first login)

---

## 8. Getting Started

After implementation, start the admin panel with:

1. Build and run SSR:
   ```bash
   npm run build:ssr
   npm run serve:ssr:ggpoint
   ```

2. Access admin panel at: `http://localhost:4000/admin`

3. Login with default credentials and change password immediately.
