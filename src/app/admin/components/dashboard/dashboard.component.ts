import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  ],
  template: `
    <div>
      <h1>Dashboard</h1>

      @if (isLoading()) {
        <div>
          <p>Loading...</p>
        </div>
      } @else {
        <div>
          <div>
            <span>{{ stats().totalProducts }}</span>
            <span>Total Products</span>
          </div>
          <div>
            <span>{{ stats().featuredProducts }}</span>
            <span>Featured Products</span>
          </div>
          <div>
            <span>{{ stats().outOfStock }}</span>
            <span>Out of Stock</span>
          </div>
          <div>
            <span>{{ stats().categories }}</span>
            <span>Categories</span>
          </div>
        </div>

        <div>
          <h2>Quick Actions</h2>
          <div>
            <a routerLink="/admin/products/new">Add New Product</a>
            <a routerLink="/admin/products">View All Products</a>
            <a href="/" target="_blank">View Store</a>
          </div>
        </div>

        @if (categoryStats().length > 0) {
          <div>
            <h2>Products by Category</h2>
            <div>
              @for (cat of categoryStats(); track cat.category) {
                <div>
                  <span>{{ cat.category }}</span>
                  <span>{{ cat.count }} products</span>
                </div>
              }
            </div>
          </div>
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
