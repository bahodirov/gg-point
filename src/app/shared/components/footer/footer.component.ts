import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, TranslateModule],
  template: `
    <footer class="bg-gray-900 text-gray-300 py-12">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- About Section -->
          <div>
            <div class="flex items-center space-x-2 mb-4">
              <span class="text-2xl font-bold text-primary-400">GG</span>
              <span class="text-2xl font-bold text-white">Point</span>
            </div>
            <p class="text-sm mb-4">
              {{ 'footer.aboutText' | translate }}
            </p>
            <!-- Social Links -->
            <div class="flex space-x-2">
              <a href="https://t.me/GGPointUz" target="_blank" rel="noopener"
                 class="social-link" aria-label="Telegram">
                <mat-icon>telegram</mat-icon>
              </a>
              <a href="https://instagram.com/ggpoint" target="_blank" rel="noopener"
                 class="social-link" aria-label="Instagram">
                <mat-icon>photo_camera</mat-icon>
              </a>
              <a href="https://facebook.com/ggpoint" target="_blank" rel="noopener"
                 class="social-link" aria-label="Facebook">
                <mat-icon>facebook</mat-icon>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="text-white font-semibold mb-4">{{ 'footer.quickLinks' | translate }}</h3>
            <ul class="space-y-2">
              <li>
                <a routerLink="/" class="footer-link">{{ 'header.home' | translate }}</a>
              </li>
              <li>
                <a routerLink="/catalog" class="footer-link">{{ 'header.catalog' | translate }}</a>
              </li>
              <li>
                <a routerLink="/blog" class="footer-link">{{ 'header.blog' | translate }}</a>
              </li>
              <li>
                <a routerLink="/about" class="footer-link">{{ 'header.about' | translate }}</a>
              </li>
              <li>
                <a routerLink="/contact" class="footer-link">{{ 'header.contact' | translate }}</a>
              </li>
              <li>
                <a routerLink="/faq" class="footer-link">{{ 'header.faq' | translate }}</a>
              </li>
            </ul>
          </div>

          <!-- Categories -->
          <div>
            <h3 class="text-white font-semibold mb-4">{{ 'footer.categories' | translate }}</h3>
            <ul class="space-y-2">
              <li>
                <a routerLink="/catalog" [queryParams]="{category: 'mice'}" class="footer-link">Mice</a>
              </li>
              <li>
                <a routerLink="/catalog" [queryParams]="{category: 'keyboards'}" class="footer-link">Keyboards</a>
              </li>
              <li>
                <a routerLink="/catalog" [queryParams]="{category: 'headsets'}" class="footer-link">Headsets</a>
              </li>
              <li>
                <a routerLink="/catalog" [queryParams]="{category: 'monitors'}" class="footer-link">Monitors</a>
              </li>
              <li>
                <a routerLink="/catalog" [queryParams]="{category: 'accessories'}" class="footer-link">Accessories</a>
              </li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div>
            <h3 class="text-white font-semibold mb-4">{{ 'header.contact' | translate }}</h3>
            <ul class="space-y-3">
              <li class="flex items-start">
                <mat-icon class="mr-2 text-primary-400">phone</mat-icon>
                <span class="text-sm">+998 90 123 45 67</span>
              </li>
              <li class="flex items-start">
                <mat-icon class="mr-2 text-primary-400">email</mat-icon>
                <span class="text-sm">info&#64;gg-point.uz</span>
              </li>
              <li class="flex items-start">
                <mat-icon class="mr-2 text-primary-400">location_on</mat-icon>
                <span class="text-sm">Tashkent, Uzbekistan</span>
              </li>
              <li class="flex items-start">
                <mat-icon class="mr-2 text-primary-400">schedule</mat-icon>
                <span class="text-sm">9:00 - 20:00</span>
              </li>
            </ul>
            <!-- Admin Panel Button -->
            <div class="mt-6">
              <a routerLink="/login" class="admin-button">
                <mat-icon class="mr-2">admin_panel_settings</mat-icon>
                <span>Admin Panel</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>{{ 'footer.copyright' | translate }}</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-link {
      text-decoration: none;
      color: #d1d5db;
      font-size: 0.875rem;
      transition: color 0.2s ease;
      display: inline-block;
    }

    .footer-link:hover {
      color: #0ea5e9;
    }

    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.1);
      color: #d1d5db;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .social-link:hover {
      background-color: #0ea5e9;
      color: white;
    }

    mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .admin-button {
      display: inline-flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(14, 165, 233, 0.2);
    }

    .admin-button:hover {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(14, 165, 233, 0.3);
    }

    .admin-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
  `]
})
export class FooterComponent {}
