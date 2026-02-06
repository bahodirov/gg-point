import { Router, Request, Response } from 'express';
import { productsService, CreateProductDto, UpdateProductDto } from '../services/products.service';
import { requireAuth } from '../middleware/auth.middleware';
import { productValidation, searchValidation, validateRequest } from '../middleware/validation.middleware';
import { publicLimiter, writeLimiter } from '../middleware/security.middleware';

const router = Router();

const DEFAULT_FEATURED_LIMIT = 6;
const MIN_FEATURED_LIMIT = 1;
const MAX_FEATURED_LIMIT = 100;

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/products
 * Get all products (public)
 */
router.get('/', publicLimiter, searchValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const { category, search, featured } = req.query;

    let products;

    if (search) {
      products = await productsService.searchProducts(String(search));
    } else if (category) {
      products = await productsService.getProductsByCategory(String(category));
    } else if (featured === 'true') {
      const limitParam = req.query['limit'];
      const rawLimit =
        typeof limitParam === 'string' ? Number.parseInt(limitParam, 10) : Number.NaN;
      const limit = Number.isFinite(rawLimit)
        ? Math.min(Math.max(rawLimit, MIN_FEATURED_LIMIT), MAX_FEATURED_LIMIT)
        : DEFAULT_FEATURED_LIMIT;
      products = await productsService.getFeaturedProducts(limit);
    } else {
      products = await productsService.getAllProducts();
    }

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/products/categories
 * Get all categories with counts (public)
 */
router.get('/categories', publicLimiter, async (req: Request, res: Response) => {
  try {
    const categories = await productsService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/products/:idOrSlug
 * Get single product by ID or slug (public)
 */
router.get('/:idOrSlug', publicLimiter, async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    // Try to find by ID first, then by slug
    let product = await productsService.getProductById(idOrSlug);
    if (!product) {
      product = await productsService.getProductBySlug(idOrSlug);
    }

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ADMIN ROUTES ====================

/**
 * POST /api/products
 * Create a new product (admin only)
 */
router.post('/', writeLimiter, requireAuth, productValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    console.log('Creating product with data:', JSON.stringify(req.body, null, 2));
    const data: CreateProductDto = req.body;

    // Validate required fields
    if (!data.slug || !data.name_ru || data.price === undefined || data.price === null || !data.category) {
      res.status(400).json({ error: 'Missing required fields: slug, name_ru, price, category' });
      return;
    }

    // Check slug uniqueness
    if (!(await productsService.isSlugUnique(data.slug))) {
      res.status(400).json({ error: 'Product with this slug already exists' });
      return;
    }

    const product = await productsService.createProduct(data);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/products/:id
 * Update a product (admin only)
 */
router.put('/:id', writeLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateProductDto = req.body;

    // Check if product exists
    const existing = await productsService.getProductById(id);
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check slug uniqueness if changing slug
    if (data.slug && !(await productsService.isSlugUnique(data.slug, id))) {
      res.status(400).json({ error: 'Product with this slug already exists' });
      return;
    }

    const product = await productsService.updateProduct(id, data);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/products/:id
 * Delete a product (admin only)
 */
router.delete('/:id', writeLimiter, requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existing = await productsService.getProductById(id);
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await productsService.deleteProduct(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
