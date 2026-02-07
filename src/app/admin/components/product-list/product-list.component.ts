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
      max-width: 1600px;
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
      font-size: 2rem;
      font-weight: 600;
      color: #0e4a6e;
      letter-spacing: 0.5px;
    }

    :host-context(.dark-theme) h1 {
      color: #cffafe;
    }

    .filter-card {
      margin-bottom: 1.5rem;
      padding: 1.25rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(14, 116, 144, 0.08);
      border: 1px solid rgba(14, 116, 144, 0.1);
    }

    :host-context(.dark-theme) .filter-card {
      background: linear-gradient(135deg, #0c2d48 0%, #0e3b5c 100%);
      border: 1px solid rgba(34, 211, 238, 0.1);
    }

    .search-field {
      width: 100%;
      max-width: 500px;
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
      padding: 4rem;
      text-align: center;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(14, 116, 144, 0.08);
    }

    :host-context(.dark-theme) .empty-card {
      background: linear-gradient(135deg, #0c2d48 0%, #0e3b5c 100%);
    }

    .empty-card mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #cbd5e1;
      margin-bottom: 1rem;
    }

    :host-context(.dark-theme) .empty-card mat-icon {
      color: rgba(255, 255, 255, 0.3);
    }

    .empty-card p {
      color: #64748b;
      font-size: 1.125rem;
      margin-bottom: 1.5rem;
    }

    :host-context(.dark-theme) .empty-card p {
      color: rgba(255, 255, 255, 0.7);
    }

    .table-card {
      overflow: hidden;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(14, 116, 144, 0.08);
      border: 1px solid rgba(14, 116, 144, 0.1);
    }

    :host-context(.dark-theme) .table-card {
      background: linear-gradient(135deg, #0c2d48 0%, #0e3b5c 100%);
      border: 1px solid rgba(34, 211, 238, 0.1);
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .product-thumbnail {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .no-image {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
      border-radius: 8px;
    }

    :host-context(.dark-theme) .no-image {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
    }

    .no-image mat-icon {
      color: #94a3b8;
    }

    .product-name {
      font-weight: 600;
      color: #0e4a6e;
      font-size: 0.95rem;
    }

    :host-context(.dark-theme) .product-name {
      color: white;
    }

    .product-slug {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    :host-context(.dark-theme) .product-slug {
      color: rgba(255, 255, 255, 0.5);
    }

    .category-badge {
      background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%);
      color: #155e75;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      text-transform: capitalize;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(14, 116, 144, 0.1);
    }

    :host-context(.dark-theme) .category-badge {
      background: linear-gradient(135deg, #0e7490 0%, #0891b2 100%);
      color: #cffafe;
    }

    .price {
      font-weight: 600;
      color: #0e4a6e;
      font-size: 0.95rem;
    }

    :host-context(.dark-theme) .price {
      color: white;
    }

    .old-price {
      font-size: 0.75rem;
      color: #94a3b8;
      text-decoration: line-through;
      margin-top: 0.125rem;
    }

    .status-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .status-badges mat-chip {
      font-size: 0.7rem;
      min-height: 26px;
      padding: 0 10px;
      font-weight: 600;
    }

    .in-stock {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%) !important;
      color: #065f46 !important;
    }

    .out-of-stock {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%) !important;
      color: #991b1b !important;
    }

    .featured {
      background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%) !important;
      color: #9a3412 !important;
    }

    .new {
      background: linear-gradient(135deg, #cffafe 0%, #a5f3fc 100%) !important;
      color: #155e75 !important;
    }

    .actions {
      display: flex;
      gap: 0.375rem;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .search-field {
        max-width: 100%;
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
