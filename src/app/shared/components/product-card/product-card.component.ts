import { Component, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../models/product.model';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule, TranslateModule, CurrencySymbolPipe],
  template: `
    <div class="g-card">
      <!-- Badges -->
      <div class="badges-top-left">
        @if (product.isNew) {
          <span class="badge badge-new">{{ 'product.badges.new' | translate }}</span>
        }
        @if (hasDiscount()) {
          <span class="badge badge-sale">-{{ discountPct() }}%</span>
        }
      </div>

      <!-- Favorite -->
      <button class="fav-btn" (click)="toggleFav($event)"
              [matTooltip]="(isFav() ? 'product.removeFromFavorites' : 'product.addToFavorites') | translate">
        <mat-icon [class.fav-active]="isFav()">
          {{ isFav() ? 'favorite' : 'favorite_border' }}
        </mat-icon>
      </button>

      <!-- Image -->
      <a [routerLink]="['/product', product.id]" class="card-img-wrap">
        <img [src]="product.thumbnail" [alt]="product.name" loading="lazy" class="card-img">
        @if (!product.inStock) {
          <div class="oos-overlay">
            <span>{{ 'product.outOfStock' | translate }}</span>
          </div>
        }
      </a>

      <!-- Body -->
      <div class="card-body">
        <!-- Category + Brand -->
        <div class="card-tags">
          <span class="tag">{{ product.category }}</span>
          @if (product.brand) { <span class="tag tag-brand">{{ product.brand }}</span> }
        </div>

        <!-- Name -->
        <a [routerLink]="['/product', product.id]" class="card-name">{{ product.name }}</a>

        <!-- Description -->
        <p class="card-desc">{{ product.description }}</p>

        <!-- Price -->
        <div class="card-price-row">
          <div>
            @if (hasDiscount()) {
              <span class="price-old">{{ product.currency === 'USD' ? (product.originalPrice | number:'1.0-2') : (product.originalPrice | number:'1.0-0') }} {{ product.currency | currencySymbol }}</span>
            }
            <span class="price-main">{{ product.currency === 'USD' ? (product.price | number:'1.0-2') : (product.price | number:'1.0-0') }} {{ product.currency | currencySymbol }}</span>
          </div>
        </div>

        <!-- Buttons -->
        <div class="card-actions">
          <a [routerLink]="['/product', product.id]" class="btn-view">
            {{ 'common.viewMore' | translate }}
          </a>
          <button class="btn-cart" [disabled]="!product.inStock" (click)="addToCart($event)"
                  [matTooltip]="(inCart() ? 'cart.inCart' : 'cart.addToCart') | translate">
            <mat-icon>{{ inCart() ? 'shopping_cart' : 'add_shopping_cart' }}</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .g-card {
      position: relative;
      background: #111c35;
      border: 1px solid rgba(59,130,246,0.12);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
    }
    .g-card:hover {
      border-color: rgba(59,130,246,0.38);
      box-shadow: 0 8px 32px rgba(59,130,246,0.14);
      transform: translateY(-4px);
    }

    /* Badges */
    .badges-top-left {
      position: absolute;
      top: 10px;
      left: 10px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 2;
    }
    .badge {
      padding: 3px 9px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    .badge-new  { background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .badge-sale { background: rgba(239,68,68,0.2);  color: #f87171; border: 1px solid rgba(239,68,68,0.3); }

    /* Favorite */
    .fav-btn {
      position: absolute;
      top: 10px; right: 10px;
      z-index: 2;
      background: rgba(8,12,24,0.7);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: #7c8db5;
      transition: all 0.2s;
      padding: 0;
    }
    .fav-btn:hover { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }
    .fav-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .fav-active { color: #f87171 !important; }

    /* Image */
    .card-img-wrap {
      display: block;
      background: rgba(13,20,38,0.8);
      overflow: hidden;
      position: relative;
    }
    .card-img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .g-card:hover .card-img { transform: scale(1.06); }
    .oos-overlay {
      position: absolute;
      inset: 0;
      background: rgba(8,12,24,0.7);
      display: flex; align-items: center; justify-content: center;
    }
    .oos-overlay span {
      background: rgba(107,114,128,0.9);
      color: white;
      padding: 6px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
    }

    /* Body */
    .card-body {
      padding: 14px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 8px;
    }
    .tag {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(59,130,246,0.1);
      color: #93c5fd;
      border: 1px solid rgba(59,130,246,0.2);
    }
    .tag-brand { background: rgba(139,92,246,0.1); color: #c4b5fd; border-color: rgba(139,92,246,0.2); }

    .card-name {
      display: block;
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      color: #e2e8f0;
      line-height: 1.4;
      margin-bottom: 6px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.2s;
    }
    .card-name:hover { color: #60a5fa; }

    .card-desc {
      font-size: 12px;
      color: #7c8db5;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 12px;
      flex: 1;
    }

    .card-price-row { margin-bottom: 12px; }
    .price-old  {
      display: block;
      font-size: 12px;
      color: #64748b;
      text-decoration: line-through;
      margin-bottom: 2px;
    }
    .price-main {
      font-size: 18px;
      font-weight: 800;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Buttons */
    .card-actions { display: flex; gap: 8px; }

    .btn-view {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 12px;
      background: linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25));
      border: 1px solid rgba(59,130,246,0.3);
      border-radius: 8px;
      color: #93c5fd;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-view:hover {
      background: linear-gradient(135deg, rgba(37,99,235,0.45), rgba(124,58,237,0.45));
      border-color: rgba(59,130,246,0.55);
      color: #bfdbfe;
    }

    .btn-cart {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(59,130,246,0.1);
      border: 1px solid rgba(59,130,246,0.25);
      border-radius: 8px;
      color: #60a5fa;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
      padding: 0;
    }
    .btn-cart:hover:not([disabled]) {
      background: rgba(59,130,246,0.2);
      box-shadow: 0 0 12px rgba(59,130,246,0.3);
    }
    .btn-cart[disabled] { opacity: 0.4; cursor: not-allowed; }
    .btn-cart mat-icon { font-size: 18px; width: 18px; height: 18px; }
  `]
})
export class ProductCardComponent implements OnInit {
  @Input({ required: true }) product!: Product;

  private cartService      = inject(CartService);
  private favoritesService = inject(FavoritesService);

  inCart = signal(false);
  isFav  = signal(false);

  ngOnInit(): void {
    this.inCart.set(this.cartService.isInCart(this.product.id));
    this.isFav.set(this.favoritesService.isFavorite(this.product.id));
  }

  hasDiscount(): boolean {
    return !!(this.product.originalPrice && this.product.originalPrice > this.product.price);
  }

  discountPct(): number {
    if (!this.hasDiscount()) return 0;
    return Math.round(((this.product.originalPrice! - this.product.price) / this.product.originalPrice!) * 100);
  }

  addToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart({ id: this.product.id, name: this.product.name, price: this.product.price, currency: this.product.currency, thumbnail: this.product.thumbnail });
    this.inCart.set(true);
  }

  toggleFav(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favoritesService.toggle(this.product.id);
    this.isFav.set(this.favoritesService.isFavorite(this.product.id));
  }
}
