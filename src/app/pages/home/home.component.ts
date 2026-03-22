import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { SoonModalComponent } from '../../shared/components/soon-modal/soon-modal.component';
import { ProductService } from '../../shared/services/product.service';
import { SeoService } from '../../shared/services/seo.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, RouterModule,
    MatButtonModule, MatIconModule, TranslateModule,
    TelegramButtonComponent, SoonModalComponent
  ],
  template: `
    <!-- ── HERO ────────────────────────────────────────────────────── -->
    <section class="hero-section">
      <div class="hero-grid-bg"></div>
      <!-- Glow orbs -->
      <div class="hero-orb hero-orb-blue"></div>
      <div class="hero-orb hero-orb-purple"></div>

      <div class="hero-content-wrap">
        <div class="hero-text-center">
          <div class="hero-badge">
            <mat-icon style="font-size:14px;width:14px;height:14px;">bolt</mat-icon>
            Gaming Accessories Store — Toshkent
          </div>

          <h1 class="hero-title">
            {{ 'home.hero.title' | translate }}
          </h1>
          <p class="hero-subtitle">
            {{ 'home.hero.subtitle' | translate }}
          </p>

          <div class="hero-actions">
            <a routerLink="/catalog" class="hero-btn-primary">
              <mat-icon>grid_view</mat-icon>
              {{ 'home.hero.cta' | translate }}
            </a>
            <a routerLink="/catalog" [queryParams]="{discount:true}" class="hero-btn-outline">
              <mat-icon>local_fire_department</mat-icon>
              {{ 'home.hero.sales' | translate }}
            </a>
            <app-soon-modal></app-soon-modal>
          </div>
        </div>
      </div>
      <div class="hero-bottom-fade"></div>
    </section>

    <!-- ── BENEFITS STRIP ──────────────────────────────────────────── -->
    <div class="glow-divider"></div>
    <section class="benefits-strip">
      <div class="container mx-auto px-4">
        <div class="benefits-grid">
          @for (b of benefits; track b.icon) {
            <div class="benefit-item">
              <div class="benefit-icon"><mat-icon>{{ b.icon }}</mat-icon></div>
              <div>
                <p class="benefit-title">{{ b.title | translate }}</p>
                <p class="benefit-desc">{{ b.desc | translate }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
    <div class="glow-divider"></div>

    <!-- ── PROMO BANNERS ────────────────────────────────────────────── -->
    <section class="promo-strip">
      <div class="promo-inner">

        @if (discountedProducts.length > 0) {
          <div class="promo-card promo-sales">
            <div class="promo-icon"><mat-icon>local_fire_department</mat-icon></div>
            <div class="promo-body">
              <h3 class="promo-title">{{ 'home.sales' | translate }}</h3>
              <p class="promo-desc">{{ discountedProducts.length }} {{ 'catalog.products' | translate }}</p>
            </div>
            <a routerLink="/catalog" [queryParams]="{discount:true}" class="promo-btn promo-btn-red">
              {{ 'home.viewAll' | translate }} <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        }

        @if (newProducts.length > 0) {
          <div class="promo-card promo-new">
            <div class="promo-icon"><mat-icon>new_releases</mat-icon></div>
            <div class="promo-body">
              <h3 class="promo-title">{{ 'home.newArrivals' | translate }}</h3>
              <p class="promo-desc">{{ newProducts.length }} {{ 'catalog.products' | translate }}</p>
            </div>
            <a routerLink="/catalog" [queryParams]="{new:true}" class="promo-btn promo-btn-green">
              {{ 'home.viewAll' | translate }} <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        }

        <div class="promo-card promo-featured">
          <div class="promo-icon"><mat-icon>star</mat-icon></div>
          <div class="promo-body">
            <h3 class="promo-title">{{ 'home.featured' | translate }}</h3>
            <p class="promo-desc">{{ 'home.featuredDesc' | translate }}</p>
          </div>
          <a routerLink="/catalog" class="promo-btn promo-btn-blue">
            {{ 'home.viewAll' | translate }} <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

      </div>
    </section>

    <!-- ── BRANDS ────────────────────────────────────────────────────── -->
    @if (brands.length > 0) {
      <section class="page-section gaming-section">
        <div class="container mx-auto px-4">
          <h2 class="section-title text-center mb-8">{{ 'home.brands' | translate }}</h2>
          <div class="brands-row">
            @for (brand of brands; track brand) {
              <a [routerLink]="['/catalog']" [queryParams]="{brand:brand}" class="brand-pill">
                {{ brand }}
              </a>
            }
          </div>
        </div>
      </section>
    }

    <app-telegram-button [floating]="true"></app-telegram-button>
  `,
  styles: [`
    /* ── HERO ─────────────────────────────────────────────────────── */
    .hero-section {
      position: relative;
      min-height: 620px;
      background:
        radial-gradient(ellipse 80% 60% at 50% 0%, rgba(88,28,235,0.35) 0%, rgba(37,99,235,0.18) 40%, transparent 70%),
        #080c18;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .hero-content-wrap {
      position: relative;
      z-index: 10;
      max-width: 1280px;
      margin: 0 auto;
      padding: 100px 16px 80px;
      width: 100%;
    }

    .hero-text-center {
      max-width: 720px;
      margin: 0 auto;
      text-align: center;
    }
    .hero-grid-bg {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px);
      background-size: 44px 44px;
    }
    .hero-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
    }
    .hero-orb-blue {
      width: 600px; height: 600px;
      top: -200px; left: -150px;
      background: rgba(37,99,235,0.28);
    }
    .hero-orb-purple {
      width: 500px; height: 500px;
      top: -150px; right: -150px;
      background: rgba(124,58,237,0.25);
    }
    .hero-bottom-fade {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 80px;
      background: linear-gradient(to top, #080c18, transparent);
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(59,130,246,0.1);
      border: 1px solid rgba(59,130,246,0.25);
      color: #60a5fa;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .hero-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 900;
      line-height: 1.1;
      color: #f1f5f9;
      margin-bottom: 20px;
      background: linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.125rem;
      color: #7c8db5;
      max-width: 520px;
      margin: 0 auto 36px;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      align-items: center;
    }

    .hero-btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      color: white;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      box-shadow: 0 0 24px rgba(59,130,246,0.35);
      transition: all 0.25s;
    }
    .hero-btn-primary:hover {
      box-shadow: 0 0 40px rgba(59,130,246,0.55);
      transform: translateY(-2px);
    }

    .hero-btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 13px 24px;
      border: 1.5px solid rgba(239,68,68,0.5);
      color: #fca5a5;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 0.95rem;
      background: rgba(239,68,68,0.06);
      transition: all 0.25s;
    }
    .hero-btn-outline:hover {
      border-color: #ef4444;
      background: rgba(239,68,68,0.12);
      color: #fca5a5;
    }

    /* ── BENEFITS ─────────────────────────────────────────────────── */
    .benefits-strip {
      background: #0d1426;
      padding: 20px 0;
    }
    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 0;
    }
    @media (min-width: 768px) {
      .benefits-grid {
        grid-template-columns: repeat(3, 1fr);
        divide-x: 1px solid rgba(59,130,246,0.1);
      }
    }
    .benefit-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(59,130,246,0.08);
    }
    @media (min-width: 768px) {
      .benefit-item {
        border-bottom: none;
        border-right: 1px solid rgba(59,130,246,0.1);
      }
      .benefit-item:last-child { border-right: none; }
    }
    .benefit-icon {
      width: 40px; height: 40px;
      border-radius: 8px;
      background: rgba(59,130,246,0.12);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      color: #3b82f6;
    }
    .benefit-title  { font-size: 13px; font-weight: 700; color: #e2e8f0; }
    .benefit-desc   { font-size: 12px; color: #7c8db5; margin-top: 2px; }

    /* ── SECTIONS ─────────────────────────────────────────────────── */
    .page-section    { padding: 64px 0; }

    /* ── PROMO BANNERS ─────────────────────────────────────────────── */
    .promo-strip {
      background: #0d1426;
      padding: 32px 0;
    }
    .promo-inner {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 16px;
      display: flex;
      flex-direction: row;
      gap: 16px;
      flex-wrap: wrap;
    }
    .promo-card {
      flex: 1;
      min-width: 240px;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .promo-icon {
      width: 44px; height: 44px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .promo-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .promo-body { flex: 1; min-width: 0; }
    .promo-title { font-size: 0.9rem; font-weight: 700; color: #e2e8f0; margin-bottom: 2px; white-space: nowrap; }
    .promo-desc  { font-size: 0.75rem; color: #7c8db5; }
    .promo-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 8px 16px; border-radius: 8px; font-size: 0.8rem;
      font-weight: 600; text-decoration: none; transition: all 0.2s;
      white-space: nowrap; flex-shrink: 0;
    }
    .promo-btn mat-icon { font-size: 15px; width: 15px; height: 15px; }

    .promo-sales   { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.2); }
    .promo-sales .promo-icon { background: rgba(239,68,68,0.15); color: #f87171; }
    .promo-btn-red { background: rgba(239,68,68,0.2); color: #fca5a5; border: 1px solid rgba(239,68,68,0.35); }
    .promo-btn-red:hover { background: rgba(239,68,68,0.35); }

    .promo-new     { background: rgba(16,185,129,0.06); border-color: rgba(16,185,129,0.2); }
    .promo-new .promo-icon { background: rgba(16,185,129,0.15); color: #34d399; }
    .promo-btn-green { background: rgba(16,185,129,0.2); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.35); }
    .promo-btn-green:hover { background: rgba(16,185,129,0.35); }

    .promo-featured { background: rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.2); }
    .promo-featured .promo-icon { background: rgba(59,130,246,0.15); color: #60a5fa; }
    .promo-btn-blue { background: rgba(59,130,246,0.2); color: #93c5fd; border: 1px solid rgba(59,130,246,0.35); }
    .promo-btn-blue:hover { background: rgba(59,130,246,0.35); }
    .gaming-section  { background: #080c18; }
    .gaming-section-alt { background: #0d1426; }
    .glow-divider    {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), rgba(139,92,246,0.3), transparent);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .section-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .section-icon-red    { padding: 8px; border-radius: 10px; background: rgba(239,68,68,0.15); color: #f87171; display:flex; }
    .section-icon-green  { padding: 8px; border-radius: 10px; background: rgba(16,185,129,0.15); color: #34d399; display:flex; }
    .section-icon-blue   { padding: 8px; border-radius: 10px; background: rgba(59,130,246,0.15); color: #60a5fa; display:flex; }
    .section-icon-purple { padding: 8px; border-radius: 10px; background: rgba(139,92,246,0.15); color: #a78bfa; display:flex; }

    .section-title { font-size: 1.5rem; font-weight: 800; color: #e2e8f0; }
    .section-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.875rem;
      color: #60a5fa;
      text-decoration: none;
      transition: gap 0.2s;
    }
    .section-link:hover { gap: 8px; color: #93c5fd; }
    .section-link mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* ── PRODUCT GRIDS ────────────────────────────────────────────── */
    .products-grid {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 20px;
    }
    @media (min-width: 640px)  { .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .products-grid { grid-template-columns: repeat(4, 1fr); } }

    .products-grid-3 {
      display: grid;
      grid-template-columns: repeat(1, 1fr);
      gap: 20px;
    }
    @media (min-width: 640px)  { .products-grid-3 { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .products-grid-3 { grid-template-columns: repeat(3, 1fr); } }

    /* ── CATEGORIES ───────────────────────────────────────────────── */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media (min-width: 640px)  { .categories-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (min-width: 1024px) { .categories-grid { grid-template-columns: repeat(5, 1fr); } }

    .category-card {
      display: block;
      text-decoration: none;
      background: #111c35;
      border: 1px solid rgba(59,130,246,0.12);
      border-radius: 14px;
      padding: 24px 16px;
      text-align: center;
      transition: all 0.3s;
    }
    .category-card:hover {
      border-color: rgba(59,130,246,0.4);
      box-shadow: 0 8px 32px rgba(59,130,246,0.15);
      transform: translateY(-4px);
    }
    .cat-icon {
      width: 56px; height: 56px;
      border-radius: 14px;
      background: rgba(59,130,246,0.12);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
      color: #3b82f6;
      transition: background 0.3s;
    }
    .category-card:hover .cat-icon {
      background: rgba(59,130,246,0.2);
      color: #60a5fa;
    }
    .cat-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .cat-name  { font-size: 13px; font-weight: 700; color: #e2e8f0; }
    .cat-count { font-size: 11px; color: #7c8db5; margin-top: 4px; }

    /* ── BRANDS ───────────────────────────────────────────────────── */
    .brands-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
    }
    .brand-pill {
      display: inline-block;
      padding: 8px 20px;
      background: #111c35;
      border: 1px solid rgba(59,130,246,0.15);
      border-radius: 999px;
      font-size: 13px;
      font-weight: 600;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s;
    }
    .brand-pill:hover {
      border-color: rgba(59,130,246,0.45);
      color: #60a5fa;
      box-shadow: 0 0 12px rgba(59,130,246,0.15);
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private seoService     = inject(SeoService);

  featuredProducts: Product[]  = [];
  discountedProducts: Product[] = [];
  newProducts: Product[]       = [];
  brands: string[]              = [];

  benefits = [
    { icon: 'verified',       title: 'home.benefits.quality',  desc: 'home.benefits.qualityDesc' },
    { icon: 'local_shipping', title: 'home.benefits.delivery', desc: 'home.benefits.deliveryDesc' },
    { icon: 'support_agent',  title: 'home.benefits.support',  desc: 'home.benefits.supportDesc' },
  ];

  ngOnInit(): void {
    this.featuredProducts  = this.productService.getFeaturedProducts(6);
    this.discountedProducts = this.productService.getDiscountedProducts(4);
    this.newProducts       = this.productService.getNewProducts(4);
    this.brands            = this.productService.getBrands().slice(0, 12);
    this.updateSEO();
  }

  private updateSEO(): void {
    this.seoService.updateMetaTags({
      title: 'GGPoint — Компьютерные аксессуары в Узбекистане',
      description: 'Лучшие компьютерные аксессуары: игровые мыши, клавиатуры, мониторы, наушники. Быстрая доставка по Ташкенту.',
      keywords: 'компьютерные аксессуары, gaming, Узбекистан, Ташкент',
      type: 'website',
      canonical: 'https://gg-point.uz/',
      languageAlternates: [{ lang: 'ru', url: 'https://gg-point.uz/' }, { lang: 'uz', url: 'https://gg-point.uz/' }]
    });
    this.seoService.addStructuredData(this.seoService.generateOrganizationSchema(), 'organization-schema');
    this.seoService.addStructuredData(this.seoService.generateWebSiteSchema(), 'website-schema');
    this.seoService.addStructuredData(this.seoService.generateLocalBusinessSchema(), 'localbusiness-schema');
  }
}
