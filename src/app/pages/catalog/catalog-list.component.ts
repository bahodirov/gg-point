import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { ProductService } from '../../shared/services/product.service';
import { RecentlyViewedService } from '../../shared/services/recently-viewed.service';
import { SeoService } from '../../shared/services/seo.service';
import { Product, ProductCategory } from '../../shared/models/product.model';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    TranslateModule,
    ProductCardComponent,
    TelegramButtonComponent
  ],
  template: `
    <div class="catalog-page">
      <div class="container mx-auto px-4 py-8">
        <!-- Page Header -->
        <div class="mb-6">
          <h1 class="page-title">{{ 'catalog.title' | translate }}</h1>
          <p class="page-subtitle">{{ 'catalog.found' | translate }}: {{ filteredProducts().length }}</p>
        </div>

        <!-- Active filter tags -->
        @if (activeFilterTags().length > 0) {
          <div class="filter-tags">
            @for (tag of activeFilterTags(); track tag.key) {
              <span class="filter-tag">
                {{ tag.label | translate }}
                <button (click)="removeFilterTag(tag.key)" class="filter-tag-remove">×</button>
              </span>
            }
            <button class="filter-reset-link" (click)="resetFilters()">
              {{ 'catalog.resetAll' | translate }}
            </button>
          </div>
        }

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <!-- Filters Sidebar -->
          <aside class="lg:col-span-1">
            <div class="filter-panel sticky top-20">
              <h2 class="filter-title">{{ 'catalog.filters' | translate }}</h2>

              <!-- Search -->
              <div class="mb-5 search-wrap">
                <input class="price-input" type="text" [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" [placeholder]="'catalog.searchPlaceholder' | translate">
                <mat-icon class="search-icon">search</mat-icon>
              </div>

              <!-- Category Filter -->
              <div class="mb-5">
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {{ 'catalog.category' | translate }}
                </label>
                <mat-form-field appearance="outline" class="w-full">
                  <mat-select [(value)]="selectedCategory" (selectionChange)="applyFilters()">
                    <mat-option value="">{{ 'catalog.allCategories' | translate }}</mat-option>
                    @for (category of categories; track category.id) {
                      <mat-option [value]="category.slug">{{ category.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              </div>

              <!-- Brand Filter -->
              @if (brands.length > 0) {
                <div class="mb-5">
                  <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    {{ 'catalog.brand' | translate }}
                  </label>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-select [(value)]="selectedBrand" (selectionChange)="applyFilters()">
                      <mat-option value="">{{ 'catalog.allBrands' | translate }}</mat-option>
                      @for (brand of brands; track brand) {
                        <mat-option [value]="brand">{{ brand }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                </div>
              }

              <!-- Price Range -->
              <div class="mb-5">
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {{ 'catalog.priceRange' | translate }}
                </label>
                <div class="price-range-row">
                  <input class="price-input" type="number" [(ngModel)]="minPriceInput" (blur)="applyFilters()" placeholder="Min">
                  <span class="price-sep">—</span>
                  <input class="price-input" type="number" [(ngModel)]="maxPriceInput" (blur)="applyFilters()" placeholder="Max">
                </div>
                <button mat-stroked-button class="w-full text-sm" (click)="applyFilters()">
                  {{ 'catalog.applyPrice' | translate }}
                </button>
              </div>

              <!-- Checkboxes -->
              <div class="space-y-3 mb-5">
                <mat-checkbox [(ngModel)]="inStockOnly" (change)="applyFilters()" class="text-gray-700 dark:text-gray-300 block">
                  {{ 'catalog.inStock' | translate }}
                </mat-checkbox>
                <mat-checkbox [(ngModel)]="discountOnly" (change)="applyFilters()" class="text-gray-700 dark:text-gray-300 block">
                  {{ 'catalog.discountOnly' | translate }}
                </mat-checkbox>
              </div>

              <!-- Reset Button -->
              <button mat-raised-button color="primary" class="w-full" (click)="resetFilters()">
                <mat-icon>refresh</mat-icon>
                {{ 'catalog.resetFilters' | translate }}
              </button>
            </div>
          </aside>

          <!-- Products Area -->
          <main class="lg:col-span-3">
            <!-- Sort + View Toggle Bar -->
            <div class="sort-bar">
              <span class="text-gray-700 dark:text-gray-300 font-medium text-sm">
                {{ 'catalog.found' | translate }}: <strong>{{ filteredProducts().length }}</strong>
              </span>
              <div class="flex items-center gap-3">
                <!-- Sort -->
                <mat-form-field appearance="outline" class="sort-field" subscriptSizing="dynamic">
                  <mat-select [(value)]="sortBy" (selectionChange)="applySort()">
                    <mat-option value="default">{{ 'catalog.sortOptions.default' | translate }}</mat-option>
                    <mat-option value="priceLow">{{ 'catalog.sortOptions.priceLow' | translate }}</mat-option>
                    <mat-option value="priceHigh">{{ 'catalog.sortOptions.priceHigh' | translate }}</mat-option>
                    <mat-option value="nameAZ">{{ 'catalog.sortOptions.nameAZ' | translate }}</mat-option>
                    <mat-option value="nameZA">{{ 'catalog.sortOptions.nameZA' | translate }}</mat-option>
                    <mat-option value="newest">{{ 'catalog.sortOptions.newest' | translate }}</mat-option>
                    <mat-option value="popular">{{ 'catalog.sortOptions.popular' | translate }}</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- View toggle -->
                <div class="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                  <button class="view-toggle-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
                    <mat-icon>grid_view</mat-icon>
                  </button>
                  <button class="view-toggle-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
                    <mat-icon>view_list</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Products -->
            @if (pagedProducts().length > 0) {
              @if (viewMode === 'grid') {
                <div class="products-grid">
                  @for (product of pagedProducts(); track product.id) {
                    <app-product-card [product]="product"></app-product-card>
                  }
                </div>
              } @else {
                <div class="list-view">
                  @for (product of pagedProducts(); track product.id) {
                    <div class="list-card">
                      <a [routerLink]="['/product', product.id]">
                        <img [src]="product.thumbnail" [alt]="product.name" class="list-img">
                      </a>
                      <div class="list-info">
                        <a [routerLink]="['/product', product.id]" class="list-name">{{ product.name }}</a>
                        <p class="list-desc">{{ product.description }}</p>
                        <div class="list-footer">
                          <div>
                            @if (product.originalPrice && product.originalPrice > product.price) {
                              <span class="list-price-old">{{ product.originalPrice | number:'1.0-0' }} UZS</span>
                            }
                            <span class="list-price">{{ product.price | number:'1.0-0' }} UZS</span>
                          </div>
                          <a [routerLink]="['/product', product.id]" class="list-view-btn">
                            {{ 'common.viewMore' | translate }}
                          </a>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- Pagination -->
              @if (totalPages() > 1) {
                <div class="flex justify-center items-center gap-2 mt-8">
                  <button mat-icon-button [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
                    <mat-icon>chevron_left</mat-icon>
                  </button>
                  @for (page of pageNumbers(); track page) {
                    <button mat-mini-fab
                            [color]="page === currentPage ? 'primary' : undefined"
                            class="page-btn"
                            [class.active-page]="page === currentPage"
                            (click)="goToPage(page)">
                      {{ page }}
                    </button>
                  }
                  <button mat-icon-button [disabled]="currentPage === totalPages()" (click)="goToPage(currentPage + 1)">
                    <mat-icon>chevron_right</mat-icon>
                  </button>
                </div>
              }
            } @else {
              <div class="empty-state">
                <mat-icon>inventory_2</mat-icon>
                <p>{{ 'catalog.noProducts' | translate }}</p>
                <button mat-raised-button color="primary" (click)="resetFilters()">
                  {{ 'catalog.resetFilters' | translate }}
                </button>
              </div>
            }

            <!-- Recently Viewed -->
            @if (recentlyViewedProducts().length > 0) {
              <section class="mt-10">
                <h2 class="section-subtitle">{{ 'catalog.recentlyViewed' | translate }}</h2>
                <div class="products-grid-4">
                  @for (product of recentlyViewedProducts(); track product.id) {
                    <app-product-card [product]="product"></app-product-card>
                  }
                </div>
              </section>
            }
          </main>
        </div>
      </div>

      <app-telegram-button [floating]="true"></app-telegram-button>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-form-field { width: 100%; }

    /* Page */
    .catalog-page { background: #080c18; min-height: 100vh; }
    .page-title   { font-size: 2rem; font-weight: 900; color: #e2e8f0; margin-bottom: 4px; }
    .page-subtitle { font-size: 0.875rem; color: #7c8db5; }

    /* Filter tags */
    .filter-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; align-items: center; }
    .filter-tag {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25);
      color: #93c5fd; padding: 4px 10px; border-radius: 20px; font-size: 12px;
    }
    .filter-tag-remove {
      background: none; border: none; cursor: pointer;
      color: #7c8db5; font-size: 16px; line-height: 1; padding: 0;
      transition: color 0.2s;
    }
    .filter-tag-remove:hover { color: #f87171; }
    .filter-reset-link {
      background: none; border: none; cursor: pointer;
      color: #7c8db5; font-size: 12px; text-decoration: underline;
      transition: color 0.2s;
    }
    .filter-reset-link:hover { color: #f87171; }

    /* Filter panel */
    .filter-panel {
      background: #0d1426;
      border: 1px solid rgba(59,130,246,0.12);
      border-radius: 14px;
      padding: 20px;
    }
    .filter-title { font-size: 1rem; font-weight: 700; color: #e2e8f0; margin-bottom: 16px; }

    /* Sort bar */
    .sort-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      background: #0d1426;
      border: 1px solid rgba(59,130,246,0.12);
      border-radius: 12px;
      padding: 12px 16px;
      gap: 12px;
    }
    .sort-bar span { font-size: 13px; color: #7c8db5; }
    .sort-bar strong { color: #e2e8f0; }

    .sort-field {
      min-width: 190px;
      margin: 0 !important;
    }

    .price-range-row {
      display: flex; align-items: center; gap: 8px;
    }
    .price-input {
      flex: 1; min-width: 0;
      background: #111c35; color: #e2e8f0;
      border: 1px solid rgba(59,130,246,0.25);
      border-radius: 10px; padding: 9px 10px;
      font-size: 14px; outline: none;
      -moz-appearance: textfield;
    }
    .price-input::-webkit-outer-spin-button,
    .price-input::-webkit-inner-spin-button { -webkit-appearance: none; }
    .price-input:focus { border-color: #3b82f6; }
    .price-input::placeholder { color: #4b5880; }
    .price-sep { color: #4b5880; flex-shrink: 0; }

    /* View toggle */
    .view-toggle-btn {
      background: none; border: none; padding: 6px 10px;
      cursor: pointer; display: flex; align-items: center;
      color: #7c8db5; transition: all 0.2s; border-radius: 6px;
    }
    .view-toggle-btn.active { background: #3b82f6; color: white; }
    .view-toggle-btn:hover:not(.active) { background: rgba(59,130,246,0.1); color: #60a5fa; }

    /* Products grid */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 16px;
    }
    @media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1280px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }

    .products-grid-4 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (min-width: 768px)  { .products-grid-4 { grid-template-columns: repeat(3, 1fr); } }
    @media (min-width: 1280px) { .products-grid-4 { grid-template-columns: repeat(4, 1fr); } }

    /* List view */
    .list-view { display: flex; flex-direction: column; gap: 12px; }
    .list-card {
      display: flex; gap: 14px;
      background: #0d1426; border: 1px solid rgba(59,130,246,0.1);
      border-radius: 12px; padding: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .list-card:hover { border-color: rgba(59,130,246,0.3); box-shadow: 0 4px 16px rgba(59,130,246,0.1); }
    .list-img { width: 88px; height: 88px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .list-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
    .list-name {
      font-size: 14px; font-weight: 700; color: #e2e8f0;
      text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      transition: color 0.2s;
    }
    .list-name:hover { color: #60a5fa; }
    .list-desc {
      font-size: 12px; color: #7c8db5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .list-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; flex-wrap: wrap; gap: 8px; }
    .list-price-old { font-size: 11px; color: #64748b; text-decoration: line-through; margin-right: 6px; }
    .list-price { font-size: 15px; font-weight: 800; color: #60a5fa; }
    .list-view-btn {
      display: inline-flex; align-items: center;
      padding: 5px 14px;
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.25);
      border-radius: 7px; color: #93c5fd; text-decoration: none;
      font-size: 12px; font-weight: 600; transition: all 0.2s;
    }
    .list-view-btn:hover { background: rgba(59,130,246,0.2); }

    /* Empty state */
    .empty-state {
      text-align: center; padding: 64px 24px;
      background: #0d1426; border: 1px solid rgba(59,130,246,0.1); border-radius: 14px;
      color: #7c8db5;
    }
    .empty-state mat-icon { font-size: 56px; width: 56px; height: 56px; display: block; margin: 0 auto 12px; }
    .empty-state p { font-size: 1rem; margin-bottom: 16px; }

    /* Pagination */
    .page-btn { min-width: 36px !important; width: 36px !important; height: 36px !important; }

    /* Section subtitle */
    .section-subtitle { font-size: 1.1rem; font-weight: 700; color: #e2e8f0; margin-bottom: 16px; }
  `]
})
export class CatalogListComponent implements OnInit {
  private productService = inject(ProductService);
  private recentlyViewedService = inject(RecentlyViewedService);
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);

  allProducts: Product[] = [];
  filteredProducts = signal<Product[]>([]);
  categories: ProductCategory[] = [];
  brands: string[] = [];
  viewMode: 'grid' | 'list' = 'grid';

  selectedCategory = '';
  selectedBrand = '';
  searchQuery = '';
  minPriceInput: number | null = null;
  maxPriceInput: number | null = null;
  inStockOnly = false;
  discountOnly = false;
  newOnly = false;
  sortBy = 'default';
  currentPage = 1;

  pagedProducts = computed(() => {
    const start = (this.currentPage - 1) * PAGE_SIZE;
    return this.filteredProducts().slice(start, start + PAGE_SIZE);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / PAGE_SIZE)));

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage;
    const pages: number[] = [];
    const range = 2;
    for (let i = Math.max(1, current - range); i <= Math.min(total, current + range); i++) {
      pages.push(i);
    }
    return pages;
  });

  recentlyViewedProducts = computed(() => {
    const ids = this.recentlyViewedService.ids();
    return ids.map(id => this.productService.getProductById(id)).filter(Boolean) as Product[];
  });

  activeFilterTags = computed(() => {
    const tags: { key: string; label: string }[] = [];
    if (this.selectedCategory) tags.push({ key: 'category', label: this.selectedCategory });
    if (this.selectedBrand) tags.push({ key: 'brand', label: this.selectedBrand });
    if (this.searchQuery) tags.push({ key: 'search', label: `"${this.searchQuery}"` });
    if (this.inStockOnly) tags.push({ key: 'inStock', label: 'catalog.inStock' });
    if (this.discountOnly) tags.push({ key: 'discount', label: 'catalog.discountOnly' });
    if (this.minPriceInput) tags.push({ key: 'minPrice', label: `≥ ${this.minPriceInput.toLocaleString()} UZS` });
    if (this.maxPriceInput) tags.push({ key: 'maxPrice', label: `≤ ${this.maxPriceInput.toLocaleString()} UZS` });
    return tags;
  });

  ngOnInit(): void {
    this.loadData();
    this.updateSEO();
    this.route.queryParams.subscribe(params => {
      if (params['category']) this.selectedCategory = params['category'];
      if (params['discount']) this.discountOnly = true;
      if (params['new']) this.newOnly = true;
      if (params['brand']) this.selectedBrand = params['brand'];
      this.applyFilters();
    });
  }

  private loadData(): void {
    this.allProducts = this.productService.products();
    this.categories = this.productService.categories();
    this.brands = this.productService.getBrands();
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    if (this.selectedCategory) {
      filtered = filtered.filter(p =>
        p.category.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    if (this.selectedBrand) {
      filtered = filtered.filter(p => p.brand === this.selectedBrand);
    }

    if (this.minPriceInput != null) {
      filtered = filtered.filter(p => p.price >= this.minPriceInput!);
    }
    if (this.maxPriceInput != null) {
      filtered = filtered.filter(p => p.price <= this.maxPriceInput!);
    }

    if (this.inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    if (this.discountOnly) {
      filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    if (this.newOnly) {
      filtered = filtered.filter(p => p.isNew);
    }

    this.filteredProducts.set(filtered);
    this.currentPage = 1;
    this.applySort();
  }

  applySort(): void {
    let sorted = [...this.filteredProducts()];
    switch (this.sortBy) {
      case 'priceLow': sorted.sort((a, b) => a.price - b.price); break;
      case 'priceHigh': sorted.sort((a, b) => b.price - a.price); break;
      case 'nameAZ': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'nameZA': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'newest': sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'popular': sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }
    this.filteredProducts.set(sorted);
  }

  removeFilterTag(key: string): void {
    switch (key) {
      case 'category': this.selectedCategory = ''; break;
      case 'brand': this.selectedBrand = ''; break;
      case 'search': this.searchQuery = ''; break;
      case 'inStock': this.inStockOnly = false; break;
      case 'discount': this.discountOnly = false; break;
      case 'minPrice': this.minPriceInput = null; break;
      case 'maxPrice': this.maxPriceInput = null; break;
    }
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.searchQuery = '';
    this.minPriceInput = null;
    this.maxPriceInput = null;
    this.inStockOnly = false;
    this.discountOnly = false;
    this.newOnly = false;
    this.sortBy = 'default';
    this.applyFilters();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getDiscountPercent(product: Product): number {
    if (!product.originalPrice) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }

  private updateSEO(): void {
    this.seoService.updateMetaTags({
      title: 'Каталог компьютерных аксессуаров — GGPoint Узбекистан',
      description: 'Купить игровые мыши, клавиатуры, наушники, мониторы в Узбекистане. Быстрая доставка по Ташкенту. Лучшие цены.',
      keywords: 'каталог, компьютерные аксессуары, игровые устройства, Узбекистан, Ташкент',
      type: 'website',
      canonical: 'https://gg-point.uz/catalog',
      languageAlternates: [
        { lang: 'ru', url: 'https://gg-point.uz/catalog' },
        { lang: 'uz', url: 'https://gg-point.uz/catalog' }
      ]
    });

    const breadcrumbSchema = this.seoService.generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Catalog' }
    ]);
    this.seoService.addStructuredData(breadcrumbSchema, 'breadcrumb-schema');
  }
}
