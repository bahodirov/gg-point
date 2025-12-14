import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TranslateModule } from '@ngx-translate/core';
import { ThemeService } from '../../../core/services/theme.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    TranslateModule
  ],
  template: `
    <mat-toolbar class="header sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div class="container mx-auto px-4 flex items-center justify-between">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center space-x-2 no-underline">
          <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">GG</span>
          <span class="text-2xl font-bold text-gray-800 dark:text-white">Point</span>
        </a>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-6">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" 
             class="nav-link">
            {{ 'header.home' | translate }}
          </a>
          <a routerLink="/catalog" routerLinkActive="active" class="nav-link">
            {{ 'header.catalog' | translate }}
          </a>
          <a routerLink="/blog" routerLinkActive="active" class="nav-link">
            {{ 'header.blog' | translate }}
          </a>
          <a routerLink="/about" routerLinkActive="active" class="nav-link">
            {{ 'header.about' | translate }}
          </a>
          <a routerLink="/contact" routerLinkActive="active" class="nav-link">
            {{ 'header.contact' | translate }}
          </a>
          <a routerLink="/faq" routerLinkActive="active" class="nav-link">
            {{ 'header.faq' | translate }}
          </a>
        </nav>

        <!-- Actions -->
        <div class="flex items-center space-x-2 header-actions">
          <!-- Language Switcher -->
          <button mat-icon-button [matMenuTriggerFor]="languageMenu" 
                  class="text-gray-700 dark:text-gray-300 language-toggle-btn"
                  [attr.aria-label]="'header.language' | translate">
            <mat-icon>language</mat-icon>
          </button>
          <mat-menu #languageMenu="matMenu">
            <button mat-menu-item 
                    (click)="languageService.setLanguage('ru')"
                    [class.active-language]="languageService.currentLanguage() === 'ru'">
              <mat-icon>{{ languageService.currentLanguage() === 'ru' ? 'check' : '' }}</mat-icon>
              <span>Русский</span>
            </button>
            <button mat-menu-item 
                    (click)="languageService.setLanguage('uz')"
                    [class.active-language]="languageService.currentLanguage() === 'uz'">
              <mat-icon>{{ languageService.currentLanguage() === 'uz' ? 'check' : '' }}</mat-icon>
              <span>O'zbek</span>
            </button>
          </mat-menu>

          <!-- Theme Toggle -->
          <button mat-icon-button (click)="themeService.toggleTheme()" 
                  class="text-gray-700 dark:text-gray-300 theme-toggle-btn"
                  aria-label="Toggle theme">
            <mat-icon>{{ themeService.theme() === 'light' ? 'dark_mode' : 'light_mode' }}</mat-icon>
          </button>

          <!-- Mobile Menu Toggle -->
          <button mat-icon-button (click)="mobileMenuOpen.set(!mobileMenuOpen())" 
                  class="md:hidden text-gray-700 dark:text-gray-300 menu-toggle-btn"
                  aria-label="Toggle menu">
            <mat-icon>{{ mobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      @if (mobileMenuOpen()) {
        <div class="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg z-40">
          <nav class="flex flex-col p-4 space-y-2">
            <a routerLink="/" (click)="mobileMenuOpen.set(false)" 
               class="mobile-nav-link">
              {{ 'header.home' | translate }}
            </a>
            <a routerLink="/catalog" (click)="mobileMenuOpen.set(false)" 
               class="mobile-nav-link">
              {{ 'header.catalog' | translate }}
            </a>
            <a routerLink="/blog" (click)="mobileMenuOpen.set(false)" 
               class="mobile-nav-link">
              {{ 'header.blog' | translate }}
            </a>
            <a routerLink="/about" (click)="mobileMenuOpen.set(false)" 
               class="mobile-nav-link">
              {{ 'header.about' | translate }}
            </a>
            <a routerLink="/contact" (click)="mobileMenuOpen.set(false)" 
               class="mobile-nav-link">
              {{ 'header.contact' | translate }}
            </a>
            <a routerLink="/faq" (click)="mobileMenuOpen.set(false)" 
               class="mobile-nav-link">
              {{ 'header.faq' | translate }}
            </a>
          </nav>
        </div>
      }
    </mat-toolbar>
  `,
  styles: [`
    .header {
      min-height: 64px;
    }

    .nav-link {
      text-decoration: none;
      color: inherit;
      font-weight: 500;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
    }

    .nav-link:hover {
      color: #0ea5e9;
      border-bottom-color: #0ea5e9;
    }

    .nav-link.active {
      color: #0ea5e9;
      border-bottom-color: #0ea5e9;
    }

    .mobile-nav-link {
      text-decoration: none;
      color: inherit;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      display: block;
    }

    .mobile-nav-link:hover {
      background-color: rgba(14, 165, 233, 0.1);
      color: #0ea5e9;
    }

    :host ::ng-deep .mat-toolbar {
      padding: 0 !important;
    }

    .header-actions {
      min-width: fit-content;
    }

    :host ::ng-deep .theme-toggle-btn,
    :host ::ng-deep .menu-toggle-btn {
      width: 48px !important;
      height: 48px !important;
      flex-shrink: 0;
    }

    :host ::ng-deep .theme-toggle-btn .mat-icon,
    :host ::ng-deep .menu-toggle-btn .mat-icon,
    :host ::ng-deep .language-toggle-btn .mat-icon {
      font-size: 24px !important;
      width: 24px !important;
      height: 24px !important;
      line-height: 24px !important;
    }

    :host ::ng-deep .language-toggle-btn {
      width: 48px !important;
      height: 48px !important;
      flex-shrink: 0;
    }

    .active-language {
      background-color: rgba(14, 165, 233, 0.1);
      color: #0ea5e9;
    }

    :host ::ng-deep .mat-mdc-menu-content {
      padding: 0.5rem 0;
    }

    :host ::ng-deep .mat-mdc-menu-item {
      min-height: 48px;
    }
  `]
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  languageService = inject(LanguageService);
  mobileMenuOpen = signal(false);
}
