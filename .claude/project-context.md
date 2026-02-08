# GGPoint Admin Panel - Project Context

## Project Overview

**GGPoint** is a comprehensive e-commerce and inventory management system with a modern Angular admin panel. The platform serves Central Asian markets (Kazakhstan, Kyrgyzstan, Uzbekistan) with multi-language support, integration with regional APIs, and enterprise-grade features.

### Project Status
- **Admin Backend**: Complete (services, APIs, database structure)
- **Admin Frontend**: In development (UI components being built with Angular Material)
- **Current Focus**: Building production-ready Material Design components for admin panel

### Team & Collaborators
- **Team Size**: 10-15 developers
- **Primary Language**: TypeScript/Angular (code), Uzbek/Russian (UI labels)
- **Time Zone**: Central Asian (UTC+5 to UTC+6)

---

## Technology Stack

### Frontend
- **Framework**: Angular 20.3.x (standalone components)
- **UI Library**: Angular Material 21.0.3
- **Styling**: TailwindCSS 3.4.x + Scoped Component Styles
- **State Management**: Angular Signals (Angular 17+)
- **i18n**: ngx-translate/core 17.0.0
- **Form Validation**: Reactive Forms (FormBuilder, FormGroup, Validators)
- **HTTP Client**: Angular HttpClient with interceptors

### Backend
- **Runtime**: Node.js with Express 5.1.x
- **Database**: PostgreSQL 12+
- **Database Client**: pg 8.18.0
- **ORM/Query Builder**: None (raw SQL queries)
- **Session Management**: connect-pg-simple (PostgreSQL session store)
- **Authentication**: Session-based (cookies)
- **Security**: Helmet.js, express-rate-limit, bcryptjs
- **Image Processing**: Sharp 0.34.x
- **File Upload**: Multer 2.0.x
- **Logging**: Winston 3.19.x

### Development Tools
- **Build**: Angular CLI 20.3.6
- **TypeScript**: 5.9.2
- **Testing**: Jasmine/Karma
- **Code Formatting**: Prettier (100 char width, single quotes)
- **SSR**: Angular Universal (@angular/ssr 20.3.6)

---

## Architecture Overview

### Directory Structure

```
src/app/
├── admin/                          # Admin panel module
│   ├── components/
│   │   ├── admin-layout/          # Main admin layout wrapper
│   │   ├── dashboard/             # Admin dashboard
│   │   ├── product-list/          # Product management list
│   │   ├── product-form/          # Product create/edit form
│   │   ├── change-password/       # User password change
│   │   └── [future: users, orders, categories, etc]
│   ├── guards/
│   │   └── auth.guard.ts          # Admin route protection
│   ├── services/                  # Admin API services (TO BE CREATED)
│   └── models/                    # Admin data models (TO BE CREATED)
│
├── auth/                          # Authentication module
│   ├── components/
│   │   └── login/                 # Login page
│   └── services/
│       └── auth.service.ts        # Authentication logic
│
├── core/                          # Core services & interceptors
│   ├── config/
│   │   └── translate.config.ts    # i18n configuration
│   ├── interceptors/
│   │   └── auth.interceptor.ts    # HTTP interceptor (withCredentials)
│   └── services/
│       ├── language.service.ts    # Language/locale management
│       ├── theme.service.ts       # Dark/light theme
│       └── [future: notification, toast, etc]
│
├── shared/                        # Shared resources
│   ├── components/                # Reusable UI components
│   ├── models/                    # Shared TypeScript interfaces
│   │   ├── product.model.ts       # Product interfaces
│   │   └── blog.model.ts          # Blog interfaces
│   └── pipes/                     # Shared custom pipes
│
└── pages/                         # Public-facing pages
    ├── home/
    ├── catalog/
    ├── blog/
    ├── about/
    ├── contact/
    └── faq/
```

### Key Modules

#### Admin Panel (`src/app/admin/`)
Handles all administrative functionality with protected routes. Components use Material Design components and Signals for reactive state management.

**Key Components**:
- `admin-layout`: Wrapper component with sidenav, header, footer
- `dashboard`: Overview with stats and quick actions
- `product-list`: Data table with filtering, sorting, pagination
- `product-form`: CRUD form with dynamic fields, image upload
- `change-password`: Password management modal

#### Authentication (`src/app/auth/`)
Session-based authentication with cookies. User state managed via Signals in `AuthService`.

**Features**:
- Login/logout
- Session persistence
- Password change
- Role-based access control (admin, moderator, user)

#### Core Services (`src/app/core/`)
Application-wide services and configuration.

**Services**:
- `AuthService`: User state and authentication
- `LanguageService`: i18n switching
- `ThemeService`: Dark/light mode
- `authInterceptor`: Attaches credentials to HTTP requests

---

## Data Models & Schemas

### Key Data Structures

#### User
```typescript
interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;                    // 'admin' | 'moderator' | 'user'
  must_change_password?: boolean;
}
```

#### Product (Frontend)
```typescript
interface Product {
  id: string;
  slug: string;
  name: string;
  nameUz?: string;
  category: string;
  price: number;
  originalPrice?: number;
  currency: string;
  description: string;
  descriptionUz?: string;
  specifications: ProductSpecification[];
  images: string[];
  thumbnail: string;
  inStock: boolean;
  featured: boolean;
  isNew?: boolean;
  tags: string[];
  relatedProducts?: string[];
  createdAt: Date;
}
```

#### Product (Server Response)
```typescript
interface ServerProduct {
  id: string;
  slug: string;
  name: { ru: string; uz?: string };
  category: string;
  price: number;
  oldPrice?: number;
  description: { ru: string; uz?: string };
  specs?: Record<string, string | number | boolean>;
  images?: string[];
  inStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  relatedProducts?: string[];
  createdAt?: string;
}
```

#### API Response Pattern
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T | T[];
  total?: number;
  page?: number;
  pageSize?: number;
  message?: string;
}

interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: any;
}
```

---

## Routing Structure

### Public Routes
```
/                  → Home page
/catalog           → Product catalog
/product/:id       → Product detail
/blog              → Blog list
/blog/:slug        → Blog post
/about             → About page
/contact           → Contact page
/faq               → FAQ page
/login             → Login page
```

### Admin Routes (Protected with `authGuard`)
```
/admin                    → Redirect to /admin/dashboard
/admin/dashboard          → Admin overview
/admin/products           → Product management list
/admin/products/new       → Create new product
/admin/products/:id/edit  → Edit product
/admin/change-password    → Change password
```

### Authentication
- Session-based with HTTP-only cookies
- Routes protected with `authGuard`
- Automatic session check on app init
- User state managed in `AuthService`

---

## Regional Integrations

### APIs & Integrations
1. **Marking System**: Xtrace API (product tracking)
2. **Payment Gateway**: Kaspi.kz (payment processing)
3. **Tax System**: Local tax compliance
4. **Multi-Currency Support**: UZS (primary), KZT, KGS (secondary)

### Localization
- **Primary UI Language**: Uzbek
- **Secondary Language**: Russian
- **Code Language**: English
- **i18n Library**: ngx-translate
- **Storage**: Language preference in localStorage

---

## Development Workflow

### Component Creation Flow
1. Create component in `src/app/admin/components/[feature]/`
2. Define models/interfaces in `src/app/admin/models/`
3. Create service in `src/app/admin/services/`
4. Build form/template using Material components
5. Implement error handling with MatSnackBar
6. Add to routing in `app.routes.ts`

### Feature Development Checklist
- [ ] Create feature service with API calls
- [ ] Define TypeScript interfaces/models
- [ ] Create Angular Material form/template
- [ ] Add error handling and validation
- [ ] Add loading and submit states
- [ ] Implement Uzbek translations
- [ ] Test with dark theme
- [ ] Add unit tests (Jasmine)
- [ ] Document in `.claude/` files

### Code Review Standards
- Naming conventions followed
- No console.log in production code
- Error handling implemented
- Loading states shown
- Material guidelines followed
- Responsive design (mobile-first)
- Accessibility considerations

---

## Design System

### Material Components Used
- **Data Tables**: MatTable + MatPaginator + MatSort
- **Forms**: MatFormField, MatInput, MatSelect, MatCheckbox, MatDatepicker
- **Modals**: MatDialog
- **Notifications**: MatSnackBar
- **Navigation**: MatToolbar, MatSidenav
- **Cards**: MatCard
- **Buttons**: MatButton (raised, flat, icon)
- **Loading**: MatProgressSpinner, MatProgressBar

### Color Scheme (Light Theme)
- **Primary**: #0891b2 (Cyan)
- **Secondary**: #0ea5e9 (Sky Blue)
- **Success**: #10b981 (Emerald)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)
- **Neutral**: #64748b (Slate)

### Typography
- **Headlines**: 700-800 weight, letter-spacing
- **Body**: 400-500 weight
- **Monospace**: Code blocks and technical text

---

## Performance Considerations

### Frontend Optimization
- Standalone components (no NgModules)
- Lazy loading of admin routes
- Image optimization with sharp (backend)
- Virtual scrolling for large lists (MatVirtualScrollModule)
- OnPush change detection strategy
- Signals instead of observables where possible

### Backend Optimization
- PostgreSQL connection pooling
- Caching headers on static assets
- Gzip compression (Helmet)
- Rate limiting on sensitive endpoints
- Database indexes on frequently queried fields

### Build & Deployment
- Tree-shaking enabled
- Production build optimizations
- SSR support for public pages
- CDN for static assets
- Environment-based configuration

---

## Testing Strategy

### Unit Tests (Jasmine)
- Service business logic
- Component input/output behavior
- Pipe transformations
- Custom validators

### E2E Tests
- Admin login/logout flow
- CRUD operations
- Form validation
- Error scenarios

### Manual Testing Checklist
- [ ] Light and dark theme
- [ ] Mobile responsiveness
- [ ] Uzbek and Russian translations
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation

---

## Environment Configuration

### Development
```
ng serve                 # Run development server (localhost:4200)
```

### Production Build
```
ng build --prod         # Production build
ng run ggpoint:server   # SSR server build
```

### Environment Variables
- API_URL: Backend endpoint
- JWT_SECRET: Session secret (server)
- DB_CONNECTION_STRING: PostgreSQL connection

---

## Security Considerations

### Implemented
- Session-based authentication with HTTP-only cookies
- CSRF protection (session tokens)
- Rate limiting on API endpoints
- Input validation on forms
- Helmet.js security headers
- Password hashing with bcryptjs

### Best Practices
- Never store sensitive data in localStorage
- Always validate user input
- Use parameterized queries (prevent SQL injection)
- HTTPS-only in production
- Regular dependency updates

---

## Next Steps & Roadmap

### Immediate (Current Sprint)
- [ ] Create admin service templates
- [ ] Build user management components
- [ ] Build order management components
- [ ] Build category management components

### Short Term (Next 2 Sprints)
- [ ] Analytics dashboard
- [ ] Report generation
- [ ] Email notifications
- [ ] Bulk operations (import/export)

### Medium Term (Q2 2025)
- [ ] Role-based permission system
- [ ] Activity logging
- [ ] Advanced filtering
- [ ] Real-time updates (WebSocket)

### Long Term
- [ ] Mobile app
- [ ] AI-powered recommendations
- [ ] Advanced analytics
- [ ] Third-party integrations

---

## Documentation Reference

For detailed information, see:
- **API Patterns**: [api-patterns.md](./.claude/api-patterns.md)
- **Coding Standards**: [coding-standards.md](./.claude/coding-standards.md)
- **Component Patterns**: [component-patterns.md](./.claude/component-patterns.md)
- **Database Schema**: [database-schema.md](./.claude/database-schema.md)
- **Service Example**: [examples/service.example.ts](./.claude/examples/service.example.ts)
- **Component Example**: [examples/component.example.ts](./.claude/examples/component.example.ts)

---

## Quick Links

- **Angular Docs**: https://angular.io/docs
- **Material Docs**: https://material.angular.io
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Express Docs**: https://expressjs.com/

---

*Last updated: 2025-02-08*
*Maintained by: Development Team*
