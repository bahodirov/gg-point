import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Use Server mode for all routes to avoid prerendering errors with dynamic content
    path: '**',
    renderMode: RenderMode.Server
  }
];
