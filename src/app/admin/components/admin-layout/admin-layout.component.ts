import { Component, inject, PLATFORM_ID, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/services/auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
  ],
  template: `
    @if (authService.isLoading()) {
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
        <p>Loading...</p>
      </div>
    } @else if (!authService.isAuthenticated() && isBrowser) {
      <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh;">
        <p>Redirecting to login...</p>
      </div>
    } @else {
      <mat-sidenav-container style="min-height: 100vh;">
        <mat-sidenav #sidenav [mode]="sidenavMode" [opened]="sidenavOpened" style="width: 250px;">
          <div style="padding: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.12);">
            <h2 style="margin: 0; font-size: 20px; font-weight: 500;">GGPoint Admin</h2>
          </div>

          <mat-nav-list>
            <a mat-list-item routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeSidenavOnMobile()">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            <a mat-list-item routerLink="/admin/products" routerLinkActive="active" (click)="closeSidenavOnMobile()">
              <mat-icon matListItemIcon>inventory</mat-icon>
              <span matListItemTitle>Products</span>
            </a>

            <mat-divider style="margin: 8px 0;"></mat-divider>

            <a mat-list-item href="/" target="_blank">
              <mat-icon matListItemIcon>storefront</mat-icon>
              <span matListItemTitle>View Store</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar color="primary" style="position: sticky; top: 0; z-index: 1000;">
            <button mat-icon-button (click)="sidenav.toggle()" matTooltip="Toggle menu">
              <mat-icon>menu</mat-icon>
            </button>
            <span style="flex: 1;"></span>
            <span style="margin-right: 16px; font-size: 14px;">{{ authService.currentUser()?.username }}</span>
            <button mat-icon-button routerLink="/admin/change-password" matTooltip="Change Password">
              <mat-icon>lock</mat-icon>
            </button>
            <button mat-icon-button (click)="logout()" matTooltip="Logout">
              <mat-icon>logout</mat-icon>
            </button>
          </mat-toolbar>

          @if (dbHealth() && !dbHealth()?.healthy) {
            <div style="background-color: rgba(244, 67, 54, 0.1); color: #f44336; padding: 12px 16px; border-left: 4px solid #f44336; display: flex; align-items: center; gap: 8px;">
              <mat-icon>warning</mat-icon>
              <span>{{ dbHealth()?.warning }}</span>
              <span style="opacity: 0.7;">({{ dbHealth()?.database }})</span>
            </div>
          }

          <main>
            <router-outlet></router-outlet>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>
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

  closeSidenavOnMobile(): void {
    if (this.sidenavMode === 'over') {
      this.sidenavOpened = false;
    }
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
