import { Component, OnInit, inject, signal, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { FavoritesService } from '../../shared/services/favorites.service';
import { CartService } from '../../shared/services/cart.service';
import { RecentlyViewedService } from '../../shared/services/recently-viewed.service';
import { SeoService } from '../../shared/services/seo.service';
import { Product } from '../../shared/models/product.model';
import { CurrencySymbolPipe } from '../../shared/pipes/currency-symbol.pipe';

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
    TelegramButtonComponent,
    CurrencySymbolPipe
  ],
  template: `
    @if (product()) {
      <div class="product-detail-page">
        <div class="container mx-auto px-4">
          <!-- Breadcrumb -->
          <nav class="breadcrumb">
            <a routerLink="/">{{ 'header.home' | translate }}</a>
            <span>/</span>
            <a routerLink="/catalog">{{ 'header.catalog' | translate }}</a>
            <span>/</span>
            <span class="bc-current">{{ product()!.name }}</span>
          </nav>

          <!-- Product Main Section -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <!-- Image Gallery -->
            <div class="g-panel">
              <!-- Main image -->
              <div class="relative mb-4 group cursor-zoom-in" (click)="openFullscreen()">
                <img [src]="selectedImage()"
                     [alt]="product()!.name"
                     class="w-full h-96 object-contain rounded-lg">
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-10 rounded-lg">
                  <mat-icon class="text-white text-4xl" style="font-size:40px;width:40px;height:40px;">zoom_in</mat-icon>
                </div>
              </div>

              <!-- Thumbnails -->
              @if (product()!.images.length > 1) {
                <div class="flex gap-2 overflow-x-auto pb-1">
                  @for (image of product()!.images.slice(0,5); track image) {
                    <img [src]="image"
                         [alt]="product()!.name"
                         class="thumb-img flex-shrink-0"
                         [class.ring-2]="selectedImage() === image"
                         [class.ring-primary-500]="selectedImage() === image"
                         (click)="selectedImage.set(image)">
                  }
                </div>
              }
            </div>

            <!-- Product Info -->
            <div class="g-panel flex flex-col">
              <!-- Badges -->
              <div class="flex gap-2 mb-3 flex-wrap">
                @if (product()!.isNew) {
                  <span class="badge-new">{{ 'product.badges.new' | translate }}</span>
                }
                @if (hasDiscount()) {
                  <span class="badge-sale">-{{ getDiscountPercent() }}% {{ 'product.badges.sale' | translate }}</span>
                }
                @if (!product()!.inStock) {
                  <span class="badge-oos">{{ 'product.outOfStock' | translate }}</span>
                }
              </div>

              <h1 class="product-name">
                {{ product()!.name }}
              </h1>

              <!-- Category + Brand -->
              <div class="flex flex-wrap gap-2 mb-4">
                <mat-chip>{{ product()!.category }}</mat-chip>
                @if (product()!.brand) {
                  <mat-chip class="chip-brand">{{ product()!.brand }}</mat-chip>
                }
              </div>

              <!-- Stock Status -->
              <div class="mb-4">
                @if (product()!.inStock) {
                  <span class="stock-in"><mat-icon>check_circle</mat-icon>{{ 'product.inStock' | translate }}</span>
                } @else {
                  <span class="stock-out"><mat-icon>cancel</mat-icon>{{ 'product.outOfStock' | translate }}</span>
                }
              </div>

              <!-- Price -->
              <div class="mb-5">
                @if (hasDiscount()) {
                  <div class="flex items-center gap-3 mb-1">
                    <span class="text-xl text-gray-400 dark:text-gray-500 line-through">
                      {{ product()!.currency === 'USD' ? (product()!.originalPrice | number:'1.0-2') : (product()!.originalPrice | number:'1.0-0') }} {{ product()!.currency | currencySymbol }}
                    </span>
                    <span class="bg-red-500 text-white px-2 py-0.5 rounded-full text-sm font-bold">
                      -{{ getDiscountPercent() }}%
                    </span>
                  </div>
                }
                <div class="product-price-main">{{ product()!.currency === 'USD' ? (product()!.price | number:'1.0-2') : (product()!.price | number:'1.0-0') }} {{ product()!.currency | currencySymbol }}</div>
              </div>

              <!-- Description (expandable) -->
              <div class="mb-5">
                <p class="text-gray-700 dark:text-gray-300 leading-relaxed"
                   [class.line-clamp-3]="!descExpanded()">
                  {{ product()!.description }}
                </p>
                @if (product()!.description.length > 200) {
                  <button class="text-primary-600 dark:text-primary-400 text-sm mt-1 hover:underline" (click)="descExpanded.set(!descExpanded())">
                    {{ descExpanded() ? ('product.showLess' | translate) : ('product.showMore' | translate) }}
                  </button>
                }
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3 mt-auto">
                @if (product()!.inStock) {
                  <!-- Add to Cart -->
                  <button mat-raised-button color="primary" class="w-full text-base py-3"
                          (click)="addToCart()">
                    <mat-icon class="mr-2">{{ inCart() ? 'shopping_cart' : 'add_shopping_cart' }}</mat-icon>
                    {{ (inCart() ? 'cart.inCart' : 'cart.addToCart') | translate }}
                  </button>
                  <!-- Order via Telegram -->
                  <a [href]="getTelegramOrderLink()" target="_blank" rel="noopener noreferrer" class="block">
                    <button mat-stroked-button color="primary" class="w-full">
                      <mat-icon class="mr-2">send</mat-icon>
                      {{ 'product.orderViaTelegram' | translate }}
                    </button>
                  </a>
                } @else {
                  <!-- Back in stock notification -->
                  <a [href]="getBackInStockTelegramLink()" target="_blank" rel="noopener noreferrer" class="block">
                    <button mat-raised-button color="warn" class="w-full">
                      <mat-icon class="mr-2">notifications</mat-icon>
                      {{ 'product.notifyWhenAvailable' | translate }}
                    </button>
                  </a>
                }

                <!-- Favorite -->
                <button mat-stroked-button class="w-full fav-outline-btn"
                        (click)="toggleFavorite()">
                  <mat-icon class="mr-2" [class.text-red-500]="isFav()">
                    {{ isFav() ? 'favorite' : 'favorite_border' }}
                  </mat-icon>
                  {{ (isFav() ? 'product.removeFromFavorites' : 'product.addToFavorites') | translate }}
                </button>
              </div>
            </div>
          </div>

          <!-- Features List -->
          @if (product()!.features && product()!.features!.length > 0) {
            <div class="g-panel mb-6">
              <h2 class="panel-title">{{ 'product.features' | translate }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                @for (feature of product()!.features; track feature) {
                  <div class="flex items-start gap-2">
                    <mat-icon class="text-green-500 flex-shrink-0 mt-0.5" style="font-size:20px;width:20px;height:20px;">check_circle</mat-icon>
                    <span class="text-gray-700 dark:text-gray-300 text-sm">{{ feature }}</span>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Tabs: Specifications + Description -->
          <div class="g-panel mb-6">
            <mat-tab-group>
              <mat-tab [label]="'product.specifications' | translate">
                <div class="p-6">
                  @if (product()!.specifications.length > 0) {
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm">
                        @for (spec of product()!.specifications; track spec.key) {
                          <tr class="border-b border-gray-100 dark:border-gray-700">
                            <td class="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400 w-1/2">{{ spec.key }}</td>
                            <td class="py-2 text-gray-900 dark:text-white">{{ spec.value }}</td>
                          </tr>
                        }
                      </table>
                    </div>
                  } @else {
                    <p class="text-gray-500 dark:text-gray-400">{{ 'product.noSpecs' | translate }}</p>
                  }
                </div>
              </mat-tab>
              <mat-tab [label]="'product.description' | translate">
                <div class="p-6">
                  <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {{ product()!.description }}
                  </p>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>

          <!-- Delivery Info -->
          <div class="g-panel mb-6">
            <h2 class="panel-title flex items-center gap-2">
              <mat-icon class="text-primary-400">local_shipping</mat-icon>
              {{ 'product.delivery.title' | translate }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="delivery-item">
                <mat-icon class="di-icon di-green">check_circle</mat-icon>
                <div>
                  <p class="di-title">{{ 'product.delivery.tashkent' | translate }}</p>
                  <p class="di-desc">{{ 'product.delivery.tashkentDesc' | translate }}</p>
                </div>
              </div>
              <div class="delivery-item">
                <mat-icon class="di-icon di-blue">local_post_office</mat-icon>
                <div>
                  <p class="di-title">{{ 'product.delivery.regions' | translate }}</p>
                  <p class="di-desc">{{ 'product.delivery.regionsDesc' | translate }}</p>
                </div>
              </div>
              <div class="delivery-item">
                <mat-icon class="di-icon di-yellow">verified_user</mat-icon>
                <div>
                  <p class="di-title">{{ 'product.delivery.warranty' | translate }}</p>
                  <p class="di-desc">{{ 'product.delivery.warrantyDesc' | translate }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- YouTube Video -->
          @if (product()!.videoUrl) {
            <div class="g-panel mb-6">
              <h2 class="panel-title flex items-center gap-2">
                <mat-icon class="text-red-500">play_circle</mat-icon>
                {{ 'product.videoReview' | translate }}
              </h2>
              <div class="aspect-video rounded-lg overflow-hidden">
                <iframe [src]="getYoutubeEmbedUrl()" frameborder="0" allowfullscreen
                        class="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                </iframe>
              </div>
            </div>
          }

          <!-- Related Products -->
          @if (relatedProducts().length > 0) {
            <section class="mb-12">
              <h2 class="panel-title mb-6">{{ 'product.relatedProducts' | translate }}</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                @for (relatedProduct of relatedProducts(); track relatedProduct.id) {
                  <app-product-card [product]="relatedProduct"></app-product-card>
                }
              </div>
            </section>
          }
        </div>

        <app-telegram-button [floating]="true" [productName]="product()!.name" [productId]="product()!.id">
        </app-telegram-button>
      </div>

      <!-- Fullscreen Image Modal -->
      @if (fullscreenOpen()) {
        <div class="fullscreen-overlay" (click)="closeFullscreen()">
          <button class="fullscreen-close" (click)="closeFullscreen()">
            <mat-icon>close</mat-icon>
          </button>
          <button class="fullscreen-nav left" (click)="prevImage($event)">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <img [src]="selectedImage()" [alt]="product()!.name" class="fullscreen-img" (click)="$event.stopPropagation()">
          <button class="fullscreen-nav right" (click)="nextImage($event)">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <div class="fullscreen-counter">
            {{ currentImageIndex() + 1 }} / {{ product()!.images.length }}
          </div>
        </div>
      }
    } @else {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <mat-icon class="text-gray-400" style="font-size:64px;width:64px;height:64px;">error_outline</mat-icon>
          <p class="text-xl text-gray-600 dark:text-gray-400 mt-4">{{ 'product.notFound' | translate }}</p>
          <button mat-raised-button color="primary" routerLink="/catalog" class="mt-4">
            {{ 'product.backToCatalog' | translate }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Page */
    .product-detail-page { background: #080c18; min-height: 100vh; padding: 32px 0; }

    /* Breadcrumb */
    .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; margin-bottom: 24px; }
    .breadcrumb a { color: #60a5fa; text-decoration: none; transition: color 0.2s; }
    .breadcrumb a:hover { color: #93c5fd; }
    .breadcrumb span { color: #7c8db5; }
    .bc-current { color: #94a3b8; }

    /* Panel */
    .g-panel {
      background: #0d1426;
      border: 1px solid rgba(59,130,246,0.12);
      border-radius: 16px;
      padding: 24px;
    }

    /* Badges */
    .badge-new  { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; }
    .badge-sale { background: rgba(239,68,68,0.15);  color: #f87171; border: 1px solid rgba(239,68,68,0.3); padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; }
    .badge-oos  { background: rgba(107,114,128,0.15); color: #9ca3af; border: 1px solid rgba(107,114,128,0.3); padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; }

    /* Product name */
    .product-name { font-size: 1.6rem; font-weight: 900; color: #e2e8f0; margin-bottom: 12px; line-height: 1.3; }

    /* Stock */
    .stock-in  { display: inline-flex; align-items: center; gap: 4px; color: #34d399; font-weight: 600; font-size: 14px; }
    .stock-out { display: inline-flex; align-items: center; gap: 4px; color: #f87171; font-weight: 600; font-size: 14px; }
    .stock-in mat-icon, .stock-out mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* Price */
    .product-price-main {
      font-size: 2.25rem;
      font-weight: 900;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Thumbnails */
    .thumb-img {
      width: 72px; height: 72px;
      object-fit: cover; border-radius: 8px; cursor: pointer;
      border: 2px solid transparent; transition: all 0.2s;
      background: #080c18;
    }
    .thumb-img:hover { border-color: #3b82f6; }

    /* Desc expand */
    .line-clamp-3 {
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* Fav button */
    .fav-outline-btn {
      background: rgba(239,68,68,0.05) !important;
      border-color: rgba(239,68,68,0.2) !important;
      color: #f87171 !important;
    }
    .fav-outline-btn:hover { border-color: #ef4444 !important; background: rgba(239,68,68,0.12) !important; }

    /* Chip brand */
    :host ::ng-deep .chip-brand .mdc-evolution-chip__text-label { color: #a78bfa; }

    /* Panel title */
    .panel-title { font-size: 1.1rem; font-weight: 700; color: #e2e8f0; margin-bottom: 16px; }

    /* Features */
    :host ::ng-deep .text-green-500 { color: #34d399 !important; }

    /* Description text */
    :host ::ng-deep .text-gray-700 { color: #cbd5e1 !important; }
    :host ::ng-deep .text-gray-500 { color: #7c8db5 !important; }

    /* Delivery */
    .delivery-item { display: flex; align-items: flex-start; gap: 12px; }
    .di-icon { flex-shrink: 0; font-size: 22px; width: 22px; height: 22px; }
    .di-green  { color: #34d399; }
    .di-blue   { color: #60a5fa; }
    .di-yellow { color: #fbbf24; }
    .di-title  { font-size: 13px; font-weight: 700; color: #e2e8f0; }
    .di-desc   { font-size: 12px; color: #7c8db5; margin-top: 2px; }

    /* Fullscreen */
    .fullscreen-overlay {
      position: fixed; inset: 0;
      background: rgba(4,7,14,0.95); z-index: 9999;
      display: flex; align-items: center; justify-content: center;
    }
    .fullscreen-img {
      max-width: 90vw; max-height: 90vh;
      object-fit: contain; border-radius: 8px;
    }
    .fullscreen-close {
      position: absolute; top: 16px; right: 16px;
      background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.3);
      border-radius: 50%; width: 44px; height: 44px;
      cursor: pointer; color: white;
      display: flex; align-items: center; justify-content: center;
    }
    .fullscreen-nav {
      position: absolute; top: 50%; transform: translateY(-50%);
      background: rgba(59,130,246,0.2); border: 1px solid rgba(59,130,246,0.3);
      border-radius: 50%; width: 48px; height: 48px;
      cursor: pointer; color: white;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.2s;
    }
    .fullscreen-nav:hover { background: rgba(59,130,246,0.4); }
    .fullscreen-nav.left  { left: 16px; }
    .fullscreen-nav.right { right: 16px; }
    .fullscreen-counter {
      position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
      color: #e2e8f0; font-size: 13px;
      background: rgba(13,20,38,0.8); padding: 4px 14px; border-radius: 20px;
    }

    /* Not found */
    :host ::ng-deep .text-gray-600 { color: #94a3b8 !important; }
  `]
})
export class ProductDetailComponent implements OnInit {
  private productService = inject(ProductService);
  private favoritesService = inject(FavoritesService);
  private cartService = inject(CartService);
  private recentlyViewedService = inject(RecentlyViewedService);
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  product = signal<Product | null>(null);
  selectedImage = signal<string>('');
  relatedProducts = signal<Product[]>([]);
  fullscreenOpen = signal(false);
  descExpanded = signal(false);
  isFav = signal(false);
  inCart = signal(false);

  currentImageIndex = signal(0);

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.fullscreenOpen()) return;
    if (event.key === 'Escape') this.closeFullscreen();
    if (event.key === 'ArrowRight') this.nextImage();
    if (event.key === 'ArrowLeft') this.prevImage();
  }

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
      this.selectedImage.set(product.thumbnail || (product.images[0] ?? ''));
      this.relatedProducts.set(this.productService.getRelatedProducts(id, 4));
      this.isFav.set(this.favoritesService.isFavorite(id));
      this.inCart.set(this.cartService.isInCart(id));
      this.recentlyViewedService.add(id);
      this.updateSEO(product);
    }
  }

  hasDiscount(): boolean {
    const p = this.product();
    return !!(p?.originalPrice && p.originalPrice > p.price);
  }

  getDiscountPercent(): number {
    const p = this.product();
    if (!p?.originalPrice) return 0;
    return Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cartService.addToCart({ id: p.id, name: p.name, price: p.price, currency: p.currency, thumbnail: p.thumbnail });
    this.inCart.set(true);
  }

  toggleFavorite(): void {
    const p = this.product();
    if (!p) return;
    this.favoritesService.toggle(p.id);
    this.isFav.set(this.favoritesService.isFavorite(p.id));
  }

  getTelegramOrderLink(): string {
    const p = this.product();
    if (!p) return '#';
    const priceStr = p.currency === 'USD' ? `${p.price.toFixed(2)} $` : `${p.price.toLocaleString()} UZS`;
    const text = `Здравствуйте! Хочу заказать: ${p.name} (ID: ${p.id}). Цена: ${priceStr}`;
    return `https://t.me/ggpoint_bot?text=${encodeURIComponent(text)}`;
  }

  getBackInStockTelegramLink(): string {
    const p = this.product();
    if (!p) return '#';
    const text = `Уведомите меня, когда появится в наличии: ${p.name} (ID: ${p.id})`;
    return `https://t.me/ggpoint_bot?text=${encodeURIComponent(text)}`;
  }

  getYoutubeEmbedUrl(): string {
    const p = this.product();
    if (!p?.videoUrl) return '';
    // Extract video ID
    const match = p.videoUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!match) return p.videoUrl;
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  openFullscreen(): void {
    const p = this.product();
    if (!p || p.images.length === 0) return;
    const idx = p.images.indexOf(this.selectedImage());
    this.currentImageIndex.set(idx >= 0 ? idx : 0);
    this.fullscreenOpen.set(true);
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'hidden';
  }

  closeFullscreen(): void {
    this.fullscreenOpen.set(false);
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = '';
  }

  nextImage(event?: Event): void {
    event?.stopPropagation();
    const p = this.product();
    if (!p) return;
    const next = (this.currentImageIndex() + 1) % p.images.length;
    this.currentImageIndex.set(next);
    this.selectedImage.set(p.images[next]);
  }

  prevImage(event?: Event): void {
    event?.stopPropagation();
    const p = this.product();
    if (!p) return;
    const prev = (this.currentImageIndex() - 1 + p.images.length) % p.images.length;
    this.currentImageIndex.set(prev);
    this.selectedImage.set(p.images[prev]);
  }

  private updateSEO(product: Product): void {
    const currentUrl = `https://gg-point.uz/product/${product.id}`;
    const discountText = product.originalPrice ? ` SALE ${this.getDiscountPercent()}% OFF!` : '';
    this.seoService.updateMetaTags({
      title: `${product.name} — ${product.price.toLocaleString()} ${product.currency}${discountText} | GGPoint`,
      description: `${product.name} — ${product.description.slice(0, 150)}. Цена: ${product.price.toLocaleString()} ${product.currency}. Доставка по Ташкенту. Заказ через Telegram.`,
      keywords: `${product.name}, ${product.category}, купить, Ташкент, Узбекистан`,
      image: product.thumbnail,
      type: 'product',
      canonical: currentUrl,
      languageAlternates: [
        { lang: 'ru', url: currentUrl },
        { lang: 'uz', url: currentUrl }
      ]
    });

    const productSchema = this.seoService.generateProductSchema(product);
    this.seoService.addStructuredData(productSchema, 'product-schema');

    const breadcrumbSchema = this.seoService.generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Catalog', url: '/catalog' },
      { name: product.name }
    ]);
    this.seoService.addStructuredData(breadcrumbSchema, 'breadcrumb-schema');
  }
}
