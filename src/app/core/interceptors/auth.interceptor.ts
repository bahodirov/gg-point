import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Add withCredentials to all API requests to ensure cookies are sent
  if (req.url.includes('/api/')) {
    console.log(`AuthInterceptor: Adding withCredentials to ${req.url}`);
    const authReq = req.clone({
      withCredentials: true
    });
    return next(authReq);
  }

  return next(req);
};
