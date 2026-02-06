import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface User {
  id: string;
  username: string;
  email: string | null;
  role: string;
  must_change_password?: boolean;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  private isAuthenticatedSignal = signal(false);
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal(true);

  isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  currentUser = this.currentUserSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();

  constructor() {
    // Only check session in the browser
    if (isPlatformBrowser(this.platformId)) {
      this.checkSession();
    } else {
      this.isLoadingSignal.set(false);
    }
  }

  /**
   * Login with username and password
   */
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { username, password })
      .pipe(
        tap(response => {
          if (response.success) {
            this.isAuthenticatedSignal.set(true);
            this.currentUserSignal.set(response.user);
          }
        })
      );
  }

  /**
   * Logout current user
   */
  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/api/auth/logout', {})
      .pipe(
        tap(() => {
          this.isAuthenticatedSignal.set(false);
          this.currentUserSignal.set(null);
        }),
        catchError(() => {
          // Clear local state even if server logout fails
          this.isAuthenticatedSignal.set(false);
          this.currentUserSignal.set(null);
          return of({ success: true });
        })
      );
  }

  /**
   * Check current session status
   */
  checkSession(): void {
    this.isLoadingSignal.set(true);
    this.http.get<SessionResponse>('/api/auth/session')
      .pipe(
        catchError(() => of({ authenticated: false, user: undefined } as SessionResponse))
      )
      .subscribe(response => {
        this.isAuthenticatedSignal.set(response.authenticated);
        this.currentUserSignal.set(response.user || null);
        this.isLoadingSignal.set(false);
      });
  }

  /**
   * Change password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>('/api/auth/change-password', {
      currentPassword,
      newPassword
    }).pipe(
      tap(() => {
        const currentUser = this.currentUserSignal();
        if (currentUser?.must_change_password) {
          this.currentUserSignal.set({ ...currentUser, must_change_password: false });
        }
      })
    );
  }
}
