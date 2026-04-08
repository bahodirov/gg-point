import { Component, inject, signal, OnInit, computed } from '@angular/core';
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
  currency?: string;
  category: string;
  images: string[];
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-5">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-white">Products</h1>
          <p class="text-gray-400 text-sm mt-0.5">{{ allProducts().length }} total products</p>
        </div>
        <a routerLink="/admin/products/new"
           class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Add Product
        </a>
      </div>

      <!-- Search & Filters -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearch()"
              placeholder="Search by name, category or slug..."
              class="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg pl-10 pr-4 py-2.5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <select
            [(ngModel)]="selectedCategory"
            (ngModelChange)="onSearch()"
            class="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
            <option value="">All categories</option>
            @for (cat of availableCategories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      } @else if (allProducts().length === 0) {
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-12 text-center">
          <div class="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <p class="text-white font-medium mb-1">No products yet</p>
          <p class="text-gray-400 text-sm mb-4">Get started by adding your first product</p>
          <a routerLink="/admin/products/new"
             class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Add First Product
          </a>
        </div>
      } @else {

        <!-- Table -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider w-14">Image</th>
                  <th class="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      (click)="setSort('name')">
                    <div class="flex items-center gap-1.5">
                      Name
                      @if (sortField() === 'name') {
                        <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                [attr.d]="sortDir() === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"/>
                        </svg>
                      }
                    </div>
                  </th>
                  <th class="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      (click)="setSort('category')">
                    <div class="flex items-center gap-1.5">
                      Category
                      @if (sortField() === 'category') {
                        <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                [attr.d]="sortDir() === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"/>
                        </svg>
                      }
                    </div>
                  </th>
                  <th class="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                      (click)="setSort('price')">
                    <div class="flex items-center gap-1.5">
                      Price
                      @if (sortField() === 'price') {
                        <svg class="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                [attr.d]="sortDir() === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"/>
                        </svg>
                      }
                    </div>
                  </th>
                  <th class="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-700">
                @if (paginatedProducts().length === 0) {
                  <tr>
                    <td colspan="6" class="text-center py-10 text-gray-500">No products match your search</td>
                  </tr>
                }
                @for (product of paginatedProducts(); track product.id) {
                  <tr class="hover:bg-gray-700/50 transition-colors">
                    <td class="px-4 py-3">
                      @if (product.images && product.images.length > 0) {
                        <img [src]="product.images[0]" [alt]="product.name.ru"
                             class="w-11 h-11 object-cover rounded-lg bg-gray-700">
                      } @else {
                        <div class="w-11 h-11 rounded-lg bg-gray-700 flex items-center justify-center">
                          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                      }
                    </td>
                    <td class="px-4 py-3">
                      <p class="text-white font-medium leading-tight">{{ product.name.ru }}</p>
                      <p class="text-gray-500 text-xs mt-0.5">{{ product.slug }}</p>
                    </td>
                    <td class="px-4 py-3">
                      <span class="text-gray-300 capitalize text-xs bg-gray-700 px-2.5 py-1 rounded-full">
                        {{ product.category }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <p class="text-white font-medium">{{ formatPrice(product.price, product.currency) }}</p>
                      @if (product.oldPrice) {
                        <p class="text-gray-500 text-xs line-through">{{ formatPrice(product.oldPrice) }}</p>
                      }
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex flex-wrap gap-1.5">
                        @if (product.inStock) {
                          <span class="text-xs font-medium bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">In Stock</span>
                        } @else {
                          <span class="text-xs font-medium bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Out of Stock</span>
                        }
                        @if (product.featured) {
                          <span class="text-xs font-medium bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">Featured</span>
                        }
                        @if (product.isNew) {
                          <span class="text-xs font-medium bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">New</span>
                        }
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex items-center justify-end gap-1">
                        <a [routerLink]="['/admin/products', product.id, 'edit']"
                           class="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"
                           title="Edit">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </a>
                        <a [href]="'/product/' + product.slug" target="_blank"
                           class="p-1.5 rounded-lg text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-colors"
                           title="View in store">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </a>
                        <button (click)="openDeleteModal(product)"
                                class="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"
                                title="Delete">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="flex items-center justify-between px-5 py-3.5 border-t border-gray-700">
              <p class="text-sm text-gray-400">
                Showing {{ (currentPage() - 1) * pageSize() + 1 }}–{{ minOf(currentPage() * pageSize(), filteredProducts().length) }} of {{ filteredProducts().length }}
              </p>
              <div class="flex items-center gap-1">
                <button (click)="prevPage()" [disabled]="currentPage() === 1"
                        class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                @for (page of pageNumbers(); track page) {
                  <button (click)="goToPage(page)"
                          class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                          [ngClass]="page === currentPage() ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'">
                    {{ page }}
                  </button>
                }
                <button (click)="nextPage()" [disabled]="currentPage() === totalPages()"
                        class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Delete Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" (click)="closeDeleteModal()"></div>
          <div class="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-white font-semibold">Delete Product</h3>
                <p class="text-gray-400 text-sm mt-1">
                  Are you sure you want to delete <span class="text-white font-medium">"{{ productToDelete()?.name?.ru }}"</span>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <button (click)="closeDeleteModal()"
                      class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                Cancel
              </button>
              <button (click)="confirmDelete()"
                      [disabled]="isDeleting()"
                      class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2">
                @if (isDeleting()) {
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Deleting...
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Delete
                }
              </button>
            </div>
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
  isDeleting = signal(false);
  allProducts = signal<Product[]>([]);
  showDeleteModal = signal(false);
  productToDelete = signal<Product | null>(null);

  searchQuery = '';
  selectedCategory = '';
  sortField = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');
  currentPage = signal(1);
  pageSize = signal(10);

  filteredProducts = computed(() => {
    const q = this.searchQuery.toLowerCase();
    const cat = this.selectedCategory;
    let list = this.allProducts();

    if (q) {
      list = list.filter(p =>
        p.name.ru.toLowerCase().includes(q) ||
        p.name.uz.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    }

    if (cat) {
      list = list.filter(p => p.category === cat);
    }

    const field = this.sortField();
    if (field) {
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        let aVal: string | number = '';
        let bVal: string | number = '';
        if (field === 'name') { aVal = a.name.ru; bVal = b.name.ru; }
        else if (field === 'price') { aVal = a.price; bVal = b.price; }
        else if (field === 'category') { aVal = a.category; bVal = b.category; }
        return aVal > bVal ? dir : aVal < bVal ? -dir : 0;
      });
    }

    return list;
  });

  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.pageSize()));

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  availableCategories = computed(() => {
    const cats = new Set(this.allProducts().map(p => p.category));
    return Array.from(cats).sort();
  });

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.http.get<Product[]>('/api/products').subscribe({
      next: (products) => {
        this.allProducts.set(products);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
  }

  setSort(field: string): void {
    if (this.sortField() === field) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  openDeleteModal(product: Product): void {
    this.productToDelete.set(product);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    if (!this.isDeleting()) {
      this.showDeleteModal.set(false);
      this.productToDelete.set(null);
    }
  }

  confirmDelete(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.isDeleting.set(true);
    this.http.delete(`/api/products/${product.id}`).subscribe({
      next: () => {
        this.allProducts.update(list => list.filter(p => p.id !== product.id));
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.productToDelete.set(null);
      },
      error: () => {
        this.isDeleting.set(false);
        alert('Failed to delete product');
      }
    });
  }

  minOf(a: number, b: number): number {
    return Math.min(a, b);
  }

  formatPrice(price: number, currency: string = 'UZS'): string {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'USD' ? 2 : 0
    }).format(price);
  }
}
