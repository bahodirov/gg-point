import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { BlogCardComponent } from '../../shared/components/blog-card/blog-card.component';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { ProductService } from '../../shared/services/product.service';
import { BlogService } from '../../shared/services/blog.service';
import { SeoService } from '../../shared/services/seo.service';
import { Product, ProductCategory } from '../../shared/models/product.model';
import { BlogPost } from '../../shared/models/blog.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    ProductCardComponent,
    BlogCardComponent,
    TelegramButtonComponent
  ],
  template: `
    <!-- Hero Section -->
    <section class="hero-section relative bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20 md:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            {{ 'home.hero.title' | translate }}
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-primary-100">
            {{ 'home.hero.subtitle' | translate }}
          </p>
          <button mat-raised-button 
                  color="accent" 
                  class="text-lg px-8 py-3 hero-button"
                  routerLink="/catalog">
            <span>{{ 'home.hero.cta' | translate }}</span>
            <mat-icon class="ml-2">arrow_forward</mat-icon>
          </button>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-900"></div>
    </section>

    <!-- Featured Products -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ 'home.featured' | translate }}
          </h2>
          <a routerLink="/catalog" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center">
            {{ 'home.viewAll' | translate }}
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (product of featuredProducts; track product.id) {
            <app-product-card [product]="product"></app-product-card>
          }
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-800">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {{ 'home.categories' | translate }}
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          @for (category of categories; track category.id) {
            <a [routerLink]="['/catalog']" 
               [queryParams]="{category: category.slug}"
               class="category-card group">
              <div class="bg-white dark:bg-gray-900 rounded-lg p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div class="text-4xl mb-3">
                  <mat-icon class="text-primary-600 dark:text-primary-400 scale-150">{{ getCategoryIcon(category.name) }}</mat-icon>
                </div>
                <h3 class="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {{ category.name }}
                </h3>
                @if (category.productCount) {
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ category.productCount }} Products
                  </p>
                }
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- Latest Blog Posts -->
    <section class="py-16 bg-white dark:bg-gray-900">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ 'home.latestBlog' | translate }}
          </h2>
          <a routerLink="/blog" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center">
            {{ 'home.viewAll' | translate }}
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (post of recentPosts; track post.id) {
            <app-blog-card [post]="post"></app-blog-card>
          }
        </div>
      </div>
    </section>

    <!-- Floating Telegram Button -->
    <app-telegram-button [floating]="true"></app-telegram-button>
  `,
  styles: [`
    .hero-section {
      position: relative;
      overflow: hidden;
    }

    .animate-fade-in {
      animation: fadeIn 1s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .category-card {
      text-decoration: none;
      display: block;
    }

    :host ::ng-deep .mat-icon.scale-150 {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
    }

    :host ::ng-deep .hero-button {
      min-width: 200px !important;
      height: 56px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      white-space: nowrap !important;
    }

    :host ::ng-deep .hero-button .mat-icon {
      margin: 0 !important;
    }
  `]
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);

  featuredProducts: Product[] = [];
  categories: ProductCategory[] = [];
  recentPosts: BlogPost[] = [];

  ngOnInit(): void {
    this.loadData();
    this.updateSEO();
  }

  private loadData(): void {
    this.featuredProducts = this.productService.getFeaturedProducts(6);
    this.categories = this.productService.categories();
    this.recentPosts = this.blogService.getRecentPosts(3);
  }

  private updateSEO(): void {
    this.seoService.updateMetaTags({
      title: 'GGPoint - Computer Accessories Store in Uzbekistan | Gaming & Office Peripherals',
      description: 'Find the best computer accessories and gadgets in Uzbekistan. Gaming peripherals, mechanical keyboards, gaming mice, monitors, and more. Fast delivery in Tashkent. Order via Telegram.',
      keywords: 'computer accessories, gaming peripherals, mechanical keyboard, gaming mouse, monitors, Uzbekistan, Tashkent, ggpoint, компьютерные аксессуары, игровые устройства, клавиатура, мышь',
      type: 'website',
      canonical: 'https://ggpoint.uz/',
      languageAlternates: [
        { lang: 'en', url: 'https://ggpoint.uz/' },
        { lang: 'ru', url: 'https://ggpoint.uz/' },
        { lang: 'uz', url: 'https://ggpoint.uz/' }
      ]
    });

    // Add Organization Schema
    const organizationSchema = this.seoService.generateOrganizationSchema();
    this.seoService.addStructuredData(organizationSchema, 'organization-schema');

    // Add WebSite Schema with search functionality
    const websiteSchema = this.seoService.generateWebSiteSchema();
    this.seoService.addStructuredData(websiteSchema, 'website-schema');

    // Add LocalBusiness Schema for better local SEO
    const localBusinessSchema = this.seoService.generateLocalBusinessSchema();
    this.seoService.addStructuredData(localBusinessSchema, 'localbusiness-schema');
  }

  getCategoryIcon(categoryName: string): string {
    const icons: { [key: string]: string } = {
      'mice': 'mouse',
      'keyboards': 'keyboard',
      'headsets': 'headset',
      'monitors': 'monitor',
      'mousepads': 'mouse',
      'webcams': 'videocam',
      'cables': 'cable',
      'other': 'devices'
    };
    return icons[categoryName.toLowerCase()] || 'category';
  }
}
