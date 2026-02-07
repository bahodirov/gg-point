import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServerProduct } from '../../../shared/models/product.model';

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
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon products">
                <mat-icon>inventory_2</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().totalProducts }}</span>
                <span class="stat-label">Total Products</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon featured">
                <mat-icon>star</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().featuredProducts }}</span>
                <span class="stat-label">Featured Products</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon out-of-stock">
                <mat-icon>remove_shopping_cart</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().outOfStock }}</span>
                <span class="stat-label">Out of Stock</span>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon categories">
                <mat-icon>category</mat-icon>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats().categories }}</span>
                <span class="stat-label">Categories</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="actions-section">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button mat-raised-button color="primary" routerLink="/admin/products/new">
              <mat-icon>add</mat-icon>
              Add New Product
            </button>
            <button mat-raised-button routerLink="/admin/products">
              <mat-icon>list</mat-icon>
              View All Products
            </button>
            <a mat-raised-button href="/" target="_blank">
              <mat-icon>store</mat-icon>
              View Store
            </a>
          </div>
        </div>

        @if (categoryStats().length > 0) {
          <div class="categories-section">
            <h2>Products by Category</h2>
            <div class="categories-grid">
              @for (cat of categoryStats(); track cat.category) {
                <mat-card class="category-card">
                  <mat-card-content>
                    <span class="category-name">{{ cat.category }}</span>
                    <span class="category-count">{{ cat.count }} products</span>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 2rem;
      font-size: 2.25rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.025em;
    }

    h2 {
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: -0.025em;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 4rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1);
      border-color: #0ea5e9;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.75rem;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .stat-icon.products {
      background-color: #f0f9ff;
      color: #0ea5e9;
    }

    .stat-icon.featured {
      background-color: #fffbeb;
      color: #f59e0b;
    }

    .stat-icon.out-of-stock {
      background-color: #fef2f2;
      color: #ef4444;
    }

    .stat-icon.categories {
      background-color: #f0fdf4;
      color: #10b981;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 2.25rem;
      font-weight: 800;
      line-height: 1.1;
      color: #0f172a;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.25rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .actions-section {
      margin-bottom: 4rem;
      background: white;
      padding: 2rem;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
    }

    .actions-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .actions-grid button,
    .actions-grid a {
      height: 48px;
      padding: 0 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .categories-section {
      margin-bottom: 3rem;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1.25rem;
    }

    .category-card {
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }

    .category-card:hover {
      border-color: #0ea5e9;
      background-color: #f0f9ff;
    }

    .category-card mat-card-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .category-name {
      font-weight: 700;
      color: #1e293b;
      font-size: 1.125rem;
      margin-bottom: 0.25rem;
    }

    .category-count {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 500;
    }
  `]
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
