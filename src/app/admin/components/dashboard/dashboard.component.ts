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
      font-size: 2rem;
      font-weight: 600;
      color: #1e3c72;
      letter-spacing: 0.5px;
    }

    :host-context(.dark-theme) h1 {
      color: #e3f2fd;
    }

    h2 {
      margin-bottom: 1.25rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2a5298;
    }

    :host-context(.dark-theme) h2 {
      color: #bbdefb;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(30, 60, 114, 0.08);
      transition: all 0.3s ease;
      border: 1px solid rgba(30, 60, 114, 0.1);
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(30, 60, 114, 0.15);
    }

    :host-context(.dark-theme) .stat-card {
      background: linear-gradient(135deg, #1a2f5c 0%, #1e3c72 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.5rem;
    }

    .stat-icon {
      width: 70px;
      height: 70px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-icon mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: white;
    }

    .stat-icon.products {
      background: linear-gradient(135deg, #1e3c72, #2a5298);
    }

    .stat-icon.featured {
      background: linear-gradient(135deg, #f59e0b, #f97316);
    }

    .stat-icon.out-of-stock {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .stat-icon.categories {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      color: #1e3c72;
    }

    :host-context(.dark-theme) .stat-value {
      color: white;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.5rem;
      font-weight: 500;
    }

    :host-context(.dark-theme) .stat-label {
      color: rgba(255, 255, 255, 0.7);
    }

    .actions-section {
      margin-bottom: 3rem;
    }

    .actions-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .actions-grid button,
    .actions-grid a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .actions-grid button:hover,
    .actions-grid a:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(30, 60, 114, 0.2);
    }

    .categories-section {
      margin-bottom: 2rem;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem;
    }

    .category-card {
      background: white;
      border-radius: 12px;
      border: 1px solid rgba(30, 60, 114, 0.1);
      transition: all 0.3s ease;
    }

    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(30, 60, 114, 0.1);
    }

    :host-context(.dark-theme) .category-card {
      background: linear-gradient(135deg, #1a2f5c 0%, #1e3c72 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .category-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.25rem;
    }

    .category-name {
      font-weight: 600;
      text-transform: capitalize;
      color: #1e3c72;
      font-size: 1rem;
    }

    :host-context(.dark-theme) .category-name {
      color: white;
    }

    .category-count {
      font-size: 0.875rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    :host-context(.dark-theme) .category-count {
      color: rgba(255, 255, 255, 0.6);
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
