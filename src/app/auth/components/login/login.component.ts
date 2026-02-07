import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <!-- Left panel - branding -->
      <div class="login-branding">
        <div class="branding-content">
          <div class="brand-logo">
            <div class="logo-icon">
              <mat-icon>storefront</mat-icon>
            </div>
            <h1>GG<span>Point</span></h1>
          </div>
          <p class="brand-tagline">Admin Control Panel</p>
          <p class="brand-desc">Manage your products, monitor analytics, and keep your store running smoothly.</p>
          <div class="brand-features">
            <div class="feature">
              <mat-icon>inventory_2</mat-icon>
              <span>Product Management</span>
            </div>
            <div class="feature">
              <mat-icon>analytics</mat-icon>
              <span>Dashboard Analytics</span>
            </div>
            <div class="feature">
              <mat-icon>security</mat-icon>
              <span>Secure Access</span>
            </div>
          </div>
        </div>
        <div class="branding-decoration">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
      </div>

      <!-- Right panel - form -->
      <div class="login-form-panel">
        <div class="form-wrapper">
          <div class="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your admin account</p>
          </div>

          @if (errorMessage()) {
            <div class="error-message">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="form-field-group">
              <label class="field-label">Username</label>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput formControlName="username" placeholder="Enter your username" autocomplete="username">
                <mat-icon matPrefix>person_outline</mat-icon>
                @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                  <mat-error>Username is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-field-group">
              <label class="field-label">Password</label>
              <mat-form-field appearance="outline" class="full-width">
                <input matInput
                       [type]="hidePassword() ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="Enter your password"
                       autocomplete="current-password">
                <mat-icon matPrefix>lock_outline</mat-icon>
                <button mat-icon-button matSuffix (click)="togglePasswordVisibility()" type="button" tabindex="-1">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error>Password is required</mat-error>
                }
              </mat-form-field>
            </div>

            <button mat-flat-button
                    color="primary"
                    type="submit"
                    class="full-width login-button"
                    [disabled]="isLoading() || loginForm.invalid">
              @if (isLoading()) {
                <mat-spinner diameter="22"></mat-spinner>
              } @else {
                Sign In
                <mat-icon>arrow_forward</mat-icon>
              }
            </button>
          </form>

          <div class="form-footer">
            <a routerLink="/" class="back-link">
              <mat-icon>arrow_back</mat-icon>
              Back to Store
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .login-page {
      min-height: 100vh;
      display: flex;
    }

    /* ───── Left Branding Panel ───── */
    .login-branding {
      flex: 1;
      background: linear-gradient(160deg, #0a1628 0%, #0c3547 35%, #0e5c6e 60%, #0891b2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 3rem;
    }

    .branding-content {
      position: relative;
      z-index: 2;
      max-width: 420px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      width: 56px;
      height: 56px;
      background: rgba(34, 211, 238, 0.15);
      border: 1px solid rgba(34, 211, 238, 0.3);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon mat-icon {
      font-size: 30px;
      width: 30px;
      height: 30px;
      color: #22d3ee;
    }

    .brand-logo h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
      margin: 0;
    }

    .brand-logo h1 span {
      color: #22d3ee;
    }

    .brand-tagline {
      font-size: 1.1rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1.25rem;
      font-weight: 500;
    }

    .brand-desc {
      font-size: 0.95rem;
      color: rgba(255, 255, 255, 0.5);
      line-height: 1.7;
      margin-bottom: 2.5rem;
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      color: rgba(255, 255, 255, 0.75);
      font-size: 0.925rem;
      font-weight: 400;
    }

    .feature mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #22d3ee;
    }

    /* Decorative circles */
    .branding-decoration {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(34, 211, 238, 0.08);
    }

    .circle-1 {
      width: 500px;
      height: 500px;
      top: -150px;
      right: -150px;
      background: radial-gradient(circle, rgba(34, 211, 238, 0.04) 0%, transparent 70%);
    }

    .circle-2 {
      width: 350px;
      height: 350px;
      bottom: -100px;
      left: -100px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 70%);
    }

    .circle-3 {
      width: 200px;
      height: 200px;
      top: 50%;
      left: 60%;
      border: 1px solid rgba(34, 211, 238, 0.06);
    }

    /* ───── Right Form Panel ───── */
    .login-form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafb;
      padding: 2rem;
    }

    .form-wrapper {
      width: 100%;
      max-width: 400px;
    }

    .form-header {
      margin-bottom: 2rem;
    }

    .form-header h2 {
      font-size: 1.875rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
      letter-spacing: -0.25px;
    }

    .form-header p {
      font-size: 0.95rem;
      color: #64748b;
      margin: 0;
    }

    .error-message {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 0.875rem 1rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .error-message mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }

    .form-field-group {
      margin-bottom: 0.5rem;
    }

    .field-label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #334155;
      margin-bottom: 0.375rem;
      letter-spacing: 0.01em;
    }

    .full-width {
      width: 100%;
    }

    .login-button {
      margin-top: 0.75rem;
      height: 50px;
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%) !important;
      color: white !important;
      box-shadow: 0 4px 14px rgba(8, 145, 178, 0.35);
      transition: all 0.25s ease;
    }

    .login-button:hover:not([disabled]) {
      box-shadow: 0 6px 20px rgba(8, 145, 178, 0.45);
      transform: translateY(-1px);
    }

    .login-button:disabled {
      opacity: 0.6;
      box-shadow: none;
    }

    .login-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-left: 0.375rem;
    }

    .login-button mat-spinner {
      display: inline-block;
    }

    .form-footer {
      margin-top: 2rem;
      text-align: center;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      color: #64748b;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: color 0.2s ease;
    }

    .back-link:hover {
      color: #0891b2;
    }

    .back-link mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* ───── Responsive ───── */
    @media (max-width: 900px) {
      .login-page {
        flex-direction: column;
      }

      .login-branding {
        padding: 2.5rem 2rem;
        min-height: auto;
      }

      .branding-content {
        max-width: 100%;
      }

      .brand-desc,
      .brand-features {
        display: none;
      }

      .brand-tagline {
        margin-bottom: 0;
      }

      .login-form-panel {
        padding: 2rem 1.5rem 3rem;
      }
    }

    @media (max-width: 480px) {
      .login-branding {
        padding: 1.75rem 1.25rem;
      }

      .brand-logo h1 {
        font-size: 1.75rem;
      }

      .logo-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
      }

      .logo-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .form-header h2 {
        font-size: 1.5rem;
      }

      .form-wrapper {
        max-width: 100%;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      const currentUser = this.authService.currentUser();
      if (currentUser?.must_change_password) {
        this.router.navigate(['/admin/change-password']);
      } else {
        this.router.navigate(['/admin']);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          if (response.user?.must_change_password) {
            this.router.navigate(['/admin/change-password']);
          } else {
            this.router.navigate(['/admin']);
          }
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.error || 'Login failed. Please try again.');
      }
    });
  }
}
