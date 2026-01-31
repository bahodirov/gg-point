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
                      <mat-chip class="in-stock">In Stock</mat-chip>
                    } @else {
                      <mat-chip class="out-of-stock">Out of Stock</mat-chip>
                    }
                    @if (product.featured) {
                      <mat-chip class="featured">Featured</mat-chip>
                    }
                    @if (product.isNew) {
                      <mat-chip class="new">New</mat-chip>
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
                    <button mat-icon-button color="warn" (click)="deleteProduct(product)" matTooltip="Delete">
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
      margin-bottom: 1.5rem;
    }

    h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .filter-card {
      margin-bottom: 1rem;
      padding: 1rem;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .empty-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 3rem;
      text-align: center;
    }

    .empty-card mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 1rem;
    }

    .table-card {
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .product-thumbnail {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 4px;
    }

    .no-image {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .no-image mat-icon {
      color: #ccc;
    }

    .product-name {
      font-weight: 500;
    }

    .product-slug {
      font-size: 0.75rem;
      color: #666;
    }

    .category-badge {
      background: #e3f2fd;
      color: #1976d2;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      text-transform: capitalize;
    }

    .price {
      font-weight: 500;
    }

    .old-price {
      font-size: 0.75rem;
      color: #999;
      text-decoration: line-through;
    }

    .status-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
    }

    .status-badges mat-chip {
      font-size: 0.7rem;
      min-height: 24px;
      padding: 0 8px;
    }

    .in-stock {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .out-of-stock {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }

    .featured {
      background-color: #fff3e0 !important;
      color: #ef6c00 !important;
    }

    .new {
      background-color: #e3f2fd !important;
      color: #1565c0 !important;
    }

    .actions {
      display: flex;
      gap: 0.25rem;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
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
