import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

const ADMIN_SUBDOMAIN = 'admin.ggpoint.uz';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Allow access during SSR
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // In production: block admin access when not on admin subdomain
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isAdminSubdomain = hostname === ADMIN_SUBDOMAIN;
  if (!isLocalhost && !isAdminSubdomain) {
    window.location.href = `https://${ADMIN_SUBDOMAIN}/admin`;
    return false;
  }

  // Already loaded — check immediately
  if (!authService.isLoading()) {
    return checkAuth(authService, router, state.url);
  }

  // Still loading — wait for session check to finish, then decide
  return toObservable(authService.isLoading).pipe(
    filter(loading => !loading),
    take(1),
    map(() => checkAuth(authService, router, state.url))
  );
};

function checkAuth(authService: AuthService, router: Router, url: string): boolean {
  if (authService.isAuthenticated()) {
    const user = authService.currentUser();
    const path = url.split('?')[0];
    if (user?.must_change_password && path !== '/admin/change-password') {
      router.navigate(['/admin/change-password']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
}
