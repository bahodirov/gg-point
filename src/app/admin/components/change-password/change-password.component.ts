import { Component, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

const PASSWORD_CHANGE_REDIRECT_DELAY_MS = 2000;

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-lg mx-auto space-y-5">

      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-white">Change Password</h1>
        <p class="text-gray-400 text-sm mt-0.5">Update your account password</p>
      </div>

      <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-700">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-white">Security Settings</p>
              <p class="text-xs text-gray-500">Choose a strong password with at least 8 characters</p>
            </div>
          </div>
        </div>

        <div class="p-5">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

            @if (errorMessage()) {
              <div class="flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                <svg class="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-sm text-red-400">{{ errorMessage() }}</p>
              </div>
            }

            @if (successMessage()) {
              <div class="flex items-start gap-3 p-3.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                <svg class="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <p class="text-sm text-green-400">{{ successMessage() }}</p>
              </div>
            }

            <!-- Current password -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Current Password</label>
              <div class="relative">
                <input [type]="hideCurrentPassword() ? 'password' : 'text'"
                       formControlName="currentPassword"
                       class="w-full bg-gray-700 border text-white text-sm rounded-lg px-3.5 py-2.5 pr-10 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                       [ngClass]="form.get('currentPassword')?.invalid && form.get('currentPassword')?.touched ? 'border-red-500' : 'border-gray-600'">
                <button type="button" (click)="toggleCurrentPassword()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  @if (hideCurrentPassword()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  }
                </button>
              </div>
              @if (form.get('currentPassword')?.hasError('required') && form.get('currentPassword')?.touched) {
                <p class="text-xs text-red-400 mt-1">Current password is required</p>
              }
            </div>

            <!-- New password -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
              <div class="relative">
                <input [type]="hideNewPassword() ? 'password' : 'text'"
                       formControlName="newPassword"
                       class="w-full bg-gray-700 border text-white text-sm rounded-lg px-3.5 py-2.5 pr-10 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                       [ngClass]="form.get('newPassword')?.invalid && form.get('newPassword')?.touched ? 'border-red-500' : 'border-gray-600'">
                <button type="button" (click)="toggleNewPassword()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  @if (hideNewPassword()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  }
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              @if (form.get('newPassword')?.hasError('minlength') && form.get('newPassword')?.touched) {
                <p class="text-xs text-red-400 mt-1">Password must be at least 8 characters</p>
              }
            </div>

            <!-- Confirm password -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1.5">Confirm New Password</label>
              <div class="relative">
                <input [type]="hideConfirmPassword() ? 'password' : 'text'"
                       formControlName="confirmPassword"
                       class="w-full bg-gray-700 border text-white text-sm rounded-lg px-3.5 py-2.5 pr-10 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                       [ngClass]="form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched ? 'border-red-500' : 'border-gray-600'">
                <button type="button" (click)="toggleConfirmPassword()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  @if (hideConfirmPassword()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

          </form>
        </div>

        <div class="px-5 py-4 border-t border-gray-700 flex justify-end gap-3">
          <a routerLink="/admin/dashboard"
             class="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
            Cancel
          </a>
          <button type="button" (click)="onSubmit()"
                  [disabled]="isLoading() || form.invalid"
                  class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors">
            @if (isLoading()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            } @else {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Change Password
            }
          </button>
        </div>
      </div>
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

  toggleCurrentPassword(): void { this.hideCurrentPassword.update(v => !v); }
  toggleNewPassword(): void { this.hideNewPassword.update(v => !v); }
  toggleConfirmPassword(): void { this.hideConfirmPassword.update(v => !v); }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
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
        this.successMessage.set('Password changed successfully! Redirecting...');
        this.form.reset();

        if (this.redirectTimeout !== undefined) clearTimeout(this.redirectTimeout);
        this.redirectTimeout = setTimeout(() => this.router.navigate(['/admin/dashboard']), PASSWORD_CHANGE_REDIRECT_DELAY_MS);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.error || 'Failed to change password');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimeout !== undefined) clearTimeout(this.redirectTimeout);
  }
}
