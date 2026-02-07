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
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  template: `
    @if (authService.isLoading()) {
      <div>
        <p>Loading...</p>
      </div>
    } @else if (!authService.isAuthenticated() && isBrowser) {
      <div>
        <p>Redirecting to login...</p>
      </div>
    } @else {
      <div>
        @if (dbHealth() && !dbHealth()?.healthy) {
          <div>
            <span>⚠ {{ dbHealth()?.warning }}</span>
            <span>({{ dbHealth()?.database }})</span>
          </div>
        }
        <header>
          <button (click)="toggleSidenav()">☰</button>
          <span>GGPoint Admin</span>
          <span>{{ authService.currentUser()?.username }}</span>
          <a routerLink="/admin/change-password">Change Password</a>
          <button (click)="logout()">Logout</button>
        </header>

        <div>
          @if (sidenavOpened) {
            <nav>
              <a routerLink="/admin/dashboard" routerLinkActive="active">Dashboard</a>
              <a routerLink="/admin/products" routerLinkActive="active">Products</a>
              <hr>
              <a routerLink="/" target="_blank">View Store</a>
            </nav>
          }

          <main>
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
  isDarkMode = signal(false);

  sidenavOpened = true;
  sidenavMode: 'side' | 'over' = 'side';
  isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    // Check authentication on browser side
    if (this.isBrowser && !this.authService.isLoading() && !this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }

    // Responsive sidenav
    if (this.isBrowser && window.innerWidth < 768) {
      this.sidenavMode = 'over';
      this.sidenavOpened = false;
    }

    // Always use dark mode for admin panel
    this.isDarkMode.set(true);
    if (this.isBrowser) {
      this.applyTheme(true);
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.checkDatabaseHealth();
      // Har 30 soniyada tekshirish
      this.healthCheckInterval = setInterval(() => this.checkDatabaseHealth(), 30000);
    }
  }

  ngOnDestroy(): void {
    if (this.healthCheckInterval !== undefined) {
      clearInterval(this.healthCheckInterval);
    }
  }

  private checkDatabaseHealth(): void {
    this.http.get<DatabaseHealth>('/api/admin/health')
      .subscribe({
        next: (health) => this.dbHealth.set(health),
        error: (err) => {
          // Database health check error, set as unhealthy
          this.dbHealth.set({
            healthy: false,
            warning: 'Ma\'lumotlar bazasi holatini tekshirib bo\'lmadi',
            database: 'unknown'
          });
        }
      });
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  private applyTheme(darkMode: boolean): void {
    if (this.isBrowser) {
      const htmlElement = document.documentElement;
      if (darkMode) {
        htmlElement.classList.add('dark-theme');
      } else {
        htmlElement.classList.remove('dark-theme');
      }
    }
  }
}
