import { Component, inject, PLATFORM_ID, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/services/auth.service';

interface DatabaseHealth {
  healthy: boolean;
  warning: string | null;
  database: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (authService.isLoading()) {
      <div class="flex justify-center items-center min-h-screen bg-gray-950">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    } @else if (!authService.isAuthenticated() && isBrowser) {
      <div class="flex justify-center items-center min-h-screen bg-gray-950 text-gray-400">
        Redirecting to login...
      </div>
    } @else {
      <div class="flex min-h-screen bg-gray-950">

        <!-- Mobile overlay -->
        @if (sidebarOpen()) {
          <div class="fixed inset-0 bg-black/60 z-20 lg:hidden" (click)="sidebarOpen.set(false)"></div>
        }

        <!-- Sidebar -->
        <aside class="fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-200 lg:translate-x-0"
               [class.-translate-x-full]="!sidebarOpen()"
               [class.translate-x-0]="sidebarOpen()">

          <!-- Logo -->
          <div class="flex items-center h-16 px-5 border-b border-gray-800 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <span class="text-white font-bold text-lg tracking-tight">GGPoint</span>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto p-3 space-y-0.5">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pt-2 pb-1.5">Main</p>

            <a routerLink="/admin/dashboard"
               routerLinkActive #dashLink="routerLinkActive"
               (click)="closeSidenavOnMobile()"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150"
               [ngClass]="dashLink.isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Dashboard
            </a>

            <a routerLink="/admin/products"
               routerLinkActive #prodLink="routerLinkActive"
               (click)="closeSidenavOnMobile()"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150"
               [ngClass]="prodLink.isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              Products
            </a>

            <div class="border-t border-gray-800 my-2"></div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pb-1.5">Store</p>

            <a href="/" target="_blank"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors duration-150">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              View Store
              <svg class="w-3.5 h-3.5 ml-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
            </a>
          </nav>

          <!-- User section -->
          <div class="flex-shrink-0 p-3 border-t border-gray-800">
            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span class="text-white text-xs font-bold">{{ authService.currentUser()?.username?.charAt(0)?.toUpperCase() ?? 'A' }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">{{ authService.currentUser()?.username }}</p>
                <p class="text-xs text-gray-500">Administrator</p>
              </div>
              <div class="flex items-center gap-0.5">
                <a routerLink="/admin/change-password"
                   class="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-gray-700 transition-colors"
                   title="Change Password">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </a>
                <button (click)="logout()"
                        class="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors"
                        title="Logout">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main area -->
        <div class="flex-1 flex flex-col min-w-0 lg:ml-64">

          <!-- Top bar -->
          <header class="sticky top-0 z-20 h-16 bg-gray-900 border-b border-gray-800 flex items-center px-4 lg:px-6 gap-3 flex-shrink-0">
            <button class="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    (click)="toggleSidebar()">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <div class="flex-1"></div>

            @if (dbHealth() && !dbHealth()?.healthy) {
              <div class="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                DB Error
              </div>
            }
          </header>

          <!-- DB Warning banner -->
          @if (dbHealth() && !dbHealth()?.healthy) {
            <div class="bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 flex items-center gap-2 text-red-400 text-sm flex-shrink-0">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              {{ dbHealth()?.warning }} ({{ dbHealth()?.database }})
            </div>
          }

          <main class="flex-1 p-4 lg:p-6 overflow-auto">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    }
  `,
  styles: []
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private healthCheckInterval?: ReturnType<typeof setInterval>;

  dbHealth = signal<DatabaseHealth | null>(null);
  sidebarOpen = signal(false);
  isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    if (this.isBrowser && !this.authService.isLoading() && !this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.checkDatabaseHealth();
      this.healthCheckInterval = setInterval(() => this.checkDatabaseHealth(), 30000);
    }
  }

  ngOnDestroy(): void {
    if (this.healthCheckInterval !== undefined) {
      clearInterval(this.healthCheckInterval);
    }
  }

  private checkDatabaseHealth(): void {
    this.http.get<DatabaseHealth>('/api/admin/health').subscribe({
      next: (health) => this.dbHealth.set(health),
      error: () => this.dbHealth.set({
        healthy: false,
        warning: 'Ma\'lumotlar bazasi holatini tekshirib bo\'lmadi',
        database: 'unknown'
      })
    });
  }

  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }

  closeSidenavOnMobile(): void {
    if (this.isBrowser && window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
