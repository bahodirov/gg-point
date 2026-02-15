import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const PASSWORD_CHANGE_REDIRECT_DELAY_MS = 2000;

@Component({
  selector: 'app-change-password',
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
    <div style="max-width: 600px; margin: 32px auto; padding: 0 16px;">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Change Password</mat-card-title>
          <mat-card-subtitle>Update your account password</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
            @if (errorMessage()) {
              <div style="background-color: rgba(244, 67, 54, 0.1); color: #f44336; padding: 12px; border-radius: 4px; border-left: 4px solid #f44336;">
                {{ errorMessage() }}
              </div>
            }

            @if (successMessage()) {
              <div style="background-color: rgba(76, 175, 80, 0.1); color: #4caf50; padding: 12px; border-radius: 4px; border-left: 4px solid #4caf50;">
                {{ successMessage() }}
              </div>
            }

            <mat-form-field appearance="outline">
              <mat-label>Current Password</mat-label>
              <input matInput
                     [type]="hideCurrentPassword() ? 'password' : 'text'"
                     formControlName="currentPassword">
              <button mat-icon-button matSuffix type="button" (click)="toggleCurrentPasswordVisibility()">
                <mat-icon>{{ hideCurrentPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('currentPassword')?.hasError('required')) {
                <mat-error>Current password is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>New Password</mat-label>
              <input matInput
                     [type]="hideNewPassword() ? 'password' : 'text'"
                     formControlName="newPassword">
              <button mat-icon-button matSuffix type="button" (click)="toggleNewPasswordVisibility()">
                <mat-icon>{{ hideNewPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-hint>Minimum 8 characters</mat-hint>
              @if (form.get('newPassword')?.hasError('required')) {
                <mat-error>New password is required</mat-error>
              }
              @if (form.get('newPassword')?.hasError('minlength')) {
                <mat-error>Password must be at least 8 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirm New Password</mat-label>
              <input matInput
                     [type]="hideConfirmPassword() ? 'password' : 'text'"
                     formControlName="confirmPassword">
              <button mat-icon-button matSuffix type="button" (click)="toggleConfirmPasswordVisibility()">
                <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('confirmPassword')?.hasError('required')) {
                <mat-error>Please confirm your password</mat-error>
              }
            </mat-form-field>
          </form>
        </mat-card-content>

        <mat-card-actions align="end" style="padding: 16px;">
          <a mat-button routerLink="/admin/dashboard">Cancel</a>
          <button mat-raised-button color="primary" type="submit"
                  [disabled]="isLoading() || form.invalid"
                  (click)="onSubmit()">
            @if (isLoading()) {
              <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
              Saving...
            } @else {
              Change Password
            }
          </button>
        </mat-card-actions>
      </mat-card>
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
