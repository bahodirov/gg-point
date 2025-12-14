import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { ProductService } from '../../shared/services/product.service';
import { SeoService } from '../../shared/services/seo.service';
import { Product, ProductCategory } from '../../shared/models/product.model';

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
    TranslateModule,
    ProductCardComponent,
    TelegramButtonComponent
  ],
  template: `
    <div class="catalog-page bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div class="container mx-auto px-4">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {{ 'catalog.title' | translate }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ filteredProducts().length }} {{ 'catalog.title' | translate }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Filters Sidebar -->
          <aside class="lg:col-span-1">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md sticky top-20">
              <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {{ 'catalog.filters' | translate }}
              </h2>

              <!-- Category Filter -->
              <div class="mb-6">
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

              <!-- Price Range -->
              <div class="mb-6">
                <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {{ 'catalog.priceRange' | translate }}
                </label>
                <div class="space-y-4">
                  <div>
                    <label class="text-xs text-gray-600 dark:text-gray-400">Min: {{ minPrice() | number:'1.0-0' }} UZS</label>
                    <mat-slider [min]="0" [max]="10000000" [step]="100000" class="w-full">
                      <input matSliderThumb [(ngModel)]="minPrice" (input)="applyFilters()">
                    </mat-slider>
                  </div>
                  <div>
                    <label class="text-xs text-gray-600 dark:text-gray-400">Max: {{ maxPrice() | number:'1.0-0' }} UZS</label>
                    <mat-slider [min]="0" [max]="10000000" [step]="100000" class="w-full">
                      <input matSliderThumb [(ngModel)]="maxPrice" (input)="applyFilters()">
                    </mat-slider>
                  </div>
                </div>
              </div>

              <!-- In Stock Filter -->
              <div class="mb-6">
                <mat-checkbox [(ngModel)]="inStockOnly" (change)="applyFilters()" class="text-gray-700 dark:text-gray-300">
                  In Stock Only
                </mat-checkbox>
              </div>

              <!-- Reset Button -->
              <button mat-raised-button color="primary" class="w-full" (click)="resetFilters()">
                <mat-icon>refresh</mat-icon>
                Reset Filters
              </button>
            </div>
          </aside>

          <!-- Products Grid -->
          <main class="lg:col-span-3">
            <!-- Sort Options -->
            <div class="flex justify-between items-center mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
              <span class="text-gray-700 dark:text-gray-300 font-medium">
                {{ filteredProducts().length }} products found
              </span>
              <mat-form-field appearance="outline" class="w-48">
                <mat-label>Sort By</mat-label>
                <mat-select [(value)]="sortBy" (selectionChange)="applySort()">
                  <mat-option value="default">Default</mat-option>
                  <mat-option value="priceLow">Price: Low to High</mat-option>
                  <mat-option value="priceHigh">Price: High to Low</mat-option>
                  <mat-option value="newest">Newest First</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <!-- Products Grid -->
            @if (filteredProducts().length > 0) {
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (product of filteredProducts(); track product.id) {
                  <app-product-card [product]="product"></app-product-card>
                }
              </div>
            } @else {
              <div class="text-center py-16">
                <mat-icon class="text-6xl text-gray-400 mb-4">inventory_2</mat-icon>
                <p class="text-xl text-gray-600 dark:text-gray-400">No products found</p>
              </div>
            }
          </main>
        </div>
      </div>

      <!-- Floating Telegram Button -->
      <app-telegram-button [floating]="true"></app-telegram-button>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    :host ::ng-deep mat-icon {
      vertical-align: middle;
    }
  `]
})
export class CatalogListComponent implements OnInit {
  private productService = inject(ProductService);
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);

  allProducts: Product[] = [];
  filteredProducts = signal<Product[]>([]);
  categories: ProductCategory[] = [];

  selectedCategory: string = '';
  minPrice = signal(0);
  maxPrice = signal(10000000);
  inStockOnly: boolean = false;
  sortBy: string = 'default';

  ngOnInit(): void {
    this.loadData();
    this.updateSEO();
    
    // Check for category query param
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.applyFilters();
      }
    });
  }

  private loadData(): void {
    this.allProducts = this.productService.products();
    this.categories = this.productService.categories();
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allProducts];

    // Category filter
    if (this.selectedCategory) {
      filtered = this.productService.getProductsByCategory(this.selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(p => 
      p.price >= this.minPrice() && p.price <= this.maxPrice()
    );

    // In stock filter
    if (this.inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    this.filteredProducts.set(filtered);
    this.applySort();
  }

  applySort(): void {
    let sorted = [...this.filteredProducts()];

    switch (this.sortBy) {
      case 'priceLow':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        // Keep original order
        break;
    }

    this.filteredProducts.set(sorted);
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.minPrice.set(0);
    this.maxPrice.set(10000000);
    this.inStockOnly = false;
    this.sortBy = 'default';
    this.applyFilters();
  }

  private updateSEO(): void {
    this.seoService.updateMetaTags({
      title: 'Computer Accessories Catalog - Buy Gaming & Office Peripherals in Uzbekistan | GGPoint',
      description: 'Shop premium computer accessories in Uzbekistan: gaming mice, mechanical keyboards, monitors, headsets & more. Free delivery in Tashkent. In-stock items. Order via Telegram. Best prices guaranteed!',
      keywords: 'computer accessories catalog, gaming peripherals Uzbekistan, buy gaming mouse Tashkent, mechanical keyboard Uzbekistan, gaming headset, monitors, компьютерные аксессуары каталог, игровые устройства, купить игровую мышь Ташкент, механическая клавиатура',
      type: 'website',
      canonical: 'https://ggpoint.uz/catalog',
      languageAlternates: [
        { lang: 'en', url: 'https://ggpoint.uz/catalog' },
        { lang: 'ru', url: 'https://ggpoint.uz/catalog' },
        { lang: 'uz', url: 'https://ggpoint.uz/catalog' }
      ]
    });

    // Add ItemList Schema for product catalog
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'name': 'GGPoint Computer Accessories Catalog',
      'description': 'Browse our complete catalog of computer accessories and gaming peripherals',
      'numberOfItems': this.allProducts.length,
      'itemListElement': this.allProducts.slice(0, 10).map((product, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'Product',
          'name': product.name,
          'url': `https://ggpoint.uz/catalog/${product.id}`,
          'image': product.thumbnail,
          'offers': {
            '@type': 'Offer',
            'price': product.price,
            'priceCurrency': 'UZS',
            'availability': product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
          }
        }
      }))
    };
    this.seoService.addStructuredData(itemListSchema, 'catalog-itemlist-schema');

    // Add Breadcrumb Schema
    const breadcrumbSchema = this.seoService.generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Catalog' }
    ]);
    this.seoService.addStructuredData(breadcrumbSchema, 'breadcrumb-schema');
  }
}
