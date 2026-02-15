import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; position: relative; overflow: hidden;">
      <!-- Animated background circles -->
      <div style="position: absolute; width: 300px; height: 300px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; top: -100px; left: -100px; animation: float 6s ease-in-out infinite;"></div>
      <div style="position: absolute; width: 200px; height: 200px; background: rgba(255, 255, 255, 0.1); border-radius: 50%; bottom: -50px; right: -50px; animation: float 8s ease-in-out infinite reverse;"></div>

      <mat-card style="max-width: 480px; width: 100%; border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); position: relative; z-index: 1; backdrop-filter: blur(10px);">
        <!-- Logo and Title Section -->
        <mat-card-header style="text-align: center; padding: 40px 32px 32px; display: flex; flex-direction: column; align-items: center; border-bottom: none;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 96px; height: 96px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4); position: relative;">
            <mat-icon style="font-size: 56px; width: 56px; height: 56px; color: white;">storefront</mat-icon>
            <div style="position: absolute; top: -4px; right: -4px; width: 24px; height: 24px; background: #4caf50; border-radius: 50%; border: 3px solid white;"></div>
          </div>
          <mat-card-title style="font-size: 36px; font-weight: 700; margin-bottom: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">GGPoint</mat-card-title>
          <mat-card-subtitle style="font-size: 16px; font-weight: 500; opacity: 0.8;">Admin Control Panel</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content style="padding: 0 32px 32px;">
          <!-- Welcome Message -->
          <div style="margin-bottom: 32px; text-align: center;">
            <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: rgba(255, 255, 255, 0.95);">Welcome back!</h2>
            <p style="margin: 0; color: rgba(255, 255, 255, 0.8); font-size: 15px; font-weight: 400;">Enter your credentials to access the admin panel</p>
          </div>

          <!-- Error Message -->
          @if (errorMessage()) {
            <div style="background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%); color: #d32f2f; padding: 16px; border-radius: 12px; border-left: 4px solid #f44336; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; animation: slideIn 0.3s ease-out;">
              <mat-icon style="color: #f44336;">error_outline</mat-icon>
              <span style="font-size: 14px; font-weight: 500;">{{ errorMessage() }}</span>
            </div>
          }

          <!-- Login Form -->
          <div style="max-width: 400px; margin: 0 auto;">
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 24px;">
              <mat-form-field appearance="outline" style="width: 100%;">
                <mat-label style="font-weight: 500;">Username</mat-label>
                <input matInput
                       formControlName="username"
                       placeholder="Enter your username"
                       autocomplete="username"
                       style="font-size: 16px; padding: 4px 0;">
                <mat-icon matPrefix style="color: #667eea; margin-right: 8px;">person_outline</mat-icon>
                @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                  <mat-error style="font-size: 13px;">Username is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" style="width: 100%;">
                <mat-label style="font-weight: 500;">Password</mat-label>
                <input matInput
                       [type]="hidePassword() ? 'password' : 'text'"
                       formControlName="password"
                       placeholder="Enter your password"
                       autocomplete="current-password"
                       style="font-size: 16px; padding: 4px 0;">
                <mat-icon matPrefix style="color: #667eea; margin-right: 8px;">lock_outline</mat-icon>
                <button mat-icon-button matSuffix type="button" (click)="togglePasswordVisibility()" style="color: rgba(0, 0, 0, 0.6);">
                  <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                  <mat-error style="font-size: 13px;">Password is required</mat-error>
                }
              </mat-form-field>

              <button mat-raised-button
                      type="submit"
                      [disabled]="isLoading() || loginForm.invalid"
                      style="height: 56px; font-size: 17px; font-weight: 600; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease; text-transform: none; letter-spacing: 0.5px;">
                @if (isLoading()) {
                  <mat-spinner diameter="24" style="display: inline-block; margin-right: 12px;"></mat-spinner>
                  <span>Signing in...</span>
                } @else {
                  <ng-container>
                    <mat-icon style="margin-right: 10px; font-size: 22px; width: 22px; height: 22px;">login</mat-icon>
                    <span>Sign In</span>
                  </ng-container>
                }
              </button>
            </form>
          </div>
        </mat-card-content>

        <!-- Footer -->
        <mat-card-actions style="padding: 0 32px 32px; display: flex; justify-content: center; border-top: 1px solid rgba(0, 0, 0, 0.06); padding-top: 24px;">
          <a mat-button routerLink="/" style="color: #667eea; font-weight: 500; font-size: 15px;">
            <mat-icon style="margin-right: 6px; font-size: 20px; width: 20px; height: 20px;">arrow_back</mat-icon>
            Back to Store
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) scale(1);
      }
      50% {
        transform: translateY(-20px) scale(1.05);
      }
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host ::ng-deep {
      .mat-mdc-form-field {
        .mat-mdc-text-field-wrapper {
          background-color: rgba(255, 255, 255, 0.95) !important;
          border-radius: 12px !important;
        }

        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: rgba(102, 126, 234, 0.2) !important;
          border-width: 2px !important;
        }

        &.mat-focused {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: #667eea !important;
            border-width: 2px !important;
          }
        }

        &:hover:not(.mat-focused) {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: rgba(102, 126, 234, 0.4) !important;
          }
        }
      }

      .mat-mdc-raised-button:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5) !important;
      }

      .mat-mdc-raised-button:not(:disabled):active {
        transform: translateY(0);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4) !important;
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
