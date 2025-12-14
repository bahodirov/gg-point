import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule, TelegramButtonComponent],
  template: `
    <div class="about-page bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div class="container mx-auto px-4">
        <!-- Page Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            About Us
          </h1>
          <div class="flex items-center justify-center space-x-2 text-3xl mb-6">
            <span class="font-bold text-primary-600 dark:text-primary-400">GG</span>
            <span class="font-bold text-gray-900 dark:text-white">Point</span>
          </div>
        </div>

        <!-- Mission Section -->
        <section class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <div class="max-w-3xl mx-auto text-center">
            <mat-icon class="text-6xl text-primary-600 dark:text-primary-400 mb-4">flag</mat-icon>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
            <p class="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              To provide premium computer accessories and gaming peripherals to gamers and tech enthusiasts in Uzbekistan.
            </p>
          </div>
        </section>

        <!-- Why Choose Us -->
        <section class="mb-12">
          <h2 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Why Choose Us
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Quality -->
            <mat-card class="text-center p-6 hover:shadow-xl transition-shadow">
              <div class="bg-primary-100 dark:bg-primary-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-4xl text-primary-600 dark:text-primary-400">verified</mat-icon>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Quality Products
              </h3>
              <p class="text-gray-700 dark:text-gray-300">
                100% authentic products from official distributors with warranty
              </p>
            </mat-card>

            <!-- Service -->
            <mat-card class="text-center p-6 hover:shadow-xl transition-shadow">
              <div class="bg-primary-100 dark:bg-primary-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-4xl text-primary-600 dark:text-primary-400">support_agent</mat-icon>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Expert Support
              </h3>
              <p class="text-gray-700 dark:text-gray-300">
                Professional customer service and technical support available 24/7
              </p>
            </mat-card>

            <!-- Prices -->
            <mat-card class="text-center p-6 hover:shadow-xl transition-shadow">
              <div class="bg-primary-100 dark:bg-primary-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <mat-icon class="text-4xl text-primary-600 dark:text-primary-400">local_offer</mat-icon>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Best Prices
              </h3>
              <p class="text-gray-700 dark:text-gray-300">
                Competitive prices and regular promotions on top brands
              </p>
            </mat-card>
          </div>
        </section>

        <!-- Stats Section -->
        <section class="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-lg shadow-lg p-12 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div class="text-4xl font-bold mb-2">500+</div>
              <div class="text-primary-100">Happy Customers</div>
            </div>
            <div>
              <div class="text-4xl font-bold mb-2">1000+</div>
              <div class="text-primary-100">Products Sold</div>
            </div>
            <div>
              <div class="text-4xl font-bold mb-2">50+</div>
              <div class="text-primary-100">Product Categories</div>
            </div>
            <div>
              <div class="text-4xl font-bold mb-2">24/7</div>
              <div class="text-primary-100">Support Available</div>
            </div>
          </div>
        </section>

        <!-- Contact CTA -->
        <section class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Want to know more?
          </h2>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            Get in touch with us through Telegram or visit our contact page
          </p>
          <div class="flex justify-center space-x-4">
            <app-telegram-button></app-telegram-button>
          </div>
        </section>
      </div>

      <!-- Floating Telegram Button -->
      <app-telegram-button [floating]="true"></app-telegram-button>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-card {
      border-radius: 12px;
    }

    :host ::ng-deep mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
  `]
})
export class AboutComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.updateSEO();
  }

  private updateSEO(): void {
    this.seoService.updateMetaTags({
      title: 'About Us - GGPoint',
      description: 'Learn more about GGPoint, your trusted computer accessories store in Uzbekistan.',
      keywords: 'about, company, ggpoint, computer accessories, Uzbekistan',
      type: 'website'
    });
  }
}
