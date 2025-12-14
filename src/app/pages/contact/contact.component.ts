import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule } from '@ngx-translate/core';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { SeoService } from '../../shared/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    TranslateModule,
    TelegramButtonComponent
  ],
  template: `
    <div class="contact-page bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
      <div class="container mx-auto px-4">
        <!-- Page Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {{ 'contact.title' | translate }}
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-400">
            {{ 'contact.getInTouch' | translate }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Contact Form -->
          <mat-card class="p-6">
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
              <div class="space-y-4">
                <!-- Name -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'contact.name' | translate }}</mat-label>
                  <input matInput formControlName="name" required>
                  <mat-icon matPrefix>person</mat-icon>
                  @if (contactForm.get('name')?.hasError('required') && contactForm.get('name')?.touched) {
                    <mat-error>{{ 'contact.name' | translate }} is required</mat-error>
                  }
                </mat-form-field>

                <!-- Email -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>{{ 'contact.email' | translate }}</mat-label>
                  <input matInput type="email" formControlName="email" required>
                  <mat-icon matPrefix>email</mat-icon>
                  @if (contactForm.get('email')?.hasError('required') && contactForm.get('email')?.touched) {
                    <mat-error>{{ 'contact.email' | translate }} is required</mat-error>
                  }
                  @if (contactForm.get('email')?.hasError('email') && contactForm.get('email')?.touched) {
                    <mat-error>Invalid email format</mat-error>
                  }
                </mat-form-field>

                <!-- Message -->
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Message</mat-label>
                  <textarea matInput formControlName="message" rows="6" required></textarea>
                  <mat-icon matPrefix>message</mat-icon>
                  @if (contactForm.get('message')?.hasError('required') && contactForm.get('message')?.touched) {
                    <mat-error>Message is required</mat-error>
                  }
                </mat-form-field>

                <!-- Submit Button -->
                <button mat-raised-button 
                        color="primary" 
                        type="submit"
                        class="w-full"
                        [disabled]="!contactForm.valid || isSubmitting">
                  <mat-icon class="mr-2">send</mat-icon>
                  Send Message
                </button>

                @if (submitSuccess) {
                  <div class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 p-4 rounded-lg">
                    <mat-icon class="align-middle mr-2">check_circle</mat-icon>
                    Message sent successfully!
                  </div>
                }

                @if (submitError) {
                  <div class="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 p-4 rounded-lg">
                    <mat-icon class="align-middle mr-2">error</mat-icon>
                    Error sending message. Please try again.
                  </div>
                }
              </div>
            </form>
          </mat-card>

          <!-- Contact Information -->
          <div class="space-y-6">
            <!-- Contact via Telegram -->
            <mat-card class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Contact via Telegram
              </h3>
              <p class="text-gray-700 dark:text-gray-300 mb-4">
                For faster response, contact us directly through Telegram
              </p>
              <app-telegram-button></app-telegram-button>
            </mat-card>

            <!-- Contact Details -->
            <mat-card class="p-6">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h3>
              
              <div class="space-y-4">
                <div class="flex items-start">
                  <mat-icon class="mr-3 text-primary-600 dark:text-primary-400">phone</mat-icon>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">Phone</div>
                    <a href="tel:+998901234567" class="text-primary-600 dark:text-primary-400 hover:underline">
                      +998 90 123 45 67
                    </a>
                  </div>
                </div>

                <div class="flex items-start">
                  <mat-icon class="mr-3 text-primary-600 dark:text-primary-400">email</mat-icon>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">Email</div>
                    <a href="mailto:info@ggpoint.uz" class="text-primary-600 dark:text-primary-400 hover:underline">
                      info&#64;ggpoint.uz
                    </a>
                  </div>
                </div>

                <div class="flex items-start">
                  <mat-icon class="mr-3 text-primary-600 dark:text-primary-400">location_on</mat-icon>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">Address</div>
                    <p class="text-gray-700 dark:text-gray-300">
                      Tashkent, Uzbekistan<br>
                      Amir Temur Avenue
                    </p>
                  </div>
                </div>

                <div class="flex items-start">
                  <mat-icon class="mr-3 text-primary-600 dark:text-primary-400">schedule</mat-icon>
                  <div>
                    <div class="font-medium text-gray-900 dark:text-white">Business Hours</div>
                    <p class="text-gray-700 dark:text-gray-300">
                      Monday - Sunday<br>
                      9:00 - 20:00
                    </p>
                  </div>
                </div>
              </div>
            </mat-card>
          </div>
        </div>
      </div>

      <!-- Floating Telegram Button -->
      <app-telegram-button [floating]="true"></app-telegram-button>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }

    :host ::ng-deep .mat-mdc-card {
      border-radius: 12px;
    }
  `]
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);
  private seoService = inject(SeoService);

  contactForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;

  ngOnInit(): void {
    this.initForm();
    this.updateSEO();
  }

  private initForm(): void {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitSuccess = false;
      this.submitError = false;

      // Simulate form submission
      setTimeout(() => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);
      }, 1000);
    }
  }

  private updateSEO(): void {
    this.seoService.updateMetaTags({
      title: 'Contact GGPoint - Computer Accessories Store in Tashkent | Get Support 24/7',
      description: 'Contact GGPoint for computer accessories inquiries in Uzbekistan. Reach us via Telegram, phone +998 90 123 45 67, or email info@ggpoint.uz. Expert support available 24/7. Visit our Tashkent showroom on Amir Temur Avenue.',
      keywords: 'contact ggpoint, computer store contact Tashkent, gaming store support Uzbekistan, ggpoint telegram, help desk, customer service, связаться с нами, контакты магазина компьютерных аксессуаров',
      type: 'website',
      canonical: 'https://ggpoint.uz/contact',
      languageAlternates: [
        { lang: 'en', url: 'https://ggpoint.uz/contact' },
        { lang: 'ru', url: 'https://ggpoint.uz/contact' },
        { lang: 'uz', url: 'https://ggpoint.uz/contact' }
      ]
    });

    // Add ContactPage Schema
    const contactPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': 'Contact GGPoint',
      'description': 'Get in touch with GGPoint for computer accessories inquiries',
      'url': 'https://ggpoint.uz/contact',
      'mainEntity': {
        '@type': 'LocalBusiness',
        'name': 'GGPoint',
        'telephone': '+998-90-123-45-67',
        'email': 'info@ggpoint.uz',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Amir Temur Avenue',
          'addressLocality': 'Tashkent',
          'addressCountry': 'UZ'
        },
        'openingHoursSpecification': {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          'opens': '09:00',
          'closes': '20:00'
        }
      }
    };
    this.seoService.addStructuredData(contactPageSchema, 'contact-page-schema');

    // Add Breadcrumb Schema
    const breadcrumbSchema = this.seoService.generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Contact Us' }
    ]);
    this.seoService.addStructuredData(breadcrumbSchema, 'breadcrumb-schema');
  }
}
