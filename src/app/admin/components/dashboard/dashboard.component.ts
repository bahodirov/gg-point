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
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6">

      <!-- Page header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Dashboard</h1>
        <p class="text-gray-400 text-sm mt-1">Store overview and quick actions</p>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center items-center py-24">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      } @else {

        <!-- Stats grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <!-- Total Products -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              </div>
              <span class="text-xs text-gray-500 font-medium">All time</span>
            </div>
            <p class="text-3xl font-bold text-white">{{ stats().totalProducts }}</p>
            <p class="text-sm text-gray-400 mt-1">Total Products</p>
          </div>

          <!-- Featured Products -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              </div>
              <span class="text-xs text-gray-500 font-medium">Highlighted</span>
            </div>
            <p class="text-3xl font-bold text-white">{{ stats().featuredProducts }}</p>
            <p class="text-sm text-gray-400 mt-1">Featured Products</p>
          </div>

          <!-- Out of Stock -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                </svg>
              </div>
              @if (stats().outOfStock > 0) {
                <span class="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-medium">Attention</span>
              } @else {
                <span class="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full font-medium">Good</span>
              }
            </div>
            <p class="text-3xl font-bold text-white">{{ stats().outOfStock }}</p>
            <p class="text-sm text-gray-400 mt-1">Out of Stock</p>
          </div>

          <!-- Categories -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </div>
              <span class="text-xs text-gray-500 font-medium">Types</span>
            </div>
            <p class="text-3xl font-bold text-white">{{ stats().categories }}</p>
            <p class="text-sm text-gray-400 mt-1">Categories</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <div class="flex items-center gap-2 mb-4">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <h2 class="text-sm font-semibold text-gray-300 uppercase tracking-wider">Quick Actions</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a routerLink="/admin/products/new"
               class="flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium text-sm transition-colors">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add New Product
            </a>
            <a routerLink="/admin/products"
               class="flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium text-sm transition-colors">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
              </svg>
              View All Products
            </a>
            <a href="/" target="_blank"
               class="flex items-center gap-3 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium text-sm transition-colors border border-gray-600">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              View Store
              <svg class="w-3.5 h-3.5 ml-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </div>
        </div>

        <!-- Category breakdown -->
        @if (categoryStats().length > 0) {
          <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-700 flex items-center gap-2">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <h2 class="font-semibold text-white text-sm">Products by Category</h2>
            </div>
            <div class="divide-y divide-gray-700">
              @for (cat of categoryStats(); track cat.category) {
                <div class="flex items-center justify-between px-5 py-3.5 hover:bg-gray-700/50 transition-colors">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                      </svg>
                    </div>
                    <span class="text-white text-sm font-medium capitalize">{{ cat.category }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-28 bg-gray-700 rounded-full h-1.5 hidden sm:block">
                      <div class="bg-blue-500 h-1.5 rounded-full"
                           [style.width]="(cat.count / stats().totalProducts * 100) + '%'"></div>
                    </div>
                    <span class="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full min-w-[2rem] text-center">
                      {{ cat.count }}
                    </span>
                  </div>
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
  stats = signal<DashboardStats>({ totalProducts: 0, featuredProducts: 0, outOfStock: 0, categories: 0 });
  categoryStats = signal<CategoryCount[]>([]);

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.http.get<ServerProduct[]>('/api/products').subscribe({
      next: (products) => {
        const totalProducts = products.length;
        const featuredProducts = products.filter(p => p.featured).length;
        const outOfStock = products.filter(p => !p.inStock).length;
        const categories = new Set(products.map(p => p.category));

        this.stats.set({ totalProducts, featuredProducts, outOfStock, categories: categories.size });

        const catCounts: Record<string, number> = {};
        products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
        this.categoryStats.set(
          Object.entries(catCounts)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
        );

        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
