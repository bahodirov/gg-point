import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <div>
      <div>
        <h1>GGPoint</h1>
        <h2>Admin Control Panel</h2>
      </div>

      <div>
        <div>
          <h2>Welcome back</h2>
          <p>Please enter your details to sign in</p>
        </div>

        @if (errorMessage()) {
          <div>
            {{ errorMessage() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div>
            <label for="username">Username</label>
            <input id="username" formControlName="username" placeholder="Enter your username" autocomplete="username">
            @if (loginForm.get('username')?.hasError('required') && loginForm.get('username')?.touched) {
              <span>Username is required</span>
            }
          </div>

          <div>
            <label for="password">Password</label>
            <input id="password"
                   [type]="hidePassword() ? 'password' : 'text'"
                   formControlName="password"
                   placeholder="Enter your password"
                   autocomplete="current-password">
            <button type="button" (click)="togglePasswordVisibility()">
              {{ hidePassword() ? 'Show' : 'Hide' }}
            </button>
            @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
              <span>Password is required</span>
            }
          </div>

          <button type="submit" [disabled]="isLoading() || loginForm.invalid">
            @if (isLoading()) {
              Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div>
          <a routerLink="/">Back to Store</a>
        </div>
      </div>
    </div>
  `,
  styles: []
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
