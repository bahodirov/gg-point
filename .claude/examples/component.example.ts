/**
 * COMPONENT TEMPLATES & EXAMPLES
 *
 * Use these as templates when creating new admin components.
 * Shows CRUD list component, form component, and dialog component patterns.
 */

import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject, takeUntil } from 'rxjs';

/**
 * ==============================================================================
 * EXAMPLE 1: LIST COMPONENT (Data Table with Pagination & Actions)
 * ==============================================================================
 *
 * Use this pattern for displaying lists of resources (products, users, etc.)
 * with pagination, sorting, and action buttons.
 */
@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="list-container">
      <div class="list-header">
        <h1>Products</h1>
        <button mat-raised-button color="primary" routerLink="/admin/products/new">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (error(); as err) {
        <mat-card class="error-card">
          <mat-card-content>
            {{ err }}
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="table-wrapper">
          <table mat-table [dataSource]="items()" matSort (matSortChange)="onSort($event)">
            <!-- ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let element">{{ element.id | slice: 0:8 }}</td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let element">{{ element.name.ru }}</td>
            </ng-container>

            <!-- Category Column -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
              <td mat-cell *matCellDef="let element">
                <span class="badge badge-info">{{ element.category }}</span>
              </td>
            </ng-container>

            <!-- Price Column -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
              <td mat-cell *matCellDef="let element">
                {{ element.price | number: '0,0' }} UZS
              </td>
            </ng-container>

            <!-- Stock Column -->
            <ng-container matColumnDef="stock">
              <th mat-header-cell *matHeaderCellDef>Stock</th>
              <td mat-cell *matCellDef="let element">
                @if (element.inStock) {
                  <span class="badge badge-success">In Stock</span>
                } @else {
                  <span class="badge badge-danger">Out of Stock</span>
                }
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let element">
                <button
                  mat-icon-button
                  [routerLink]="['/admin/products', element.id, 'edit']"
                  matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="warn"
                  (click)="onDelete(element.id)"
                  matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="total()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 25, 50, 100]"
          (page)="onPageChange($event)">
        </mat-paginator>
      }
    </div>
  `,
  styles: [`
    .list-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #0f172a;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .error-card {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .table-wrapper {
      overflow: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    table {
      width: 100%;
    }

    th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #1e293b;
      padding: 1rem;
      text-align: left;
      border-bottom: 2px solid #e2e8f0;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #f1f5f9;
    }

    tr:hover {
      background-color: #f8fafc;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .badge-success {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge-danger {
      background-color: #fee2e2;
      color: #991b1b;
    }

    mat-paginator {
      border-top: 1px solid #e2e8f0;
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  // Services
  private http = inject(HttpClient);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // State
  items = signal<any[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  total = signal(0);

  // Pagination & Sorting
  pageIndex = signal(0);
  pageSize = signal(10);
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Table config
  displayedColumns = ['id', 'name', 'category', 'price', 'stock', 'actions'];

  // Cleanup
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadData();
  }

  onSort(sort: Sort): void {
    this.sortBy.set(sort.active);
    this.sortOrder.set((sort.direction || 'desc') as 'asc' | 'desc');
    this.pageIndex.set(0);
    this.loadData();
  }

  onDelete(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogExample, {
      data: { title: 'Delete Product', message: 'Are you sure?' }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.deleteItem(id);
        }
      });
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<any>('/api/products', {
      params: {
        page: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        sortBy: this.sortBy(),
        order: this.sortOrder()
      }
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.items.set(response.data);
          this.total.set(response.total);
        },
        error: (err) => {
          this.error.set(err.error?.error || 'Failed to load products');
        },
        complete: () => this.isLoading.set(false)
      });
  }

  private deleteItem(id: string): void {
    this.http.delete(`/api/products/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.error || 'Failed to delete product',
            'Close',
            { duration: 5000, panelClass: 'error-snackbar' }
          );
        }
      });
  }
}

/**
 * ==============================================================================
 * EXAMPLE 2: FORM COMPONENT (Create/Edit)
 * ==============================================================================
 *
 * Use this pattern for forms that create or edit resources.
 * Includes validation, file uploads, and dynamic form arrays.
 */
@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
  ],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h1>{{ isEditMode() ? 'Edit Product' : 'Add New Product' }}</h1>
        <button mat-button routerLink="/admin/products">
          <mat-icon>arrow_back</mat-icon>
          Back
        </button>
      </div>

      @if (isLoading()) {
        <mat-spinner></mat-spinner>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Basic Info Section -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>Basic Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Product Name (Russian)</mat-label>
                <input matInput formControlName="name_ru" required>
                @if (form.get('name_ru')?.hasError('required') && form.get('name_ru')?.touched) {
                  <mat-error>Product name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Product Name (Uzbek)</mat-label>
                <input matInput formControlName="name_uz">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category" required>
                  @for (cat of categories; track cat) {
                    <mat-option [value]="cat">{{ cat | titlecase }}</mat-option>
                  }
                </mat-select>
                @if (form.get('category')?.hasError('required') && form.get('category')?.touched) {
                  <mat-error>Category is required</mat-error>
                }
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Pricing Section -->
          <mat-card class="form-section">
            <mat-card-header>
              <mat-card-title>Pricing</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="two-columns">
                <mat-form-field appearance="outline">
                  <mat-label>Price</mat-label>
                  <input matInput type="number" formControlName="price" required>
                  <mat-hint>UZS</mat-hint>
                  @if (form.get('price')?.hasError('required') && form.get('price')?.touched) {
                    <mat-error>Price is required</mat-error>
                  }
                  @if (form.get('price')?.hasError('min') && form.get('price')?.touched) {
                    <mat-error>Price must be positive</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Old Price (Optional)</mat-label>
                  <input matInput type="number" formControlName="old_price">
                </mat-form-field>
              </div>

              <div class="checkboxes">
                <mat-checkbox formControlName="in_stock">In Stock</mat-checkbox>
                <mat-checkbox formControlName="featured">Featured</mat-checkbox>
                <mat-checkbox formControlName="is_new">New</mat-checkbox>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Form Actions -->
          <div class="form-actions">
            <button mat-button type="button" routerLink="/admin/products">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isSaving()">
              @if (isSaving()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                {{ isEditMode() ? 'Save Changes' : 'Create Product' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
    }

    .form-section {
      margin-bottom: 1.5rem;
    }

    .full-width {
      width: 100%;
      margin-bottom: 1rem;
    }

    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .checkboxes {
      display: flex;
      gap: 2rem;
      margin-top: 1rem;
      padding: 1rem;
      background-color: #f8fafc;
      border-radius: 8px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .form-actions button {
      padding: 0.75rem 1.5rem;
    }

    @media (max-width: 640px) {
      .two-columns {
        grid-template-columns: 1fr;
      }

      .checkboxes {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit, OnDestroy {
  // Services
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  // Form
  form: FormGroup;

  // State
  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  productId = signal<string | null>(null);

  // Options
  categories = ['mice', 'keyboards', 'headsets', 'monitors'];

  // Cleanup
  private destroy$ = new Subject<void>();

  constructor() {
    this.form = this.fb.group({
      name_ru: ['', Validators.required],
      name_uz: [''],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      old_price: [null],
      in_stock: [true],
      featured: [false],
      is_new: [false]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSaving.set(true);
    const formData = this.form.value;

    const request = this.isEditMode()
      ? this.http.put(`/api/products/${this.productId()}`, formData)
      : this.http.post('/api/products', formData);

    request
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.isEditMode() ? 'Product updated' : 'Product created',
            'Close',
            { duration: 3000 }
          );
          this.router.navigate(['/admin/products']);
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.error || 'Failed to save product',
            'Close',
            { duration: 5000, panelClass: 'error-snackbar' }
          );
        },
        complete: () => this.isSaving.set(false)
      });
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);

    this.http.get<any>(`/api/products/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.form.patchValue({
            name_ru: response.data.name.ru,
            name_uz: response.data.name.uz,
            category: response.data.category,
            price: response.data.price,
            old_price: response.data.oldPrice,
            in_stock: response.data.inStock,
            featured: response.data.featured,
            is_new: response.data.isNew
          });
        },
        error: (err) => {
          this.snackBar.open(
            err.error?.error || 'Failed to load product',
            'Close',
            { duration: 5000 }
          );
          this.router.navigate(['/admin/products']);
        },
        complete: () => this.isLoading.set(false)
      });
  }
}

/**
 * ==============================================================================
 * EXAMPLE 3: DIALOG COMPONENT (Confirmation)
 * ==============================================================================
 *
 * Simple dialog for confirming destructive actions.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">Confirm</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogExample {
  dialogRef = inject(MatDialogRef<ConfirmDialogExample>);
  data: { title: string; message: string } = { title: '', message: '' };

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

/**
 * ==============================================================================
 * USAGE NOTES
 * ==============================================================================
 *
 * 1. IMPORTS:
 *    - All Material modules as needed
 *    - CommonModule for @if, @for, etc.
 *    - Standalone components
 *
 * 2. STATE MANAGEMENT:
 *    - Use Signals for reactive state
 *    - Computed for derived values
 *    - takeUntil(destroy$) for subscriptions
 *
 * 3. ERROR HANDLING:
 *    - Show spinner while loading
 *    - Display error message in card
 *    - Use snackbar for notifications
 *
 * 4. VALIDATION:
 *    - Reactive Forms (FormBuilder, FormGroup)
 *    - Display errors only if touched
 *    - Disable submit if form invalid
 *
 * 5. ROUTING:
 *    - Use routerLink for navigation
 *    - Use router.navigate() programmatically
 *    - Get params from ActivatedRoute
 *
 * 6. CLEANUP:
 *    - Implement OnDestroy
 *    - Use takeUntil(destroy$) for subscriptions
 *    - Call destroy$.next() in ngOnDestroy()
 */
