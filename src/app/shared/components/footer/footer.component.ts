import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, TranslateModule],
  template: `
    <footer class="site-footer">
      <!-- Top glow line -->
      <div class="footer-glow-line"></div>

      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Brand -->
          <div>
            <div class="footer-logo">
              <span class="logo-gg">GG</span><span class="logo-point">Point</span>
            </div>
            <p class="footer-about">{{ 'footer.aboutText' | translate }}</p>
            <div class="social-links">
              <a href="https://t.me/GGPointUz" target="_blank" rel="noopener" class="social-btn" aria-label="Telegram">
                <mat-icon>telegram</mat-icon>
              </a>
              <a href="https://instagram.com/ggpoint" target="_blank" rel="noopener" class="social-btn" aria-label="Instagram">
                <mat-icon>photo_camera</mat-icon>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h3 class="footer-heading">{{ 'footer.quickLinks' | translate }}</h3>
            <ul class="footer-links">
              <li><a routerLink="/"        class="footer-link">{{ 'header.home'    | translate }}</a></li>
              <li><a routerLink="/catalog" class="footer-link">{{ 'header.catalog' | translate }}</a></li>
              <li><a routerLink="/blog"    class="footer-link">{{ 'header.blog'    | translate }}</a></li>
              <li><a routerLink="/about"   class="footer-link">{{ 'header.about'   | translate }}</a></li>
              <li><a routerLink="/contact" class="footer-link">{{ 'header.contact' | translate }}</a></li>
              <li><a routerLink="/faq"     class="footer-link">{{ 'header.faq'     | translate }}</a></li>
            </ul>
          </div>

          <!-- Categories -->
          <div>
            <h3 class="footer-heading">{{ 'footer.categories' | translate }}</h3>
            <ul class="footer-links">
              <li><a routerLink="/catalog" [queryParams]="{category:'mice'}"      class="footer-link">Gaming Mice</a></li>
              <li><a routerLink="/catalog" [queryParams]="{category:'keyboards'}" class="footer-link">Keyboards</a></li>
              <li><a routerLink="/catalog" [queryParams]="{category:'headsets'}"  class="footer-link">Headsets</a></li>
              <li><a routerLink="/catalog" [queryParams]="{category:'monitors'}"  class="footer-link">Monitors</a></li>
              <li><a routerLink="/catalog" [queryParams]="{category:'keycaps'}"   class="footer-link">Keycaps</a></li>
              <li><a routerLink="/catalog" [queryParams]="{category:'mousepads'}" class="footer-link">Mousepads</a></li>
            </ul>
          </div>

          <!-- Contacts -->
          <div>
            <h3 class="footer-heading">{{ 'header.contact' | translate }}</h3>
            <ul class="contact-list">
              <li><mat-icon>phone</mat-icon><span>+998 90 123 45 67</span></li>
              <li><mat-icon>email</mat-icon><span>info&#64;gg-point.uz</span></li>
              <li><mat-icon>location_on</mat-icon><span>Tashkent, Uzbekistan</span></li>
              <li><mat-icon>schedule</mat-icon><span>09:00 – 20:00</span></li>
            </ul>
            <a routerLink="/login" class="admin-link">
              <mat-icon>admin_panel_settings</mat-icon>
              Admin Panel
            </a>
          </div>
        </div>

        <!-- Bottom -->
        <div class="footer-bottom">
          <p>{{ 'footer.copyright' | translate }}</p>
          <div class="footer-bottom-tags">
            <span>Gaming</span><span>Uzbekistan</span><span>Tashkent</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #060a14;
      border-top: 1px solid rgba(59,130,246,0.1);
      position: relative;
    }
    .footer-glow-line {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(139,92,246,0.5), transparent);
    }

    .footer-logo { display: flex; align-items: center; margin-bottom: 12px; gap: 2px; }
    .logo-gg {
      font-size: 1.75rem; font-weight: 900;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      letter-spacing: -1px;
    }
    .logo-point { font-size: 1.75rem; font-weight: 900; color: #e2e8f0; letter-spacing: -1px; }

    .footer-about { font-size: 13px; color: #7c8db5; line-height: 1.6; margin-bottom: 16px; }

    .social-links { display: flex; gap: 8px; }
    .social-btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 36px; height: 36px; border-radius: 8px;
      background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
      color: #94a3b8; text-decoration: none; transition: all 0.2s;
    }
    .social-btn:hover { background: rgba(59,130,246,0.25); color: #60a5fa; box-shadow: 0 0 10px rgba(59,130,246,0.25); }
    .social-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .footer-heading { font-size: 13px; font-weight: 700; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }

    .footer-links { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .footer-link {
      text-decoration: none; color: #7c8db5; font-size: 13px; transition: color 0.2s;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .footer-link:hover { color: #60a5fa; }

    .contact-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .contact-list li { display: flex; align-items: center; gap: 8px; color: #7c8db5; font-size: 13px; }
    .contact-list mat-icon { font-size: 16px; width: 16px; height: 16px; color: #3b82f6; flex-shrink: 0; }

    .admin-link {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px;
      background: linear-gradient(135deg, rgba(37,99,235,0.2), rgba(124,58,237,0.2));
      border: 1px solid rgba(59,130,246,0.3);
      border-radius: 8px; color: #60a5fa; text-decoration: none;
      font-size: 13px; font-weight: 600; transition: all 0.2s;
    }
    .admin-link:hover { box-shadow: 0 0 12px rgba(59,130,246,0.25); border-color: rgba(59,130,246,0.5); }
    .admin-link mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .footer-bottom {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px;
      margin-top: 40px; padding-top: 20px;
      border-top: 1px solid rgba(59,130,246,0.08);
      font-size: 12px; color: #64748b;
    }
    .footer-bottom-tags { display: flex; gap: 8px; }
    .footer-bottom-tags span {
      padding: 2px 10px; border-radius: 20px;
      background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15);
      color: #7c8db5; font-size: 11px;
    }
  `]
})
export class FooterComponent {}
