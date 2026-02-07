import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
  ],
  template: `
    <div>
      <div>
        <h1>Products</h1>
        <a routerLink="/admin/products/new">Add Product</a>
      </div>

      <div>
        <label for="search">Search products</label>
        <input id="search" [(ngModel)]="searchQuery" (input)="onSearch()" placeholder="Search by name...">
      </div>

      @if (isLoading()) {
        <div>
          <p>Loading...</p>
        </div>
      } @else if (filteredProducts().length === 0) {
        <div>
          <p>No products found</p>
          <a routerLink="/admin/products/new">Add Your First Product</a>
        </div>
      } @else {
        <div>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (product of paginatedProducts(); track product.id) {
                <tr>
                  <td>
                    @if (product.images && product.images.length > 0) {
                      <img [src]="product.images[0]" [alt]="product.name.ru" width="52" height="52">
                    } @else {
                      <span>No image</span>
                    }
                  </td>
                  <td>
                    <div>{{ product.name.ru }}</div>
                    <div>{{ product.slug }}</div>
                  </td>
                  <td>{{ product.category }}</td>
                  <td>
                    <div>{{ formatPrice(product.price) }}</div>
                    @if (product.oldPrice) {
                      <div><s>{{ formatPrice(product.oldPrice) }}</s></div>
                    }
                  </td>
                  <td>
                    @if (product.inStock) {
                      <span>In Stock</span>
                    } @else {
                      <span>Out of Stock</span>
                    }
                    @if (product.featured) {
                      <span>Featured</span>
                    }
                    @if (product.isNew) {
                      <span>New</span>
                    }
                  </td>
                  <td>
                    <a [routerLink]="['/admin/products', product.id, 'edit']">Edit</a>
                    <button (click)="deleteProduct(product)">Delete</button>
                    <a [href]="'/product/' + product.slug" target="_blank">View</a>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <div>
            <span>Page {{ pageIndex + 1 }} of {{ totalPages() }}</span>
            <button (click)="prevPage()" [disabled]="pageIndex === 0">Previous</button>
            <button (click)="nextPage()" [disabled]="pageIndex >= totalPages() - 1">Next</button>
            <select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
              <option [value]="10">10 per page</option>
              <option [value]="25">25 per page</option>
              <option [value]="50">50 per page</option>
            </select>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class ProductListComponent implements OnInit {
  private http = inject(HttpClient);

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
        alert('Failed to load products');
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

  totalPages(): number {
    return Math.ceil(this.filteredProducts().length / this.pageSize);
  }

  prevPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.pageIndex < this.totalPages() - 1) {
      this.pageIndex++;
      this.updatePagination();
    }
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.pageIndex = 0;
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
        alert('Product deleted successfully');
      },
      error: () => {
        alert('Failed to delete product');
      }
    });
  }
}
