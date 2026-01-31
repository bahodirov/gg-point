import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Allow access during SSR to prevent hydration issues
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Wait for auth check to complete
  if (authService.isLoading()) {
    // Return true initially, the component will handle the loading state
    return true;
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login
  router.navigate(['/login']);
  return false;
};
