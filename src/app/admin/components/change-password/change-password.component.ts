import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

const PASSWORD_CHANGE_REDIRECT_DELAY_MS = 2000;

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <div>
      <h2>Change Password</h2>
      <p>Update your account password</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        @if (errorMessage()) {
          <div>
            {{ errorMessage() }}
          </div>
        }

        @if (successMessage()) {
          <div>
            {{ successMessage() }}
          </div>
        }

        <div>
          <label for="currentPassword">Current Password</label>
          <input id="currentPassword"
                 [type]="hideCurrentPassword() ? 'password' : 'text'"
                 formControlName="currentPassword">
          <button type="button" (click)="toggleCurrentPasswordVisibility()">
            {{ hideCurrentPassword() ? 'Show' : 'Hide' }}
          </button>
          @if (form.get('currentPassword')?.hasError('required')) {
            <span>Current password is required</span>
          }
        </div>

        <div>
          <label for="newPassword">New Password</label>
          <input id="newPassword"
                 [type]="hideNewPassword() ? 'password' : 'text'"
                 formControlName="newPassword">
          <button type="button" (click)="toggleNewPasswordVisibility()">
            {{ hideNewPassword() ? 'Show' : 'Hide' }}
          </button>
          @if (form.get('newPassword')?.hasError('required')) {
            <span>New password is required</span>
          }
          @if (form.get('newPassword')?.hasError('minlength')) {
            <span>Password must be at least 8 characters</span>
          }
        </div>

        <div>
          <label for="confirmPassword">Confirm New Password</label>
          <input id="confirmPassword"
                 [type]="hideConfirmPassword() ? 'password' : 'text'"
                 formControlName="confirmPassword">
          <button type="button" (click)="toggleConfirmPasswordVisibility()">
            {{ hideConfirmPassword() ? 'Show' : 'Hide' }}
          </button>
          @if (form.get('confirmPassword')?.hasError('required')) {
            <span>Please confirm your password</span>
          }
        </div>

        <div>
          <a routerLink="/admin/dashboard">Cancel</a>
          <button type="submit" [disabled]="isLoading() || form.invalid">
            @if (isLoading()) {
              Saving...
            } @else {
              Change Password
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class ChangePasswordComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
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
