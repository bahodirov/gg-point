import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { ProductService } from '../../shared/services/product.service';
import { SeoService } from '../../shared/services/seo.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatTableModule,
    TranslateModule,
    ProductCardComponent,
    TelegramButtonComponent
  ],
  template: `
    @if (product()) {
      <div class="product-detail-page bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
        <div class="container mx-auto px-4">
          <!-- Breadcrumb -->
          <nav class="mb-6 text-sm">
            <a routerLink="/" class="text-primary-600 dark:text-primary-400 hover:underline">
              {{ 'header.home' | translate }}
            </a>
            <span class="mx-2 text-gray-500">/</span>
            <a routerLink="/catalog" class="text-primary-600 dark:text-primary-400 hover:underline">
              {{ 'header.catalog' | translate }}
            </a>
            <span class="mx-2 text-gray-500">/</span>
            <span class="text-gray-600 dark:text-gray-400">{{ getProductName() }}</span>
          </nav>

          <!-- Product Main Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <!-- Image Gallery -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div class="mb-4">
                <img [src]="selectedImage()" 
                     [alt]="getProductName()"
                     class="w-full h-96 object-contain rounded-lg">
              </div>
              
              @if (product()!.images.length > 1) {
                <div class="grid grid-cols-4 gap-2">
                  @for (image of product()!.images; track image) {
                    <img [src]="image" 
                         [alt]="getProductName()"
                         class="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                         [class.ring-2]="selectedImage() === image"
                         [class.ring-primary-500]="selectedImage() === image"
                         (click)="selectedImage.set(image)">
                  }
                </div>
              }
            </div>

            <!-- Product Info -->
            <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h1 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                {{ getProductName() }}
              </h1>

              <!-- Category -->
              <div class="mb-4">
                <mat-chip>{{ product()!.category }}</mat-chip>
              </div>

              <!-- Stock Status -->
              <div class="mb-4">
                @if (product()!.inStock) {
                  <span class="inline-flex items-center text-green-600 dark:text-green-400">
                    <mat-icon class="mr-1">check_circle</mat-icon>
                    In Stock
                  </span>
                } @else {
                  <span class="inline-flex items-center text-red-600 dark:text-red-400">
                    <mat-icon class="mr-1">cancel</mat-icon>
                    Out of Stock
                  </span>
                }
              </div>

              <!-- Price -->
              <div class="mb-6">
                @if (product()!.originalPrice && product()!.originalPrice! > product()!.price) {
                  <div class="flex items-center mb-2">
                    <span class="text-2xl text-gray-500 dark:text-gray-400 line-through mr-4">
                      {{ product()!.originalPrice | number:'1.0-0' }} UZS
                    </span>
                    <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{{ getDiscountPercent() }}%
                    </span>
                  </div>
                }
                <div class="text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {{ product()!.price | number:'1.0-0' }} UZS
                </div>
              </div>

              <!-- Description -->
              <p class="text-gray-700 dark:text-gray-300 mb-6">
                {{ getProductDescription() }}
              </p>

              <!-- Tags -->
              @if (product()!.tags.length > 0) {
                <div class="flex flex-wrap gap-2 mb-6">
                  @for (tag of product()!.tags; track tag) {
                    <mat-chip class="text-xs">{{ tag }}</mat-chip>
                  }
                </div>
              }

              <!-- Order Button -->
              <a [href]="getTelegramLink()" 
                 target="_blank"
                 rel="noopener noreferrer"
                 class="block">
                <button mat-raised-button 
                        color="primary" 
                        class="w-full text-lg py-6"
                        [disabled]="!product()!.inStock">
                  <mat-icon class="mr-2">send</mat-icon>
                  Order via Telegram
                </button>
              </a>
            </div>
          </div>

          <!-- Tabs Section -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-12">
            <mat-tab-group class="product-tabs">
              <mat-tab label="Specifications">
                <div class="p-6">
                  <table mat-table [dataSource]="product()!.specifications" class="w-full">
                    <ng-container matColumnDef="key">
                      <th mat-header-cell *matHeaderCellDef class="font-semibold">Specifications</th>
                      <td mat-cell *matCellDef="let spec" class="font-medium">
                        {{ spec.key }}
                      </td>
                    </ng-container>

                    <ng-container matColumnDef="value">
                      <th mat-header-cell *matHeaderCellDef>Value</th>
                      <td mat-cell *matCellDef="let spec">
                        {{ spec.value }}
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="['key', 'value']"></tr>
                    <tr mat-row *matRowDef="let row; columns: ['key', 'value']"></tr>
                  </table>
                </div>
              </mat-tab>

              <mat-tab label="Description">
                <div class="p-6">
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {{ getProductDescription() }}
                  </p>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>

          <!-- Related Products -->
          @if (relatedProducts().length > 0) {
            <section class="mb-12">
              <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Related Products
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                @for (relatedProduct of relatedProducts(); track relatedProduct.id) {
                  <app-product-card [product]="relatedProduct"></app-product-card>
                }
              </div>
            </section>
          }
        </div>

        <!-- Floating Telegram Button -->
        <app-telegram-button 
          [floating]="true" 
          [productName]="getProductName()"
          [productId]="product()!.id">
        </app-telegram-button>
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <mat-icon class="text-6xl text-gray-400 mb-4">error_outline</mat-icon>
          <p class="text-xl text-gray-600 dark:text-gray-400">Product not found</p>
          <button mat-raised-button color="primary" routerLink="/catalog" class="mt-4">
            Back to Catalog
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-tab-body-content {
      padding: 0 !important;
    }

    :host ::ng-deep .mat-mdc-chip {
      font-size: 0.875rem !important;
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);

  product = signal<Product | null>(null);
  selectedImage = signal<string>('');
  relatedProducts = signal<Product[]>([]);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProduct(productId);
    });
  }

  private loadProduct(id: string): void {
    const product = this.productService.getProductById(id);
    if (product) {
      this.product.set(product);
      this.selectedImage.set(product.thumbnail);
      this.relatedProducts.set(this.productService.getRelatedProducts(id, 4));
      this.updateSEO(product);
    }
  }

  getProductName(): string {
    const p = this.product();
    if (!p) return '';
    return p.name;
  }

  getProductDescription(): string {
    const p = this.product();
    if (!p) return '';
    return p.description;
  }

  getDiscountPercent(): number {
    const p = this.product();
    if (!p || !p.originalPrice) return 0;
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  }

  getTelegramLink(): string {
    const p = this.product();
    if (!p) return '#';
    
    const botUsername = 'ggpoint_bot';
    const text = `Hello! I'm interested in ${this.getProductName()} (ID: ${p.id})`;
    return `https://t.me/${botUsername}?text=${encodeURIComponent(text)}`;
  }

  private updateSEO(product: Product): void {
    const currentUrl = `https://ggpoint.uz/catalog/${product.id}`;
    const priceFormatted = product.price.toLocaleString('en-US');
    const availability = product.inStock ? 'In Stock - Order Now' : 'Currently Out of Stock';
    const discountText = product.originalPrice ? ` SALE ${Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF!` : '';
    
    // Enhanced meta tags with location-based keywords
    this.seoService.updateMetaTags({
      title: `Buy ${product.name} in Tashkent, Uzbekistan | ${priceFormatted} UZS${discountText} | GGPoint`,
      description: `${product.name} - ${product.description} ⚡ Price: ${priceFormatted} UZS | ${availability} | Free delivery in Tashkent | Official warranty | Authentic ${product.category} | Order via Telegram. Best computer accessories store in Uzbekistan!`,
      keywords: `${product.name}, ${product.name} price, ${product.name} buy online, ${product.name} Uzbekistan, ${product.name} Tashkent, ${product.category} Tashkent, ${product.category} Uzbekistan, ${product.tags.join(', ')}, buy ${product.category} online, computer accessories Tashkent, gaming peripherals Uzbekistan, купить ${product.name}, ${product.name} цена Ташкент, компьютерные аксессуары Ташкент`,
      image: product.thumbnail,
      type: 'product',
      canonical: currentUrl,
      languageAlternates: [
        { lang: 'en', url: currentUrl },
        { lang: 'ru', url: currentUrl },
        { lang: 'uz', url: currentUrl }
      ]
    });

    // Add Product Schema
    const productSchema = this.seoService.generateProductSchema(product);
    this.seoService.addStructuredData(productSchema, 'product-schema');

    // Add Breadcrumb Schema
    const breadcrumbSchema = this.seoService.generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Catalog', url: '/catalog' },
      { name: product.name }
    ]);
    this.seoService.addStructuredData(breadcrumbSchema, 'breadcrumb-schema');
  }
}
