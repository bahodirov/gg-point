import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Allow access during SSR to prevent hydration issues
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // If already authenticated, allow access
  if (authService.isAuthenticated()) {
    const currentUser = authService.currentUser();
    const requestedPath = state.url.split('?')[0];
    if (currentUser?.must_change_password && requestedPath !== '/admin/change-password') {
      router.navigate(['/admin/change-password']);
      return false;
    }
    return true;
  }

  // If still loading, deny access (the component will show loading state)
  // Once loaded, the user will either be authenticated or redirected
  if (authService.isLoading()) {
    // Redirect to login - the login page will redirect back if already authenticated
    router.navigate(['/login']);
    return false;
  }

  // Not authenticated, redirect to login
  router.navigate(['/login']);
  return false;
};
