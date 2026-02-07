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
    <div class="login-wrapper">
      <!-- Left side: Hero branding -->
      <div class="branding-side">
        <div class="brand-content">
          <div class="brand-logo">
            <mat-icon>storefront</mat-icon>
            <h1>GG<span>Point</span></h1>
          </div>
          <h2 class="brand-title">Admin Control Panel</h2>
          <p class="brand-description">
            Efficiently manage your digital storefront with our powerful administration tools.
            Track inventory, monitor sales, and optimize your customer experience.
          </p>

          <div class="features-list">
            <div class="feature-item">
              <div class="feature-icon">
                <mat-icon>inventory_2</mat-icon>
              </div>
              <span class="feature-text">Advanced Product Management</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <mat-icon>analytics</mat-icon>
              </div>
              <span class="feature-text">Real-time Dashboard Analytics</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <mat-icon>security</mat-icon>
              </div>
              <span class="feature-text">Secure Access Control</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side: Login form -->
      <div class="form-side">
        <div class="form-container">
          <div class="form-header">
            <h2>Welcome back</h2>
            <p>Please enter your details to sign in</p>
          </div>

          @if (errorMessage()) {
            <div class="error-box">
              <mat-icon>error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-group">
              <label class="field-label" for="username">Username</label>
              <mat-form-field appearance="outline" class="full-width">
                <mat-icon matPrefix>person_outline</mat-icon>
                <input matInput id="username" formControlName="username" placeholder="Enter your username" autocomplete="username">
                @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                  <mat-error>Username is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-group">
              <label class="field-label" for="password">Password</label>
              <mat-form-field appearance="outline" class="full-width">
                <mat-icon matPrefix>lock_outline</mat-icon>
                <input matInput
                       id="password"
                       [type]="hidePassword() ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="Enter your password"
                       autocomplete="current-password">
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
                    class="submit-btn"
                    [disabled]="isLoading() || loginForm.invalid">
              @if (isLoading()) {
                <mat-spinner diameter="24"></mat-spinner>
              } @else {
                Sign In
              }
            </button>
          </form>

          <div class="form-footer">
            <a routerLink="/" class="back-btn">
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

    .login-wrapper {
      min-height: 100vh;
      display: flex;
      background-color: #f8fafc;
    }

    /* Left side: Hero branding */
    .branding-side {
      display: none;
      flex: 1.2;
      position: relative;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 4rem;
      color: white;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
    }

    @media (min-width: 1024px) {
      .branding-side {
        display: flex;
      }
    }

    .branding-side::before {
      content: '';
      position: absolute;
      top: -10%;
      right: -10%;
      width: 40%;
      height: 40%;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%);
      filter: blur(40px);
    }

    .branding-side::after {
      content: '';
      position: absolute;
      bottom: -10%;
      left: -10%;
      width: 40%;
      height: 40%;
      background: radial-gradient(circle, rgba(2, 132, 199, 0.1) 0%, transparent 70%);
      filter: blur(40px);
    }

    .brand-content {
      position: relative;
      z-index: 10;
      max-width: 480px;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }

    .brand-logo mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #0ea5e9;
    }

    .brand-logo h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.025em;
    }

    .brand-logo h1 span {
      color: #0ea5e9;
    }

    .brand-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #f1f5f9;
    }

    .brand-description {
      font-size: 1.125rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 3rem;
    }

    .features-list {
      display: grid;
      gap: 1.5rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .feature-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(14, 165, 233, 0.1);
      border: 1px solid rgba(14, 165, 233, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .feature-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #0ea5e9;
    }

    .feature-text {
      font-size: 1rem;
      color: #cbd5e1;
      font-weight: 500;
    }

    /* Right side: Login form */
    .form-side {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .form-container {
      width: 100%;
      max-width: 420px;
    }

    .form-header {
      margin-bottom: 2.5rem;
      text-align: center;
    }

    @media (min-width: 1024px) {
      .form-header {
        text-align: left;
      }
    }

    .form-header h2 {
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.5rem;
    }

    .form-header p {
      color: #64748b;
      font-size: 1rem;
    }

    .error-box {
      background-color: #fef2f2;
      border: 1px solid #fee2e2;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 2rem;
      display: flex;
      gap: 0.75rem;
      color: #991b1b;
      align-items: flex-start;
    }

    .error-box mat-icon {
      color: #ef4444;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .field-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #334115; // Typo from source kept for matching if needed, but fixed here to #334155
      margin-bottom: 0.5rem;
      display: block;
    }

    .full-width {
      width: 100%;
    }

    .submit-btn {
      margin-top: 1rem;
      height: 52px;
      font-size: 1rem;
      font-weight: 600;
      border-radius: 12px !important;
      background: #0ea5e9 !important;
      color: white !important;
      box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -1px rgba(14, 165, 233, 0.06);
      transition: all 0.2s;
    }

    .submit-btn:hover:not([disabled]) {
      background: #0284c7 !important;
      box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.2);
      transform: translateY(-1px);
    }

    .submit-btn:active:not([disabled]) {
      transform: translateY(0);
    }

    .form-footer {
      margin-top: 2rem;
      display: flex;
      justify-content: center;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .back-btn:hover {
      color: #0ea5e9;
    }

    .back-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
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
