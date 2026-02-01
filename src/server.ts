import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Security middleware - load dynamically to avoid build issues
let securityInitialized = false;
async function initializeSecurity() {
  if (securityInitialized) return;
  
  try {
    const { helmetConfig, requestLogger, corsMiddleware } = await import('./server/middleware/security.middleware');
    const { sanitizeInput } = await import('./server/middleware/validation.middleware');
    
    // Apply security middleware
    app.use(helmetConfig);
    app.use(corsMiddleware);
    app.use(requestLogger);
    app.use(sanitizeInput);
    
    securityInitialized = true;
    console.log('Security middleware initialized');
  } catch (error) {
    console.error('Failed to initialize security middleware:', error);
  }
}

// Initialize security middleware immediately on startup
await initializeSecurity();

// Basic middleware - applied after security middleware
app.use(express.json());
app.use(cookieParser());

// Track if API is initialized
let apiInitialized = false;
let apiRouter: express.Router | null = null;

/**
 * Lazy-load API routes only when needed (to avoid loading native modules during build)
 */
async function initializeApi(): Promise<express.Router> {
  if (apiRouter) {
    return apiRouter;
  }

  const [{ initializeDatabase }, { default: migrateData }, { default: authRoutes }, { default: productsRoutes }, { default: adminRoutes }] = await Promise.all([
    import('./server/db/database'),
    import('./server/db/migrate'),
    import('./server/routes/auth.routes'),
    import('./server/routes/products.routes'),
    import('./server/routes/admin.routes'),
  ]);

  // Initialize database and migrate data
  initializeDatabase();
  await migrateData();

  // Create API router
  apiRouter = express.Router();
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/products', productsRoutes);
  apiRouter.use('/admin', adminRoutes);

  apiInitialized = true;
  console.log('API initialized successfully');
  
  return apiRouter;
}

/**
 * API Routes - lazily loaded
 */
app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const router = await initializeApi();
    router(req, res, next);
  } catch (error) {
    console.error('Failed to initialize API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
