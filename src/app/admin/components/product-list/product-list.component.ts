import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

interface Product {
  id: string;
  slug: string;
  name: { ru: string; uz: string };
  description: { ru: string; uz: string };
  price: number;
  oldPrice?: number;
  category: string;
  images: string[];
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatPaginatorModule,
  ],
  template: `
    <div class="product-list">
      <div class="header">
        <h1>Products</h1>
        <button mat-raised-button color="primary" routerLink="/admin/products/new">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      <mat-card class="filter-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search products</mat-label>
          <input matInput [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Search by name...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
      </mat-card>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (filteredProducts().length === 0) {
        <mat-card class="empty-card">
          <mat-icon>inventory_2</mat-icon>
          <p>No products found</p>
          <button mat-raised-button color="primary" routerLink="/admin/products/new">
            Add Your First Product
          </button>
        </mat-card>
      } @else {
        <mat-card class="table-card">
          <div class="table-container">
            <table mat-table [dataSource]="paginatedProducts()">
              <!-- Image Column -->
              <ng-container matColumnDef="image">
                <th mat-header-cell *matHeaderCellDef>Image</th>
                <td mat-cell *matCellDef="let product">
                  @if (product.images?.length > 0) {
                    <img [src]="product.images[0]" [alt]="product.name.ru" class="product-thumbnail">
                  } @else {
                    <div class="no-image">
                      <mat-icon>image</mat-icon>
                    </div>
                  }
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let product">
                  <div class="product-name">{{ product.name.ru }}</div>
                  <div class="product-slug">{{ product.slug }}</div>
                </td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let product">
                  <span class="category-badge">{{ product.category }}</span>
                </td>
              </ng-container>

              <!-- Price Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let product">
                  <div class="price">{{ formatPrice(product.price) }}</div>
                  @if (product.oldPrice) {
                    <div class="old-price">{{ formatPrice(product.oldPrice) }}</div>
                  }
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let product">
                  <div class="status-badges">
                    @if (product.inStock) {
                      <span class="status-badge badge-in-stock">In Stock</span>
                    } @else {
                      <span class="status-badge badge-out-of-stock">Out of Stock</span>
                    }
                    @if (product.featured) {
                      <span class="status-badge badge-featured">Featured</span>
                    }
                    @if (product.isNew) {
                      <span class="status-badge badge-new">New</span>
                    }
                  </div>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let product">
                  <div class="actions">
                    <a mat-icon-button [routerLink]="['/admin/products', product.id, 'edit']" matTooltip="Edit">
                      <mat-icon>edit</mat-icon>
                    </a>
                    <button mat-icon-button class="delete-btn" (click)="deleteProduct(product)" matTooltip="Delete">
                      <mat-icon>delete</mat-icon>
                    </button>
                    <a mat-icon-button [href]="'/product/' + product.slug" target="_blank" matTooltip="View in store">
                      <mat-icon>visibility</mat-icon>
                    </a>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          <mat-paginator
            [length]="filteredProducts().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .product-list {
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 {
      margin: 0;
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
    }

    .filter-card {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .search-field {
      width: 100%;
      max-width: 480px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 5rem;
    }

    .table-card {
      overflow: hidden;
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      padding: 0;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    th.mat-mdc-header-cell {
      background-color: #f8fafc;
      color: #64748b;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }

    td.mat-mdc-cell {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      color: #0f172a;
    }

    tr.mat-mdc-row:hover {
      background-color: #f8fafc;
    }

    .product-thumbnail {
      width: 52px;
      height: 52px;
      object-fit: cover;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .no-image {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f1f5f9;
      border-radius: 12px;
      color: #94a3b8;
    }

    .product-name {
      font-weight: 700;
      color: #0f172a;
      font-size: 1rem;
    }

    .product-slug {
      font-size: 0.8125rem;
      color: #64748b;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    .category-badge {
      display: inline-block;
      background-color: #f1f5f9;
      color: #475569;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .price {
      font-weight: 700;
      color: #0f172a;
    }

    .old-price {
      font-size: 0.75rem;
      color: #94a3b8;
      text-decoration: line-through;
    }

    .status-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.125rem 0.5rem;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .badge-in-stock { background-color: #dcfce7; color: #166534; }
    .badge-out-of-stock { background-color: #fee2e2; color: #991b1b; }
    .badge-featured { background-color: #fef3c7; color: #92400e; }
    .badge-new { background-color: #e0f2fe; color: #075985; }

    .actions {
      display: flex;
      gap: 0.25rem;
    }

    .actions button, .actions a {
      color: #64748b;
    }

    .actions button:hover, .actions a:hover {
      color: #0ea5e9;
      background-color: #f0f9ff;
    }

    .actions button.delete-btn:hover {
      color: #ef4444;
      background-color: #fef2f2;
    }

    mat-paginator {
      background: transparent;
      border-top: 1px solid #e2e8f0;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['image', 'name', 'category', 'price', 'status', 'actions'];
  isLoading = signal(true);
  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  paginatedProducts = signal<Product[]>([]);

  searchQuery = '';
  pageSize = 10;
  pageIndex = 0;

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.http.get<Product[]>('/api/products').subscribe({
      next: (products) => {
        this.products.set(products);
        this.filteredProducts.set(products);
        this.updatePagination();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredProducts.set(this.products());
    } else {
      this.filteredProducts.set(
        this.products().filter(p =>
          p.name.ru.toLowerCase().includes(query) ||
          p.name.uz.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.slug.toLowerCase().includes(query)
        )
      );
    }

    this.pageIndex = 0;
    this.updatePagination();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePagination();
  }

  private updatePagination(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts.set(this.filteredProducts().slice(start, end));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0
    }).format(price);
  }

  deleteProduct(product: Product): void {
    if (!confirm(`Are you sure you want to delete "${product.name.ru}"?`)) {
      return;
    }

    this.http.delete(`/api/products/${product.id}`).subscribe({
      next: () => {
        this.products.update(products => products.filter(p => p.id !== product.id));
        this.onSearch(); // Re-apply filter
        this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to delete product', 'Close', { duration: 3000 });
      }
    });
  }
}
