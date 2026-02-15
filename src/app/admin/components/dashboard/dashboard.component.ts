import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ServerProduct } from '../../../shared/models/product.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface DashboardStats {
  totalProducts: number;
  featuredProducts: number;
  outOfStock: number;
  categories: number;
}

interface CategoryCount {
  category: string;
  count: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div style="padding: 24px;">
      <h1 style="margin: 0 0 24px 0; font-size: 32px; font-weight: 400;">Dashboard</h1>

      @if (isLoading()) {
        <div style="display: flex; justify-content: center; align-items: center; min-height: 400px;">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <!-- Stats Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px;">
          <!-- Total Products Card -->
          <mat-card style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; border-radius: 16px; overflow: hidden; position: relative;">
            <mat-card-content style="padding: 32px 24px; position: relative; z-index: 1;">
              <div style="background: rgba(255, 255, 255, 0.2); width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <mat-icon style="font-size: 40px; width: 40px; height: 40px; color: white;">inventory</mat-icon>
              </div>
              <div style="font-size: 42px; font-weight: 600; margin-bottom: 8px;">{{ stats().totalProducts }}</div>
              <div style="font-size: 16px; opacity: 0.95; font-weight: 500;">Total Products</div>
            </mat-card-content>
          </mat-card>

          <!-- Featured Products Card -->
          <mat-card style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-align: center; border-radius: 16px; overflow: hidden;">
            <mat-card-content style="padding: 32px 24px;">
              <div style="background: rgba(255, 255, 255, 0.2); width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <mat-icon style="font-size: 40px; width: 40px; height: 40px; color: white;">star</mat-icon>
              </div>
              <div style="font-size: 42px; font-weight: 600; margin-bottom: 8px;">{{ stats().featuredProducts }}</div>
              <div style="font-size: 16px; opacity: 0.95; font-weight: 500;">Featured Products</div>
            </mat-card-content>
          </mat-card>

          <!-- Out of Stock Card -->
          <mat-card style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; text-align: center; border-radius: 16px; overflow: hidden;">
            <mat-card-content style="padding: 32px 24px;">
              <div style="background: rgba(255, 255, 255, 0.2); width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <mat-icon style="font-size: 40px; width: 40px; height: 40px; color: white;">inventory_2</mat-icon>
              </div>
              <div style="font-size: 42px; font-weight: 600; margin-bottom: 8px;">{{ stats().outOfStock }}</div>
              <div style="font-size: 16px; opacity: 0.95; font-weight: 500;">Out of Stock</div>
            </mat-card-content>
          </mat-card>

          <!-- Categories Card -->
          <mat-card style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; text-align: center; border-radius: 16px; overflow: hidden;">
            <mat-card-content style="padding: 32px 24px;">
              <div style="background: rgba(255, 255, 255, 0.2); width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <mat-icon style="font-size: 40px; width: 40px; height: 40px; color: white;">category</mat-icon>
              </div>
              <div style="font-size: 42px; font-weight: 600; margin-bottom: 8px;">{{ stats().categories }}</div>
              <div style="font-size: 16px; opacity: 0.95; font-weight: 500;">Categories</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions Card -->
        <mat-card style="margin-bottom: 32px; border-radius: 12px;">
          <mat-card-header style="padding: 24px 24px 16px;">
            <mat-icon style="margin-right: 12px; color: #667eea;">flash_on</mat-icon>
            <mat-card-title style="margin: 0;">Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content style="padding: 16px 24px 24px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
              <a mat-raised-button color="primary" routerLink="/admin/products/new"
                 style="height: 56px; font-size: 15px; font-weight: 500; border-radius: 8px;">
                <mat-icon style="margin-right: 8px;">add_circle</mat-icon>
                Add New Product
              </a>
              <a mat-raised-button routerLink="/admin/products"
                 style="height: 56px; font-size: 15px; font-weight: 500; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 8px;">
                <mat-icon style="margin-right: 8px;">view_list</mat-icon>
                View All Products
              </a>
              <a mat-stroked-button href="/" target="_blank"
                 style="height: 56px; font-size: 15px; font-weight: 500; border-radius: 8px; border-width: 2px;">
                <mat-icon style="margin-right: 8px;">storefront</mat-icon>
                View Store
              </a>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Category Stats Card -->
        @if (categoryStats().length > 0) {
          <mat-card style="border-radius: 12px;">
            <mat-card-header style="padding: 24px 24px 16px;">
              <mat-icon style="margin-right: 12px; color: #4facfe;">insights</mat-icon>
              <mat-card-title style="margin: 0;">Products by Category</mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding: 0;">
              <mat-list>
                @for (cat of categoryStats(); track cat.category; let last = $last; let i = $index) {
                  <mat-list-item style="padding: 16px 24px; min-height: 64px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; margin-right: 16px;">
                      <mat-icon style="color: white;">category</mat-icon>
                    </div>
                    <div style="flex: 1;">
                      <div matListItemTitle style="text-transform: capitalize; font-weight: 500; font-size: 16px; margin-bottom: 4px;">
                        {{ cat.category }}
                      </div>
                      <div matListItemLine style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">
                        {{ cat.count }} {{ cat.count === 1 ? 'product' : 'products' }}
                      </div>
                    </div>
                    <div style="background: rgba(102, 126, 234, 0.1); color: #667eea; padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: 18px;">
                      {{ cat.count }}
                    </div>
                  </mat-list-item>
                  @if (!last) {
                    <mat-divider></mat-divider>
                  }
                }
              </mat-list>
            </mat-card-content>
          </mat-card>
        }
      }
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);

  isLoading = signal(true);
  stats = signal<DashboardStats>({
    totalProducts: 0,
    featuredProducts: 0,
    outOfStock: 0,
    categories: 0
  });
  categoryStats = signal<CategoryCount[]>([]);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    // Load products
    this.http.get<ServerProduct[]>('/api/products').subscribe({
      next: (products) => {
        const totalProducts = products.length;
        const featuredProducts = products.filter(p => p.featured).length;
        const outOfStock = products.filter(p => !p.inStock).length;

        // Get unique categories
        const categories = new Set(products.map(p => p.category));

        this.stats.set({
          totalProducts,
          featuredProducts,
          outOfStock,
          categories: categories.size
        });

        // Calculate category stats
        const catCounts: Record<string, number> = {};
        products.forEach(p => {
          catCounts[p.category] = (catCounts[p.category] || 0) + 1;
        });

        this.categoryStats.set(
          Object.entries(catCounts).map(([category, count]) => ({ category, count }))
        );

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
