import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon class="login-icon">admin_panel_settings</mat-icon>
            Admin Login
          </mat-card-title>
          <mat-card-subtitle>Sign in to access the admin panel</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            @if (errorMessage()) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                {{ errorMessage() }}
              </div>
            }

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" placeholder="Enter username" autocomplete="username">
              <mat-icon matSuffix>person</mat-icon>
              @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
                <mat-error>Username is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput 
                     [type]="hidePassword() ? 'password' : 'text'" 
                     formControlName="password" 
                     placeholder="Enter password"
                     autocomplete="current-password">
              <button mat-icon-button matSuffix (click)="togglePasswordVisibility()" type="button">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button 
                    color="primary" 
                    type="submit" 
                    class="full-width login-button"
                    [disabled]="isLoading() || loginForm.invalid">
              @if (isLoading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <ng-container>
                  <mat-icon>login</mat-icon>
                  Sign In
                </ng-container>
              }
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <a routerLink="/" mat-button>
            <mat-icon>arrow_back</mat-icon>
            Back to Store
          </a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0e2a47 0%, #0c4a6e 40%, #155e75 70%, #0891b2 100%);
      padding: 1rem;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(34, 211, 238, 0.1);
    }

    mat-card-header {
      margin-bottom: 2rem;
      text-align: center;
      display: block;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      color: #0e4a6e;
    }

    .login-icon {
      font-size: 2rem;
      width: 2rem;
      height: 2rem;
      color: #0891b2;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 1rem;
    }

    .login-button {
      margin-top: 1rem;
      height: 48px;
      font-size: 1rem;
      border-radius: 10px;
    }

    .login-button mat-spinner {
      display: inline-block;
    }

    .error-message {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      color: #991b1b;
      padding: 0.875rem;
      border-radius: 8px;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-left: 4px solid #dc2626;
      font-weight: 500;
    }

    mat-card-actions {
      display: flex;
      justify-content: center;
      padding-top: 1rem;
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
