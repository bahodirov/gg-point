import { Component, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../auth/services/auth.service';

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
        <mat-toolbar color="primary" class="admin-toolbar">
          <button mat-icon-button (click)="toggleSidenav()">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="toolbar-title">GGPoint Admin</span>
          <span class="spacer"></span>
          
          <button mat-button [matMenuTriggerFor]="userMenu">
            <mat-icon>account_circle</mat-icon>
            {{ authService.currentUser()?.username }}
            <mat-icon>arrow_drop_down</mat-icon>
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

        <mat-sidenav-container class="sidenav-container">
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
      gap: 1rem;
    }

    .admin-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .admin-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .toolbar-title {
      margin-left: 0.5rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;
    }

    .sidenav {
      width: 250px;
      background: #fafafa;
    }

    :host-context(.dark-theme) .sidenav {
      background: #1e1e1e;
    }

    .content {
      padding: 1.5rem;
      background: #f5f5f5;
      min-height: calc(100vh - 64px);
    }

    :host-context(.dark-theme) .content {
      background: #121212;
    }

    mat-nav-list a.active {
      background-color: rgba(103, 58, 183, 0.1);
      border-left: 3px solid #673ab7;
    }

    mat-divider {
      margin: 1rem 0;
    }

    @media (max-width: 768px) {
      .sidenav-container {
        margin-top: 56px;
      }

      .content {
        min-height: calc(100vh - 56px);
        padding: 1rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

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
  }

  toggleSidenav(): void {
    this.sidenavOpened = !this.sidenavOpened;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
