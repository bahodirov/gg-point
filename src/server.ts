// Load environment variables first
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { join } from 'node:path';
import { config } from './config/environment';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Security middleware - load dynamically to avoid build issues
let securityInitialized = false;
async function initializeSecurity() {
  if (securityInitialized) return;

  try {
    const { cspNonceMiddleware, helmetConfig, requestLogger, corsMiddleware } = await import('./server/middleware/security.middleware');
    const { sanitizeInput } = await import('./server/middleware/validation.middleware');

    // Apply CSP nonce middleware first (must come before helmetConfig)
    app.use(cspNonceMiddleware);
    
    // Apply helmet security middleware with nonce support
    app.use(helmetConfig);
    
    // Apply CORS and other security middleware
    app.use(corsMiddleware);
    app.use(requestLogger);
    app.use(sanitizeInput);

    securityInitialized = true;
    console.log('Security middleware initialized');
  } catch (error) {
    console.error('FATAL: Failed to initialize security middleware:', error);
    console.error('Application cannot start without security protections.');
    console.error('Please check that all security middleware modules are available.');
    // Fail fast: do not start the application without security middleware
    throw error;
  }
}

// Basic middleware - applied before security to ensure req.body is available for sanitization
app.use(express.json());
app.use(cookieParser());

// Initialize security middleware immediately on startup
await initializeSecurity();

// Track if API is initialized
let apiInitializationPromise: Promise<express.Router> | null = null;

/**
 * Lazy-load API routes only when needed (to avoid loading native modules during build)
 */
async function initializeApi(): Promise<express.Router> {
  if (apiInitializationPromise) {
    return apiInitializationPromise;
  }

  apiInitializationPromise = (async () => {
    const [{ initializeDatabase }, { default: migrateData }, { default: authRoutes }, { default: productsRoutes }, { default: adminRoutes }] = await Promise.all([
      import('./server/db/database'),
      import('./server/db/migrate'),
      import('./server/routes/auth.routes'),
      import('./server/routes/products.routes'),
      import('./server/routes/admin.routes'),
    ]);

    // Initialize database and migrate data
    await initializeDatabase();
    await migrateData();

    // Create API router
    const router = express.Router();
    router.use('/auth', authRoutes);
    router.use('/products', productsRoutes);
    router.use('/admin', adminRoutes);

    console.log('API initialized successfully');

    return router;
  })();

  return apiInitializationPromise;
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
  const port = config.port;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    // Log the appropriate URL based on the environment
    const serverUrl = config.production 
      ? config.apiUrl 
      : `http://localhost:${port}`;
    console.log(`Node Express server listening on ${serverUrl}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
