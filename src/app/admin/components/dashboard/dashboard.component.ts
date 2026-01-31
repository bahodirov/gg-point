import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
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
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 1.5rem;
      font-size: 1.75rem;
      font-weight: 500;
    }

    h2 {
      margin-bottom: 1rem;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: white;
    }

    .stat-icon.products {
      background: linear-gradient(135deg, #667eea, #764ba2);
    }

    .stat-icon.featured {
      background: linear-gradient(135deg, #f093fb, #f5576c);
    }

    .stat-icon.out-of-stock {
      background: linear-gradient(135deg, #ff9a9e, #fecfef);
    }

    .stat-icon.categories {
      background: linear-gradient(135deg, #a8edea, #fed6e3);
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 600;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .actions-section {
      margin-bottom: 2rem;
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
    }

    .categories-section {
      margin-bottom: 2rem;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .category-card mat-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1rem;
    }

    .category-name {
      font-weight: 500;
      text-transform: capitalize;
    }

    .category-count {
      font-size: 0.875rem;
      color: #666;
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
    this.http.get<any[]>('/api/products').subscribe({
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
