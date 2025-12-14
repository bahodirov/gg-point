import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-telegram-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
  template: `
    <a [href]="getTelegramLink()" 
       target="_blank"
       rel="noopener noreferrer"
       class="telegram-fab"
       [class.fixed]="floating"
       [class.bottom-6]="floating"
       [class.right-6]="floating"
       [class.z-50]="floating"
       [matTooltip]="'product.orderViaTelegram' | translate"
       matTooltipPosition="left">
      <button mat-fab 
              [color]="floating ? 'primary' : 'accent'"
              class="telegram-button">
        <mat-icon>{{ floating ? 'send' : 'telegram' }}</mat-icon>
      </button>
    </a>
  `,
  styles: [`
    .telegram-fab {
      text-decoration: none;
      display: inline-block;
    }

    .telegram-button {
      box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4);
      transition: all 0.3s ease;
    }

    .telegram-button:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 30px rgba(14, 165, 233, 0.6);
    }

    .telegram-fab.fixed {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
      100% {
        transform: scale(1);
      }
    }

    @media (max-width: 768px) {
      .telegram-fab.fixed {
        bottom: 1rem !important;
        right: 1rem !important;
      }

      :host ::ng-deep .mat-mdc-fab {
        width: 48px !important;
        height: 48px !important;
      }
    }
  `]
})
export class TelegramButtonComponent {
  private translateService = inject(TranslateService);
  
  @Input() floating: boolean = false;
  @Input() productName?: string;
  @Input() productId?: string;
  @Input() message?: string;

  getTelegramLink(): string {
    const botUsername = 'Dma12r'; // Admin contact
    let text = this.message;
    
    if (!text && this.productName) {
      const greeting = this.translateService.instant('contact.getInTouch');
      text = `${greeting} ${this.productName}`;
      if (this.productId) {
        text += ` (ID: ${this.productId})`;
      }
    }
    
    if (!text) {
      text = this.translateService.instant('contact.getInTouch');
    }

    return `https://t.me/${botUsername}?text=${encodeURIComponent(text)}`;
  }
}
