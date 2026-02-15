import { Component, inject, signal, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DeleteConfirmDialogComponent } from '../shared/delete-confirm-dialog/delete-confirm-dialog.component';

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
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  template: `
    <div style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 400;">Products</h1>
        <a mat-raised-button color="primary" routerLink="/admin/products/new">
          <mat-icon style="margin-right: 8px;">add</mat-icon>
          Add Product
        </a>
      </div>

      <mat-form-field appearance="outline" style="width: 100%; max-width: 500px; margin-bottom: 16px;">
        <mat-label>Search products</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Search by name, category, or slug">
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>

      @if (isLoading()) {
        <div style="display: flex; justify-content: center; padding: 48px;">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (dataSource.data.length === 0) {
        <div style="text-align: center; padding: 48px;">
          <mat-icon style="font-size: 64px; width: 64px; height: 64px; color: rgba(255, 255, 255, 0.3); margin-bottom: 16px;">inventory_2</mat-icon>
          <p style="font-size: 18px; margin-bottom: 16px;">No products found</p>
          <a mat-raised-button color="primary" routerLink="/admin/products/new">Add Your First Product</a>
        </div>
      } @else {
        <div style="overflow-x: auto;">
          <table mat-table [dataSource]="dataSource" matSort style="width: 100%;">
            <!-- Image Column -->
            <ng-container matColumnDef="image">
              <th mat-header-cell *matHeaderCellDef>Image</th>
              <td mat-cell *matCellDef="let product">
                @if (product.images && product.images.length > 0) {
                  <img [src]="product.images[0]" [alt]="product.name.ru"
                       style="width: 52px; height: 52px; object-fit: cover; border-radius: 4px;">
                } @else {
                  <span style="color: rgba(255, 255, 255, 0.5);">No image</span>
                }
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
              <td mat-cell *matCellDef="let product">
                <div style="font-weight: 500;">{{ product.name.ru }}</div>
                <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">{{ product.slug }}</div>
              </td>
            </ng-container>

            <!-- Category Column -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
              <td mat-cell *matCellDef="let product" style="text-transform: capitalize;">
                {{ product.category }}
              </td>
            </ng-container>

            <!-- Price Column -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
              <td mat-cell *matCellDef="let product">
                <div style="font-weight: 500;">{{ formatPrice(product.price) }}</div>
                @if (product.oldPrice) {
                  <div style="font-size: 12px; color: rgba(255, 255, 255, 0.5); text-decoration: line-through;">
                    {{ formatPrice(product.oldPrice) }}
                  </div>
                }
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let product">
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  @if (product.inStock) {
                    <span style="background-color: rgba(76, 175, 80, 0.2); color: #4caf50; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">In Stock</span>
                  } @else {
                    <span style="background-color: rgba(244, 67, 54, 0.2); color: #f44336; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Out of Stock</span>
                  }
                  @if (product.featured) {
                    <span style="background-color: rgba(33, 150, 243, 0.2); color: #2196f3; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Featured</span>
                  }
                  @if (product.isNew) {
                    <span style="background-color: rgba(156, 39, 176, 0.2); color: #9c27b0; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">New</span>
                  }
                </div>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let product">
                <button mat-icon-button [routerLink]="['/admin/products', product.id, 'edit']" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteProduct(product)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
                <a mat-icon-button [href]="'/product/' + product.slug" target="_blank" matTooltip="View in store">
                  <mat-icon>visibility</mat-icon>
                </a>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </div>

        <mat-paginator [pageSizeOptions]="[10, 25, 50]"
                       showFirstLastButtons
                       style="margin-top: 16px;">
        </mat-paginator>
      }
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .mat-sort-header-arrow {
        transform: scale(0.5) !important;
        margin: 0 4px !important;
      }

      .mat-sort-header-container {
        align-items: center;
      }
    }
  `]
})
export class ProductListComponent implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  isLoading = signal(true);
  dataSource = new MatTableDataSource<Product>([]);
  displayedColumns: string[] = ['image', 'name', 'category', 'price', 'status', 'actions'];

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter to search in multilingual fields
    this.dataSource.filterPredicate = (data: Product, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.name.ru.toLowerCase().includes(searchStr) ||
             data.name.uz.toLowerCase().includes(searchStr) ||
             data.category.toLowerCase().includes(searchStr) ||
             data.slug.toLowerCase().includes(searchStr);
    };
  }

  private loadProducts(): void {
    this.http.get<Product[]>('/api/products').subscribe({
      next: (products) => {
        this.dataSource.data = products;
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        alert('Failed to load products');
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      maximumFractionDigits: 0
    }).format(price);
  }

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: { productName: product.name.ru },
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.http.delete(`/api/products/${product.id}`).subscribe({
          next: () => {
            this.dataSource.data = this.dataSource.data.filter(p => p.id !== product.id);
            alert('Product deleted successfully');
          },
          error: () => {
            alert('Failed to delete product');
          }
        });
      }
    });
  }
}
