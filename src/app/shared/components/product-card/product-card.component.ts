import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatBadgeModule,
    TranslateModule
  ],
  template: `
    <mat-card class="product-card h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
      <!-- Badge for discount -->
      @if (product.originalPrice && product.originalPrice > product.price) {
        <div class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
          -{{ getDiscountPercent() }}%
        </div>
      }

      <!-- Product Image -->
      <div class="relative overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-lg cursor-pointer"
           [routerLink]="['/product', product.id]">
        <img [src]="product.thumbnail" 
             [alt]="product.name"
             class="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
             loading="lazy">
        
        <!-- Stock Badge -->
        @if (!product.inStock) {
          <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span class="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold">
              {{ 'product.outOfStock' | translate }}
            </span>
          </div>
        }
      </div>

      <mat-card-content class="flex-1 flex flex-col p-4">
        <!-- Product Name -->
        <h3 class="text-lg font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
            [routerLink]="['/product', product.id]">
          {{ product.name }}
        </h3>

        <!-- Category -->
        <div class="mb-2">
          <mat-chip class="text-xs">{{ product.category }}</mat-chip>
        </div>

        <!-- Description -->
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">
          {{ product.description }}
        </p>

        <!-- Price Section -->
        <div class="mt-auto">
          <div class="flex items-center justify-between mb-3">
            <div>
              @if (product.originalPrice && product.originalPrice > product.price) {
                <span class="text-sm text-gray-500 dark:text-gray-400 line-through mr-2">
                  {{ product.originalPrice | number:'1.0-0' }} UZS
                </span>
              }
              <div class="text-xl font-bold text-primary-600 dark:text-primary-400">
                {{ product.price | number:'1.0-0' }} UZS
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <button mat-raised-button 
                  color="primary" 
                  class="w-full"
                  [routerLink]="['/product', product.id]"
                  [disabled]="!product.inStock">
            {{ 'common.viewMore' | translate }}
          </button>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .product-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    :host ::ng-deep .mat-mdc-card {
      border-radius: 12px !important;
    }

    :host ::ng-deep .mat-mdc-chip {
      font-size: 0.75rem !important;
      height: 24px !important;
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  getDiscountPercent(): number {
    if (this.product.originalPrice && this.product.originalPrice > this.product.price) {
      return Math.round(((this.product.originalPrice - this.product.price) / this.product.originalPrice) * 100);
    }
    return 0;
  }
}
