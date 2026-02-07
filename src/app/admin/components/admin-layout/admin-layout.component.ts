import { Component, inject, PLATFORM_ID, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatProgressSpinnerModule,
  ],
  template: `
    @if (authService.isLoading()) {
      <div class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading...</p>
      </div>
    } @else if (!authService.isAuthenticated() && isBrowser) {
      <div class="loading-container">
        <p>Redirecting to login...</p>
      </div>
    } @else {
      <div class="admin-layout">
        @if (dbHealth() && !dbHealth()?.healthy) {
          <div class="database-warning">
            <mat-icon>warning</mat-icon>
            <span>{{ dbHealth()?.warning }}</span>
            <span class="db-status">({{ dbHealth()?.database }})</span>
          </div>
        }
        <mat-toolbar class="admin-toolbar">
          <button mat-icon-button (click)="toggleSidenav()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">GGPoint Admin</span>
          <span class="spacer"></span>

          <button mat-button [matMenuTriggerFor]="userMenu" class="user-profile-btn">
            <mat-icon>account_circle</mat-icon>
            <span class="hidden sm:inline ml-2">{{ authService.currentUser()?.username }}</span>
            <mat-icon class="ml-1">arrow_drop_down</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/admin/change-password">
              <mat-icon>lock</mat-icon>
              Change Password
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Logout
            </button>
          </mat-menu>
        </mat-toolbar>

        <mat-sidenav-container [class.has-warning]="!dbHealth()?.healthy" class="sidenav-container">
          <mat-sidenav [mode]="sidenavMode" [opened]="sidenavOpened" class="sidenav">
            <mat-nav-list>
              <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active">
                <mat-icon matListItemIcon>dashboard</mat-icon>
                <span matListItemTitle>Dashboard</span>
              </a>
              <a mat-list-item routerLink="/admin/products" routerLinkActive="active">
                <mat-icon matListItemIcon>inventory_2</mat-icon>
                <span matListItemTitle>Products</span>
              </a>
              <mat-divider></mat-divider>
              <a mat-list-item routerLink="/" target="_blank">
                <mat-icon matListItemIcon>store</mat-icon>
                <span matListItemTitle>View Store</span>
              </a>
            </mat-nav-list>
          </mat-sidenav>

          <mat-sidenav-content class="content">
            <router-outlet></router-outlet>
          </mat-sidenav-content>
        </mat-sidenav-container>
      </div>
    }
  `,
  styles: [`
    .loading-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.5rem;
      background: #0f172a;
      color: white;
    }

    .admin-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f8fafc;
    }

    .admin-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      background: white !important;
      color: #0f172a !important;
      border-bottom: 1px solid #e2e8f0;
      height: 64px;
    }

    .toolbar-title {
      margin-left: 0.75rem;
      font-weight: 700;
      font-size: 1.25rem;
      letter-spacing: -0.025em;
      color: #0f172a;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;
    }

    .sidenav {
      width: 280px;
      background: #1e293b;
      border-right: none;
      color: #cbd5e1;
    }

    .content {
      padding: 1.5rem;
      background-color: #f8fafc;
      min-height: calc(100vh - 64px);
    }

    :host-context(.dark-theme) .content {
      background-color: #0f172a;
    }

    .nav-header {
      padding: 1.5rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }

    mat-nav-list {
      padding: 0.5rem;
    }

    mat-nav-list a {
      height: 48px;
      margin: 4px 8px;
      border-radius: 10px;
      color: #94a3b8;
      transition: all 0.2s ease;
      font-weight: 500;
    }

    mat-nav-list a:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
    }

    mat-nav-list a.active {
      background-color: #0ea5e9;
      color: white;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.25);
    }

    mat-nav-list a mat-icon {
      color: inherit;
      margin-right: 12px;
    }

    mat-divider {
      margin: 1rem;
      border-top-color: rgba(255, 255, 255, 0.1);
    }

    .user-profile-btn {
      border-radius: 12px;
      padding: 0 12px;
      height: 44px;
      font-weight: 600;
      color: #1e293b;
    }

    .user-profile-btn:hover {
      background-color: #f1f5f9;
    }

    .database-warning {
      position: fixed;
      top: 64px;
      left: 0;
      right: 0;
      background-color: #fffbeb;
      color: #92400e;
      padding: 0.75rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      z-index: 999;
      border-bottom: 1px solid #fde68a;
      font-size: 0.875rem;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .admin-toolbar {
        height: 56px;
      }
      .sidenav-container {
        margin-top: 56px;
      }
      .database-warning {
        top: 56px;
      }
    }
  `]
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
