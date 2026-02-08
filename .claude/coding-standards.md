# Coding Standards & Conventions

## Overview

This document defines the coding standards for the GGPoint admin panel project. All code must follow these conventions for consistency, maintainability, and team collaboration.

---

## File & Naming Conventions

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Components | `feature-name.component.ts` | `product-list.component.ts` |
| Services | `feature-name.service.ts` | `product.service.ts` |
| Models/Interfaces | `singular-name.model.ts` | `product.model.ts` (not `products.model.ts`) |
| Guards | `feature-name.guard.ts` | `auth.guard.ts` |
| Pipes | `feature-name.pipe.ts` | `currency.pipe.ts` |
| Interceptors | `feature-name.interceptor.ts` | `auth.interceptor.ts` |
| Configuration | `feature-name.config.ts` | `translate.config.ts` |
| Styles | `feature-name.component.scss` | `product-form.component.scss` |
| Templates | `feature-name.component.html` | `product-form.component.html` |

### Directory Naming

```
src/app/
├── admin/
│   ├── components/          # Lowercase, plural
│   ├── services/            # Lowercase, plural
│   ├── models/              # Lowercase, plural
│   └── guards/              # Lowercase, plural
├── shared/
│   ├── components/
│   ├── models/
│   ├── pipes/
│   └── utils/               # Utility functions
```

---

## TypeScript & Code Style

### Interface & Class Naming

```typescript
// Interfaces: PascalCase
interface User { }
interface ProductResponse { }
interface ApiError { }

// Classes: PascalCase
class ProductService { }
class AuthGuard { }

// Variables & Functions: camelCase
let isLoading: boolean;
let currentUser: User;
function fetchProducts() { }
const getProductId = () => { };

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5242880; // 5MB
const API_BASE_URL = '/api';
const CATEGORIES = ['mice', 'keyboards', 'headsets'];
```

### Type Annotations

```typescript
// Always provide explicit return types
function calculateTotal(price: number, tax: number): number {
  return price + tax;
}

// For class properties
export class ProductService {
  private products: Product[] = [];
  isLoading: Signal<boolean> = signal(false);
}

// For arrow functions
const handleClick = (event: MouseEvent): void => {
  console.log(event);
};
```

### Import Organization

```typescript
// 1. Angular imports (alphabetically)
import { Component, Signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// 2. Angular Material imports (alphabetically)
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';

// 3. Third-party imports (alphabetically)
import { Observable } from 'rxjs';

// 4. Local imports (alphabetically)
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../services/product.service';

// 5. Styles & Templates (last)
import { environment } from '../../../environments/environment';
```

---

## Component Structure

### Component File Organization

```typescript
// 1. Imports
import { Component, OnInit, inject, signal } from '@angular/core';

// 2. Interfaces/Types (local to component)
interface ComponentState {
  items: Product[];
  isLoading: boolean;
}

// 3. Component decorator
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
  ],
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.scss',
})

// 4. Component class
export class FeatureNameComponent implements OnInit {
  // 4a. Injected services
  private service = inject(ProductService);
  private router = inject(Router);

  // 4b. Signals
  items = signal<Product[]>([]);
  isLoading = signal(false);
  selectedId = signal<string | null>(null);

  // 4c. Form groups
  form: FormGroup;

  // 4d. Template references
  @ViewChild('searchInput') searchInput?: ElementRef;

  // 4e. Constructor
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      // form definition
    });
  }

  // 4f. Lifecycle hooks
  ngOnInit(): void {
    this.loadItems();
  }

  // 4g. Public methods
  onSubmit(): void {
    // Implementation
  }

  // 4h. Private methods
  private loadItems(): void {
    // Implementation
  }
}
```

### Standalone Components (Default)

All new components must be **standalone**:

```typescript
@Component({
  selector: 'app-feature',
  standalone: true,  // Always true
  imports: [
    CommonModule,
    MatButtonModule,
    // Add Material modules as needed
  ],
  // ... rest of config
})
export class FeatureComponent { }
```

---

## Signals & Reactive State

### Using Angular Signals (Preferred)

```typescript
// Create signals with initial values
items = signal<Product[]>([]);
isLoading = signal(false);
errorMessage = signal<string | null>(null);

// Read signal value
const items = this.items();  // Call as function

// Update signal
this.items.set(newArray);
this.isLoading.set(true);

// Derived signals
totalItems = computed(() => this.items().length);
hasItems = computed(() => this.items().length > 0);

// In templates
{{ items().length }} <!-- Call as function -->
{{ totalItems() }}    <!-- Call computed signal -->
```

### Error Messages & State

```typescript
// Proper state management
errorMessage = signal<string | null>(null);

// Usage
this.errorMessage.set(null);  // Clear error
this.errorMessage.set('Product not found'); // Set error

// Template
@if (errorMessage(); as error) {
  <mat-error>{{ error }}</mat-error>
}
```

---

## Form Handling

### Reactive Forms Pattern

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class ProductFormComponent {
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    description: [''],
    tags: this.fb.array([])
  });

  // Access form arrays
  get tagsArray(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  // Add to array
  addTag(): void {
    this.tagsArray.push(this.fb.control(''));
  }

  // Remove from array
  removeTag(index: number): void {
    this.tagsArray.removeAt(index);
  }

  // Submit form
  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const formData = this.form.value;
    // Process form data
  }
}
```

### Form Validation Patterns

```typescript
// Built-in validators
Validators.required
Validators.minLength(3)
Validators.maxLength(100)
Validators.min(0)
Validators.max(1000000)
Validators.pattern(/^[a-z0-9]+$/)
Validators.email

// Multiple validators
name: ['', [Validators.required, Validators.minLength(2)]]

// Async validators
productSlug: ['', [Validators.required], [this.slugValidator()]]
```

---

## Service Pattern

### Service Structure

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ApiResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'  // Always provide at root
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/products';

  // GET list with pagination
  getList(page: number = 1, pageSize: number = 10): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(this.API_URL, {
      params: { page, pageSize }
    });
  }

  // GET single item
  getById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.API_URL}/${id}`);
  }

  // POST create
  create(data: Omit<Product, 'id' | 'createdAt'>): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.API_URL, data);
  }

  // PUT update
  update(id: string, data: Product): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.API_URL}/${id}`, data);
  }

  // DELETE
  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`);
  }
}
```

### Service with Signals (Advanced)

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  private readonly products = signal<Product[]>([]);
  private readonly loading = signal(false);
  private readonly error = signal<string | null>(null);

  // Expose as readonly signals
  products$ = this.products.asReadonly();
  loading$ = this.loading.asReadonly();
  error$ = this.error.asReadonly();

  loadProducts(): void {
    this.loading.set(true);
    this.http.get<ApiResponse<Product[]>>('/api/products').subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set('Failed to load products');
      },
      complete: () => this.loading.set(false)
    });
  }
}
```

---

## Error Handling

### Observable Error Pattern

```typescript
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

this.service.getProducts().subscribe({
  next: (response) => {
    // Handle success
    this.products.set(response.data);
    this.showNotification('Products loaded successfully');
  },
  error: (error: HttpErrorResponse) => {
    // Handle error
    const errorMessage = error.error?.error || 'Failed to load products';
    this.errorMessage.set(errorMessage);

    // Log error for debugging
    console.error('Error loading products:', error);

    // Show error notification
    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      panelClass: 'error-snackbar'
    });
  }
});
```

### Common Error Handling Utilities

```typescript
// Service with error handling
@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  getProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>('/api/products').pipe(
      catchError((error) => {
        console.error('Error fetching products:', error);
        throw new Error(error.error?.message || 'Failed to fetch products');
      })
    );
  }
}
```

---

## Language & Internationalization

### UI Text (Uzbek Required, English Optional)

```typescript
// ❌ Wrong: English only
<button>Add Product</button>

// ✅ Correct: Uzbek primary
<button>Mahsulot qo'shish</button>

// ✅ Also acceptable: i18n with translation keys
<button>{{ 'ADMIN.PRODUCTS.ADD' | translate }}</button>
```

### Translation Key Naming

```typescript
// Naming convention: SECTION.SUBSECTION.KEY
interface TranslationKeys {
  'ADMIN.DASHBOARD.TITLE': string;
  'ADMIN.DASHBOARD.STATS_TOTAL': string;
  'ADMIN.PRODUCTS.ADD': string;
  'ADMIN.PRODUCTS.EDIT': string;
  'ADMIN.PRODUCTS.DELETE_CONFIRM': string;
  'ADMIN.PRODUCTS.DELETE_SUCCESS': string;
  'ADMIN.PRODUCTS.DELETE_ERROR': string;
  'ADMIN.FORMS.REQUIRED': string;
  'ADMIN.FORMS.INVALID_EMAIL': string;
  'ADMIN.FORMS.MIN_LENGTH': string;
}
```

### Translation Files

```json
// assets/i18n/uz.json
{
  "ADMIN": {
    "DASHBOARD": {
      "TITLE": "Bosh sahifa",
      "STATS_TOTAL": "Jami mahsulotlar"
    },
    "PRODUCTS": {
      "ADD": "Mahsulot qo'shish",
      "EDIT": "Tahrirlash",
      "DELETE": "O'chirish",
      "DELETE_CONFIRM": "O'chirishni tasdiqlaysizmi?",
      "DELETE_SUCCESS": "Mahsulot muvaffaqiyatli o'chirildi",
      "DELETE_ERROR": "Mahsulot o'chirilmadi"
    }
  }
}
```

### Using Translations in Code

```typescript
// In templates
<h1>{{ 'ADMIN.DASHBOARD.TITLE' | translate }}</h1>
<button (click)="delete()">{{ 'ADMIN.PRODUCTS.DELETE' | translate }}</button>

// In components
export class ProductListComponent {
  private translateService = inject(TranslateService);

  deleteProduct(): void {
    this.translateService.get('ADMIN.PRODUCTS.DELETE_CONFIRM').subscribe(msg => {
      if (confirm(msg)) {
        // Proceed with deletion
      }
    });
  }
}
```

---

## CSS & Styling

### CSS Class Naming (BEM + Kebab-case)

```html
<!-- Block -->
<div class="product-form">

  <!-- Element -->
  <div class="product-form__header">
    <h1 class="product-form__title">Add Product</h1>
  </div>

  <!-- Element -->
  <form class="product-form__form">

    <!-- Block modifier -->
    <div class="form-group form-group--required">
      <label>Product Name</label>
      <input>
    </div>

    <!-- Element modifier -->
    <button class="button button--primary">Save</button>
    <button class="button button--secondary">Cancel</button>
  </form>
</div>
```

### SCSS Structure in Components

```scss
.product-form {
  max-width: 1200px;
  margin: 0 auto;

  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  &__title {
    font-size: 2rem;
    font-weight: 600;
    color: #0f172a;
  }

  &__form {
    display: grid;
    gap: 1.5rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    &__header {
      flex-direction: column;
      gap: 1rem;
    }
  }
}
```

### Scoped vs Global Styles

```typescript
// ✅ Preferred: Scoped component styles
@Component({
  selector: 'app-product-form',
  template: `...`,
  styles: [`
    .product-form { /* Only affects this component */ }
  `],
})

// ✅ OK: External SCSS file
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})

// ❌ Avoid: Global styles for component-specific styles
// Instead put in component scope
```

---

## Comments & Documentation

### Comment Standards

```typescript
/**
 * Fetches products from the API with pagination.
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of items per page
 * @returns Observable of paginated products
 */
getProducts(page: number = 1, pageSize: number = 10): Observable<ApiResponse<Product[]>> {
  return this.http.get<ApiResponse<Product[]>>('/api/products', {
    params: { page, pageSize }
  });
}

// Explain complex logic
// We need to filter by both category and stock status
// then sort by price descending
const filtered = products
  .filter(p => p.category === this.selectedCategory && p.inStock)
  .sort((a, b) => b.price - a.price);
```

### Avoid Obvious Comments

```typescript
// ❌ Bad: Obvious comments
i++; // Increment i
const name = 'John'; // Set name to John

// ✅ Good: Only explain non-obvious logic
// Group products by category for dashboard stats
const grouped = products.reduce((acc, product) => {
  acc[product.category] = (acc[product.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

---

## Code Formatting

### Prettier Configuration

All code is automatically formatted according to `.prettierrc`:

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "useTabs": false
}
```

### Line Length

- Maximum: 100 characters
- Enforced by Prettier
- No exceptions

### Spacing & Indentation

```typescript
// Use 2 spaces for indentation
function calculate(a: number, b: number): number {
  if (a > b) {
    return a - b;
  }
  return b - a;
}

// Space before function braces
if (condition) {
  // code
}

// No space before function call parentheses
myFunction();
const result = calculateTotal(10, 20);
```

---

## Common Anti-Patterns to Avoid

### ❌ Magic Numbers

```typescript
// Bad
const total = price * 1.15;  // What is 1.15?

// Good
const TAX_RATE = 0.15;
const total = price * (1 + TAX_RATE);
```

### ❌ Nested If/For Statements

```typescript
// Bad
for (let item of items) {
  if (item.active) {
    if (item.visible) {
      if (item.type === 'product') {
        // Do something
      }
    }
  }
}

// Good
const activeVisibleProducts = items.filter(
  item => item.active && item.visible && item.type === 'product'
);

for (let product of activeVisibleProducts) {
  // Do something
}
```

### ❌ Large Functions

```typescript
// Bad: 200+ lines in one function
ngOnInit() { /* 200+ lines */ }

// Good: Break into smaller functions
ngOnInit(): void {
  this.loadProducts();
  this.setupFilters();
  this.initializeChart();
}

private loadProducts(): void { /* 30 lines */ }
private setupFilters(): void { /* 25 lines */ }
private initializeChart(): void { /* 20 lines */ }
```

### ❌ Deep Component Nesting

```typescript
// Bad: More than 4 levels deep
<div>
  <div>
    <mat-card>
      <div>
        <div>
          <button>Click</button>
        </div>
      </div>
    </mat-card>
  </div>
</div>

// Good: Flatten structure using components
<app-product-card>
  <app-button>Click</app-button>
</app-product-card>
```

---

## Testing Standards

### Unit Test Naming

```typescript
describe('ProductService', () => {
  it('should fetch products from API', () => { });
  it('should handle API errors gracefully', () => { });
  it('should filter products by category', () => { });
});

describe('ProductFormComponent', () => {
  it('should display form fields', () => { });
  it('should validate required fields', () => { });
  it('should submit form with valid data', () => { });
});
```

---

## Performance Best Practices

### Change Detection Strategy

```typescript
@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ... rest of component config
})
export class ProductCardComponent {
  @Input() product!: Product;
}
```

### Unsubscribe Pattern

```typescript
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.service.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.products.set(products);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

---

## PR Review Checklist

Before submitting a PR, verify:

- [ ] Follows naming conventions
- [ ] Uses TypeScript strictly (no `any`)
- [ ] Components are standalone
- [ ] Services provided at root
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Uzbek labels used (English optional in code)
- [ ] Responsive design tested
- [ ] Dark theme compatible
- [ ] No `console.log` in production
- [ ] Tests written and passing
- [ ] Code formatted with Prettier
- [ ] No accessibility violations

---

*Last updated: 2025-02-08*
*Maintained by: Development Team*
