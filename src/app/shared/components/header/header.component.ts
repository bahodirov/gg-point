import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/services/language.service';
import { CartService } from '../../services/cart.service';
import { FavoritesService } from '../../services/favorites.service';
import { CurrencySymbolPipe } from '../../pipes/currency-symbol.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatBadgeModule, TranslateModule,
    CurrencySymbolPipe
  ],
  template: `
    <header class="site-header">
      <div class="header-inner">
        <!-- Logo -->
        <a routerLink="/" class="logo-link">
          <span class="logo-gg">GG</span><span class="logo-point">Point</span>
        </a>

        <!-- Desktop Nav -->
        <nav class="desktop-nav">
          <a routerLink="/" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact:true}" class="nav-item">
            {{ 'header.home' | translate }}
          </a>
          <a routerLink="/catalog" routerLinkActive="nav-active" class="nav-item">
            {{ 'header.catalog' | translate }}
          </a>
          <a routerLink="/catalog" [queryParams]="{category:'keycaps'}" class="nav-item nav-special">
            <mat-icon style="font-size:15px;width:15px;height:15px;vertical-align:middle;margin-right:3px;">keyboard</mat-icon>
            {{ 'header.keycaps' | translate }}
          </a>
          <a routerLink="/catalog" [queryParams]="{category:'mousepads'}" class="nav-item nav-special">
            <mat-icon style="font-size:15px;width:15px;height:15px;vertical-align:middle;margin-right:3px;">mouse</mat-icon>
            {{ 'header.mousepads' | translate }}
          </a>
          <a routerLink="/blog" routerLinkActive="nav-active" class="nav-item">
            {{ 'header.blog' | translate }}
          </a>
          <a routerLink="/about" routerLinkActive="nav-active" class="nav-item">
            {{ 'header.about' | translate }}
          </a>
          <a routerLink="/contact" routerLinkActive="nav-active" class="nav-item">
            {{ 'header.contact' | translate }}
          </a>
        </nav>

        <!-- Actions -->
        <div class="header-actions">
          <!-- Language -->
          <button class="icon-btn" [matMenuTriggerFor]="langMenu" [attr.aria-label]="'header.language'|translate">
            <mat-icon>language</mat-icon>
          </button>
          <mat-menu #langMenu="matMenu">
            <button mat-menu-item (click)="languageService.setLanguage('ru')"
                    [class.lang-active]="languageService.currentLanguage()==='ru'">
              <span class="lang-flag">🇷🇺</span>
              Русский
              @if (languageService.currentLanguage()==='ru') { <mat-icon class="lang-check">check</mat-icon> }
            </button>
            <button mat-menu-item (click)="languageService.setLanguage('uz')"
                    [class.lang-active]="languageService.currentLanguage()==='uz'">
              <span class="lang-flag">🇺🇿</span>
              O'zbek
              @if (languageService.currentLanguage()==='uz') { <mat-icon class="lang-check">check</mat-icon> }
            </button>
          </mat-menu>

          <!-- Theme toggle -->
          <button class="icon-btn" (click)="themeService.toggleTheme()" aria-label="Toggle theme">
            <mat-icon>{{ themeService.theme()==='light' ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>

          <!-- Favorites -->
          <button class="icon-btn fav-btn-desktop" routerLink="/favorites" [attr.aria-label]="'header.favorites'|translate">
            <mat-icon [matBadge]="favCount() > 0 ? favCount() : null" matBadgeColor="warn" matBadgeSize="small">
              favorite_border
            </mat-icon>
          </button>

          <!-- Cart -->
          <button class="cart-btn" [matMenuTriggerFor]="cartMenu" [attr.aria-label]="'cart.title'|translate">
            <mat-icon [matBadge]="cartCount() > 0 ? cartCount() : null" matBadgeColor="primary" matBadgeSize="small">
              shopping_cart
            </mat-icon>
          </button>
          <mat-menu #cartMenu="matMenu" class="cart-dropdown">
            @if (cartItems().length === 0) {
              <div class="cart-empty">
                <mat-icon>shopping_cart</mat-icon>
                <p>{{ 'cart.empty' | translate }}</p>
              </div>
            } @else {
              <div class="cart-list">
                @for (item of cartItems(); track item.productId) {
                  <div class="cart-item">
                    <img [src]="item.thumbnail" [alt]="item.name" class="cart-thumb">
                    <div class="cart-item-info">
                      <p class="cart-item-name">{{ item.name }}</p>
                      <p class="cart-item-price">{{ item.quantity }} × {{ item.currency === 'USD' ? (item.price | number:'1.0-2') : (item.price | number:'1.0-0') }} {{ item.currency | currencySymbol }}</p>
                    </div>
                    <button class="cart-remove" (click)="removeFromCart(item.productId, $event)">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                }
                <div class="cart-footer">
                  @if (cartTotalUZS() > 0) {
                    <span class="cart-total">{{ 'cart.total' | translate }}: {{ cartTotalUZS() | number:'1.0-0' }} {{ 'UZS' | currencySymbol }}</span>
                  }
                  @if (cartTotalUSD() > 0) {
                    <span class="cart-total">{{ 'cart.total' | translate }}: {{ cartTotalUSD() | number:'1.0-2' }} {{ 'USD' | currencySymbol }}</span>
                  }
                  <a [href]="getCartTelegramLink()" target="_blank" rel="noopener noreferrer" class="cart-order-btn">
                    {{ 'cart.order' | translate }}
                  </a>
                </div>
              </div>
            }
          </mat-menu>

          <!-- Mobile Menu -->
          <button class="icon-btn mobile-menu-btn" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
            <mat-icon>{{ mobileOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile nav -->
      @if (mobileOpen()) {
        <nav class="mobile-nav">
          <a routerLink="/"               (click)="mobileOpen.set(false)" class="mobile-item">{{ 'header.home'|translate }}</a>
          <a routerLink="/catalog"         (click)="mobileOpen.set(false)" class="mobile-item">{{ 'header.catalog'|translate }}</a>
          <a routerLink="/catalog" [queryParams]="{category:'keycaps'}"   (click)="mobileOpen.set(false)" class="mobile-item">{{ 'header.keycaps'|translate }}</a>
          <a routerLink="/catalog" [queryParams]="{category:'mousepads'}" (click)="mobileOpen.set(false)" class="mobile-item">{{ 'header.mousepads'|translate }}</a>
          <a routerLink="/blog"            (click)="mobileOpen.set(false)" class="mobile-item">{{ 'header.blog'|translate }}</a>
          <a routerLink="/about"           (click)="mobileOpen.set(false)" class="mobile-item">{{ 'header.about'|translate }}</a>
          <a routerLink="/contact"         (click)="mobileOpen.set(false)" class="mobile-item">{{ 'header.contact'|translate }}</a>
          <a routerLink="/faq"             (click)="mobileOpen.set(false)" class="mobile-item">{{ 'header.faq'|translate }}</a>
        </nav>
      }
    </header>
  `,
  styles: [`
    /* ── Header shell ──────────────────────────────────────────────── */
    .site-header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(8,12,24,0.96);
      border-bottom: 1px solid rgba(59,130,246,0.15);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .header-inner {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 64px;
      gap: 16px;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 16px;
    }

    /* ── Logo ──────────────────────────────────────────────────────── */
    .logo-link {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
      gap: 2px;
    }
    .logo-gg {
      font-size: 1.5rem;
      font-weight: 900;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -1px;
    }
    .logo-point {
      font-size: 1.5rem;
      font-weight: 900;
      color: #e2e8f0;
      letter-spacing: -1px;
    }

    /* ── Desktop nav ───────────────────────────────────────────────── */
    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .fav-btn-desktop { display: flex; }
    .mobile-menu-btn { display: none; }

    @media (max-width: 767px) {
      .desktop-nav { display: none; }
      .fav-btn-desktop { display: none; }
      .mobile-menu-btn { display: flex; }
    }
    .nav-item {
      text-decoration: none;
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 6px 10px;
      border-radius: 6px;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .nav-item:hover {
      color: #e2e8f0;
      background: rgba(59,130,246,0.08);
    }
    .nav-active {
      color: #60a5fa !important;
      border-bottom-color: #3b82f6 !important;
    }
    .nav-special {
      color: #a78bfa;
    }
    .nav-special:hover {
      color: #c4b5fd;
      background: rgba(139,92,246,0.1);
    }

    /* ── Actions ───────────────────────────────────────────────────── */
    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }
    .icon-btn {
      background: none;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #94a3b8;
      transition: all 0.2s;
    }
    .icon-btn:hover {
      background: rgba(59,130,246,0.1);
      color: #60a5fa;
    }
    .cart-btn {
      background: linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3));
      border: 1px solid rgba(59,130,246,0.3);
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #60a5fa;
      transition: all 0.2s;
    }
    .cart-btn:hover {
      background: linear-gradient(135deg, rgba(37,99,235,0.5), rgba(124,58,237,0.5));
      box-shadow: 0 0 12px rgba(59,130,246,0.3);
    }

    /* ── Cart dropdown ─────────────────────────────────────────────── */
    .cart-empty {
      padding: 24px;
      text-align: center;
      min-width: 240px;
      color: #7c8db5;
    }
    .cart-empty mat-icon {
      font-size: 40px; width: 40px; height: 40px;
      display: block; margin: 0 auto 8px;
    }
    .cart-list { min-width: 320px; max-width: 360px; }
    .cart-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .cart-thumb {
      width: 48px; height: 48px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid rgba(59,130,246,0.2);
    }
    .cart-item-info { flex: 1; min-width: 0; }
    .cart-item-name {
      font-size: 13px;
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .cart-item-price { font-size: 12px; color: #7c8db5; margin-top: 2px; }
    .cart-remove {
      background: none; border: none; cursor: pointer;
      color: #7c8db5; padding: 4px;
      border-radius: 4px; transition: color 0.2s;
    }
    .cart-remove:hover { color: #ef4444; }
    .cart-remove mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .cart-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      gap: 12px;
    }
    .cart-total { font-size: 13px; font-weight: 700; color: #e2e8f0; }
    .cart-order-btn {
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: white;
      text-decoration: none;
      padding: 6px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      transition: opacity 0.2s;
    }
    .cart-order-btn:hover { opacity: 0.9; }

    /* ── Mobile nav ────────────────────────────────────────────────── */
    .mobile-nav {
      display: flex;
      flex-direction: column;
      padding: 8px 16px 16px;
      border-top: 1px solid rgba(59,130,246,0.1);
      background: rgba(8,12,24,0.98);
    }
    .mobile-item {
      text-decoration: none;
      color: #94a3b8;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .mobile-item:hover {
      background: rgba(59,130,246,0.1);
      color: #60a5fa;
    }

    .lang-active { color: #3b82f6 !important; }
    .lang-flag { font-size: 18px; margin-right: 8px; line-height: 1; }
    .lang-check { font-size: 16px; width: 16px; height: 16px; margin-left: auto; color: #3b82f6; }

    :host ::ng-deep .mat-badge-content { font-size: 10px !important; }
  `]
})
export class HeaderComponent {
  themeService    = inject(ThemeService);
  languageService = inject(LanguageService);
  private cartService      = inject(CartService);
  private favoritesService = inject(FavoritesService);

  mobileOpen = signal(false);

  cartItems     = this.cartService.items;
  cartCount     = this.cartService.totalCount;
  cartTotalUZS  = this.cartService.totalPriceUZS;
  cartTotalUSD  = this.cartService.totalPriceUSD;
  favCount   = this.favoritesService.count;

  removeFromCart(productId: string, event: Event): void {
    event.stopPropagation();
    this.cartService.removeFromCart(productId);
  }

  getCartTelegramLink(): string {
    const items = this.cartService.items();
    if (!items.length) return '#';
    const fmtPrice = (price: number, currency: string) =>
      currency === 'USD' ? `${price.toFixed(2)} $` : `${price.toLocaleString()} UZS`;
    const lines = items.map(i => `• ${i.name} × ${i.quantity} = ${fmtPrice(i.price * i.quantity, i.currency)}`).join('\n');
    const totalUZS = this.cartService.totalPriceUZS();
    const totalUSD = this.cartService.totalPriceUSD();
    const totals = [
      totalUZS > 0 ? `${totalUZS.toLocaleString()} UZS` : '',
      totalUSD > 0 ? `${totalUSD.toFixed(2)} $` : '',
    ].filter(Boolean).join(' + ');
    const text  = `Здравствуйте! Хочу заказать:\n${lines}\n\nИтого: ${totals}`;
    return `https://t.me/ggpoint_bot?text=${encodeURIComponent(text)}`;
  }
}
