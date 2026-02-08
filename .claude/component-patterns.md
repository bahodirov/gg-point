# Component Patterns & Best Practices

## Overview

This document defines standard component patterns used throughout the admin panel. All components should follow these patterns for consistency and maintainability.

---

## Standard Component Structure

### Complete Component Template

```typescript
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface PageState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="feature-container">
      @if (isLoading()) {
        <mat-spinner></mat-spinner>
      } @else if (error(); as err) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon>error</mat-icon>
            <p>{{ err }}</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="items-grid">
          @for (item of items(); track item.id) {
            <mat-card class="item-card">
              <mat-card-content>
                {{ item.name }}
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .feature-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .error-card {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .item-card {
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .item-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class FeatureNameComponent implements OnInit {
  // Injected services
  private service = inject(ProductService);
  private snackBar = inject(MatSnackBar);

  // State signals
  items = signal<Product[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Derived signals
  itemCount = computed(() => this.items().length);
  isEmpty = computed(() => this.itemCount() === 0);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.service.getItems().subscribe({
      next: (response) => {
        this.items.set(response.data);
      },
      error: (err) => {
        const errorMsg = err.error?.error || 'Failed to load items';
        this.error.set(errorMsg);
        this.snackBar.open(errorMsg, 'Close', { duration: 5000, panelClass: 'error-snackbar' });
      },
      complete: () => this.isLoading.set(false)
    });
  }
}
```

---

## Material Design Patterns

### Data Table Pattern

```typescript
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface TableState {
  pageIndex: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="table-container">
      @if (isLoading()) {
        <mat-spinner></mat-spinner>
      }

      <table mat-table [dataSource]="items()" matSort (matSortChange)="onSort($event)">
        <!-- ID Column -->
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let element">{{ element.id }}</td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
          <td mat-cell *matCellDef="let element">{{ element.name }}</td>
        </ng-container>

        <!-- Price Column -->
        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
          <td mat-cell *matCellDef="let element">{{ element.price | currency }}</td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button (click)="onEdit(element.id)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="onDelete(element.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <mat-paginator
        [length]="total()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="[10, 25, 50]"
        (page)="onPageChange($event)">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      position: relative;
      width: 100%;
      overflow: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background-color: #f8fafc;
      font-weight: 600;
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    tr:hover {
      background-color: #f8fafc;
    }

    mat-paginator {
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class ProductTableComponent implements OnInit {
  private service = inject(ProductService);

  items = signal<Product[]>([]);
  isLoading = signal(false);
  total = signal(0);

  pageIndex = signal(0);
  pageSize = signal(10);
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  displayedColumns = ['id', 'name', 'price', 'actions'];

  ngOnInit(): void {
    this.loadData();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  onSort(sort: Sort): void {
    this.sortBy.set(sort.active);
    this.sortOrder.set(sort.direction as 'asc' | 'desc');
    this.pageIndex.set(0); // Reset to first page
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.service.list({
      page: this.pageIndex() + 1, // Convert 0-indexed to 1-indexed
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      order: this.sortOrder()
    }).subscribe({
      next: (response) => {
        this.items.set(response.data);
        this.total.set(response.total || 0);
      },
      error: () => {
        this.items.set([]);
      },
      complete: () => this.isLoading.set(false)
    });
  }

  onEdit(id: string): void {
    // Navigate to edit page
  }

  onDelete(id: string): void {
    // Delete with confirmation
  }
}
```

### Form Pattern

```typescript
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="product-form">
      <div class="form-section">
        <h2>Basic Information</h2>

        <!-- Text Input -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Product Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter product name">
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Product name is required</mat-error>
          }
        </mat-form-field>

        <!-- Select Input -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category">
            @for (cat of categories; track cat) {
              <mat-option [value]="cat">{{ cat | titlecase }}</mat-option>
            }
          </mat-select>
          @if (form.get('category')?.hasError('required') && form.get('category')?.touched) {
            <mat-error>Category is required</mat-error>
          }
        </mat-form-field>

        <!-- Number Input -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Price</mat-label>
          <input matInput type="number" formControlName="price" placeholder="0">
          <mat-hint>Price in UZS</mat-hint>
          @if (form.get('price')?.hasError('required') && form.get('price')?.touched) {
            <mat-error>Price is required</mat-error>
          }
          @if (form.get('price')?.hasError('min') && form.get('price')?.touched) {
            <mat-error>Price must be greater than 0</mat-error>
          }
        </mat-form-field>

        <!-- Textarea -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="4"
                    placeholder="Enter product description"></textarea>
        </mat-form-field>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button mat-button type="button" (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isSaving()">
          @if (isSaving()) {
            <mat-spinner diameter="20"></mat-spinner>
          } @else {
            Save
          }
        </button>
      </div>
    </form>
  `,
  styles: [`
    .product-form {
      max-width: 600px;
      margin: 0 auto;
    }

    .form-section {
      margin-bottom: 2rem;
    }

    .form-section h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #0f172a;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .form-actions button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
    }
  `]
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ProductService);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;
  isSaving = signal(false);
  categories = ['mice', 'keyboards', 'headsets'];

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(1)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    // Load initial data if edit mode
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSaving.set(true);
    const formData = this.form.value;

    this.service.create(formData).subscribe({
      next: () => {
        this.snackBar.open('Product saved successfully', 'Close', { duration: 3000 });
        this.form.reset();
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to save product', 'Close', { duration: 5000 });
      },
      complete: () => this.isSaving.set(false)
    });
  }

  onCancel(): void {
    if (this.form.dirty) {
      if (confirm('Discard changes?')) {
        this.form.reset();
      }
    }
  }
}
```

### Dialog Pattern

```typescript
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// Dialog Component
@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div mat-dialog-container>
      <h2 mat-dialog-title>Confirm Deletion</h2>
      <mat-dialog-content>
        <p>Are you sure you want to delete this product?</p>
        <p>This action cannot be undone.</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="warn" (click)="onConfirm()">Delete</button>
      </mat-dialog-actions>
    </div>
  `
})
export class ConfirmDeleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

// Usage in Component
export class ProductListComponent {
  private dialog = inject(MatDialog);
  private service = inject(ProductService);

  onDelete(productId: string): void {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteProduct(productId);
      }
    });
  }

  private deleteProduct(productId: string): void {
    this.service.delete(productId).subscribe({
      next: () => {
        this.snackBar.open('Product deleted', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open('Failed to delete product', 'Close', { duration: 5000 });
      }
    });
  }
}
```

### Notification Pattern (MatSnackBar)

```typescript
// Success notification
this.snackBar.open('Сохранено успешно', 'Закрыть', {
  duration: 3000,
  panelClass: 'success-snackbar',
  horizontalPosition: 'end',
  verticalPosition: 'top'
});

// Error notification
this.snackBar.open('Ошибка при сохранении', 'Закрыть', {
  duration: 5000,
  panelClass: 'error-snackbar',
  horizontalPosition: 'end',
  verticalPosition: 'top'
});

// Custom action notification
this.snackBar.open('Product deleted', 'Undo', {
  duration: 5000,
}).onAction().subscribe(() => {
  // Handle undo action
});
```

---

## Form Validation Patterns

### Common Validators

```typescript
// Basic validators
email: ['', Validators.email]
password: ['', [Validators.required, Validators.minLength(8)]]
age: ['', [Validators.required, Validators.min(18), Validators.max(120)]]

// Pattern validators
slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]]
phone: ['', [Validators.pattern(/^[\d\s+()-]+$/)]]

// Conditional validators (use FormGroup validator)
```

### Custom Validators

```typescript
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

// Async validator for checking slug uniqueness
function slugValidator(service: ProductService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) {
      return of(null);
    }

    return service.checkSlugAvailable(control.value).pipe(
      map(available => available ? null : { 'slugTaken': true }),
      catchError(() => of(null))
    );
  };
}

// Usage
slug: ['', [Validators.required], [slugValidator(this.service)]]
```

### Display Validation Errors

```typescript
// Show error only if touched and invalid
@if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
  <mat-error>Email is required</mat-error>
}

@if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
  <mat-error>Invalid email format</mat-error>
}

// All errors for a field
@if (form.get('email')?.invalid && form.get('email')?.touched) {
  @for (error of getErrorMessages(form.get('email')); track error) {
    <mat-error>{{ error }}</mat-error>
  }
}
```

---

## Error Handling in Components

### Complete Error Handling Pattern

```typescript
export class ProductListComponent implements OnInit {
  private service = inject(ProductService);
  private snackBar = inject(MatSnackBar);

  items = signal<Product[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.service.list().subscribe({
      next: (response) => {
        // Validate response
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error('Invalid API response');
        }

        this.items.set(response.data);
      },
      error: (err: HttpErrorResponse) => {
        // Handle different error types
        let errorMessage = 'Failed to load products';

        if (err.status === 401) {
          errorMessage = 'Authentication required';
          // Redirect to login
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission';
        } else if (err.status === 404) {
          errorMessage = 'Products not found';
        } else if (err.status === 0) {
          errorMessage = 'Network error - check your connection';
        } else if (err.error?.error) {
          errorMessage = err.error.error;
        }

        this.error.set(errorMessage);
        this.items.set([]);

        // Log for debugging
        console.error('Error loading products:', err);

        // Show notification
        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }
}
```

---

## Loading States

### Spinner Pattern

```typescript
@if (isLoading()) {
  <div class="loading-container">
    <mat-spinner diameter="50"></mat-spinner>
    <p>Loading...</p>
  </div>
} @else {
  <!-- Content -->
}
```

### Button Loading State

```typescript
<button mat-raised-button color="primary" [disabled]="isSaving()">
  @if (isSaving()) {
    <mat-spinner diameter="20" style="margin-right: 0.5rem;"></mat-spinner>
    Saving...
  } @else {
    Save
  }
</button>
```

### Progress Bar Pattern

```typescript
@if (isUploading()) {
  <mat-progress-bar mode="determinate" [value]="uploadProgress()"></mat-progress-bar>
  <span>{{ uploadProgress() }}% uploaded</span>
}
```

---

## Responsive Design

### Mobile-First Breakpoints

```scss
// Mobile: < 640px
.grid {
  grid-template-columns: 1fr;
}

// Tablet: >= 640px
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

// Desktop: >= 1024px
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

// Large Desktop: >= 1280px
@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## Accessibility (A11y)

### ARIA Labels

```html
<!-- Buttons without text -->
<button mat-icon-button aria-label="Delete product">
  <mat-icon>delete</mat-icon>
</button>

<!-- Form inputs -->
<mat-form-field>
  <mat-label>Email Address</mat-label>
  <input matInput type="email" aria-label="Email address">
</mat-form-field>

<!-- Icons with meaning -->
<mat-icon aria-label="Loading">hourglass_empty</mat-icon>
```

### Keyboard Navigation

```html
<!-- Proper tab order -->
<button tabindex="0">Save</button>
<button tabindex="1">Cancel</button>

<!-- Dialog focus management -->
<mat-dialog-container cdkTrapFocus cdkTrapFocusAutoCapture>
  <!-- Content -->
</mat-dialog-container>
```

---

## Common Component Checklist

Before considering a component complete:

- [ ] Proper error handling with user-friendly messages
- [ ] Loading states displayed
- [ ] Form validation with helpful error messages
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Dark theme compatibility
- [ ] Uzbek translations for all labels
- [ ] ARIA labels for accessibility
- [ ] Proper Material component usage
- [ ] Signals for state management
- [ ] Service injected with `inject()`
- [ ] Proper TypeScript typing (no `any`)
- [ ] No console.log statements
- [ ] Unit tests written
- [ ] Prettier formatted

---

*Last updated: 2025-02-08*
*Maintained by: Development Team*
