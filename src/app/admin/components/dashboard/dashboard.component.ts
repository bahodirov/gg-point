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
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <mat-card style="text-align: center;">
            <mat-card-content style="padding: 24px;">
              <mat-icon color="primary" style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px;">inventory</mat-icon>
              <div style="font-size: 36px; font-weight: 500; margin-bottom: 8px;">{{ stats().totalProducts }}</div>
              <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Total Products</div>
            </mat-card-content>
          </mat-card>

          <mat-card style="text-align: center;">
            <mat-card-content style="padding: 24px;">
              <mat-icon color="accent" style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px;">star</mat-icon>
              <div style="font-size: 36px; font-weight: 500; margin-bottom: 8px;">{{ stats().featuredProducts }}</div>
              <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Featured Products</div>
            </mat-card-content>
          </mat-card>

          <mat-card style="text-align: center;">
            <mat-card-content style="padding: 24px;">
              <mat-icon color="warn" style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px;">warning</mat-icon>
              <div style="font-size: 36px; font-weight: 500; margin-bottom: 8px;">{{ stats().outOfStock }}</div>
              <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Out of Stock</div>
            </mat-card-content>
          </mat-card>

          <mat-card style="text-align: center;">
            <mat-card-content style="padding: 24px;">
              <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; color: #9c27b0;">category</mat-icon>
              <div style="font-size: 36px; font-weight: 500; margin-bottom: 8px;">{{ stats().categories }}</div>
              <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Categories</div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions Card -->
        <mat-card style="margin-bottom: 24px;">
          <mat-card-header>
            <mat-card-title>Quick Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content style="padding: 16px;">
            <div style="display: flex; flex-wrap: wrap; gap: 12px;">
              <a mat-raised-button color="primary" routerLink="/admin/products/new">
                <mat-icon style="margin-right: 8px;">add</mat-icon>
                Add New Product
              </a>
              <a mat-raised-button routerLink="/admin/products">
                <mat-icon style="margin-right: 8px;">list</mat-icon>
                View All Products
              </a>
              <a mat-stroked-button href="/" target="_blank">
                <mat-icon style="margin-right: 8px;">storefront</mat-icon>
                View Store
              </a>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Category Stats Card -->
        @if (categoryStats().length > 0) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>Products by Category</mat-card-title>
            </mat-card-header>
            <mat-card-content style="padding: 0;">
              <mat-list>
                @for (cat of categoryStats(); track cat.category; let last = $last) {
                  <mat-list-item>
                    <mat-icon matListItemIcon>category</mat-icon>
                    <div matListItemTitle style="text-transform: capitalize;">{{ cat.category }}</div>
                    <div matListItemLine style="color: rgba(255, 255, 255, 0.7);">{{ cat.count }} products</div>
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
