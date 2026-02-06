import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/services/auth.service';

const PASSWORD_CHANGE_REDIRECT_DELAY_MS = 2000;

@Component({
  selector: 'app-change-password',
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
    MatSnackBarModule,
  ],
  template: `
    <div class="change-password">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Change Password</mat-card-title>
          <mat-card-subtitle>Update your account password</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            @if (errorMessage()) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                {{ errorMessage() }}
              </div>
            }

            @if (successMessage()) {
              <div class="success-message">
                <mat-icon>check_circle</mat-icon>
                {{ successMessage() }}
              </div>
            }

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Current Password</mat-label>
              <input matInput 
                     [type]="hideCurrentPassword() ? 'password' : 'text'" 
                     formControlName="currentPassword">
              <button mat-icon-button matSuffix (click)="toggleCurrentPasswordVisibility()" type="button">
                <mat-icon>{{ hideCurrentPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('currentPassword')?.hasError('required')) {
                <mat-error>Current password is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput 
                     [type]="hideNewPassword() ? 'password' : 'text'" 
                     formControlName="newPassword">
              <button mat-icon-button matSuffix (click)="toggleNewPasswordVisibility()" type="button">
                <mat-icon>{{ hideNewPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('newPassword')?.hasError('required')) {
                <mat-error>New password is required</mat-error>
              }
              @if (form.get('newPassword')?.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm New Password</mat-label>
              <input matInput 
                     [type]="hideConfirmPassword() ? 'password' : 'text'" 
                     formControlName="confirmPassword">
              <button mat-icon-button matSuffix (click)="toggleConfirmPasswordVisibility()" type="button">
                <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('confirmPassword')?.hasError('required')) {
                <mat-error>Please confirm your password</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" routerLink="/admin/dashboard">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="isLoading() || form.invalid">
                @if (isLoading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Change Password
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .change-password {
      max-width: 600px;
      margin: 0 auto;
    }

    mat-card {
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(30, 60, 114, 0.1);
      border: 1px solid rgba(30, 60, 114, 0.1);
    }

    :host-context(.dark-theme) mat-card {
      background: linear-gradient(135deg, #1a2f5c 0%, #1e3c72 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    mat-card-header {
      margin-bottom: 2rem;
    }

    mat-card-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1e3c72;
    }

    :host-context(.dark-theme) mat-card-title {
      color: #e3f2fd;
    }

    mat-card-subtitle {
      margin-top: 0.5rem;
      color: #64748b;
      font-size: 0.95rem;
    }

    :host-context(.dark-theme) mat-card-subtitle {
      color: rgba(255, 255, 255, 0.7);
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      margin-bottom: 1rem;
    }

    .error-message {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      color: #991b1b;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-left: 4px solid #dc2626;
      font-weight: 500;
    }

    :host-context(.dark-theme) .error-message {
      background: linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(185, 28, 28, 0.2) 100%);
      color: #fca5a5;
    }

    .success-message {
      background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
      color: #065f46;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-left: 4px solid #10b981;
      font-weight: 500;
    }

    :host-context(.dark-theme) .success-message {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
      color: #6ee7b7;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .form-actions button {
      border-radius: 8px;
      font-weight: 500;
      padding: 0.75rem 2rem;
      transition: all 0.3s ease;
    }

    .form-actions button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(30, 60, 114, 0.2);
    }

    .form-actions button mat-spinner {
      display: inline-block;
    }
  `]
})
export class ChangePasswordComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private redirectTimeout?: ReturnType<typeof setTimeout>;

  form: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);

  constructor() {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  toggleCurrentPasswordVisibility(): void {
    this.hideCurrentPassword.update(v => !v);
  }

  toggleNewPasswordVisibility(): void {
    this.hideNewPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.form.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage.set('New passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Password changed successfully');
        this.form.reset();
        
        // Redirect after a short delay
        if (this.redirectTimeout !== undefined) {
          clearTimeout(this.redirectTimeout);
        }
        this.redirectTimeout = setTimeout(() => {
          this.router.navigate(['/admin/dashboard']);
        }, PASSWORD_CHANGE_REDIRECT_DELAY_MS);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.error || 'Failed to change password');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimeout !== undefined) {
      clearTimeout(this.redirectTimeout);
    }
  }
}
