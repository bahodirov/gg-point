import { Component, inject, signal, HostListener, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-soon-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, TranslateModule],
  template: `
    <!-- Trigger Button -->
    <button mat-raised-button color="accent" class="soon-trigger-btn" (click)="open()">
      <mat-icon class="mr-2">upcoming</mat-icon>
      {{ 'soon.button' | translate }}
    </button>

    <!-- Modal Overlay -->
    @if (isOpen()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="modal-header">
            <div class="flex items-center gap-2">
              <mat-icon class="text-primary-500">upcoming</mat-icon>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ 'soon.title' | translate }}</h2>
            </div>
            <button mat-icon-button (click)="close()" class="text-gray-500 hover:text-gray-700">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Carousel -->
          <div class="carousel-container">
            @if (products.length > 0) {
              <div class="carousel-track" [style.transform]="'translateX(-' + (activeSlide() * 100) + '%)'">
                @for (product of products; track product.id) {
                  <div class="carousel-slide">
                    <a [routerLink]="['/product', product.id]" (click)="close()" class="block">
                      <img [src]="product.thumbnail" [alt]="product.name"
                           class="w-full h-56 object-cover rounded-t-lg">
                    </a>
                    <div class="p-4">
                      <p class="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase mb-1">{{ product.category }}</p>
                      <h3 class="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{{ product.name }}</h3>
                      <p class="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">{{ product.description }}</p>
                      <div class="flex items-center justify-between">
                        <span class="text-xl font-bold text-primary-600 dark:text-primary-400">
                          {{ product.price | number:'1.0-0' }} UZS
                        </span>
                        <a [routerLink]="['/product', product.id]" (click)="close()" mat-raised-button color="primary" class="text-sm">
                          {{ 'common.viewMore' | translate }}
                        </a>
                      </div>
                    </div>
                  </div>
                }
              </div>

              <!-- Navigation -->
              @if (products.length > 1) {
                <button class="carousel-btn left" (click)="prev()">
                  <mat-icon>chevron_left</mat-icon>
                </button>
                <button class="carousel-btn right" (click)="next()">
                  <mat-icon>chevron_right</mat-icon>
                </button>
                <!-- Dots -->
                <div class="carousel-dots">
                  @for (p of products; track p.id; let i = $index) {
                    <button class="dot" [class.active]="i === activeSlide()" (click)="activeSlide.set(i)"></button>
                  }
                </div>
              }
            } @else {
              <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                <mat-icon class="text-5xl mb-3" style="font-size:48px;width:48px;height:48px;">inventory_2</mat-icon>
                <p>{{ 'soon.noProducts' | translate }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .soon-trigger-btn {
      background: linear-gradient(135deg, #f59e0b, #ef4444) !important;
      color: white !important;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      width: 100%;
      max-width: 480px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    :host-context(.dark) .modal-content {
      background: #1f2937;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .carousel-container {
      position: relative;
      overflow: hidden;
    }

    .carousel-track {
      display: flex;
      transition: transform 0.4s ease;
    }

    .carousel-slide {
      min-width: 100%;
    }

    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.9);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1;
      transition: background 0.2s;
    }
    .carousel-btn:hover { background: white; }
    .carousel-btn.left { left: 8px; }
    .carousel-btn.right { right: 8px; }

    .carousel-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      padding: 12px 0 16px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #d1d5db;
      border: none;
      cursor: pointer;
      transition: background 0.2s;
      padding: 0;
    }
    .dot.active { background: #0ea5e9; }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class SoonModalComponent implements OnInit {
  private productService = inject(ProductService);
  private platformId = inject(PLATFORM_ID);

  isOpen = signal(false);
  activeSlide = signal(0);
  products: Product[] = [];

  @HostListener('document:keydown.escape')
  onEscape(): void { this.close(); }

  ngOnInit(): void {
    // Show new/featured products as "coming soon" highlights
    this.products = [
      ...this.productService.getNewProducts(3),
      ...this.productService.getFeaturedProducts(3)
    ].slice(0, 5);
  }

  open(): void {
    this.isOpen.set(true);
    this.activeSlide.set(0);
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen.set(false);
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = '';
  }

  next(): void {
    this.activeSlide.set((this.activeSlide() + 1) % this.products.length);
  }

  prev(): void {
    this.activeSlide.set((this.activeSlide() - 1 + this.products.length) % this.products.length);
  }
}
