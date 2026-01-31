import { Router, Request, Response } from 'express';
import { productsService, CreateProductDto, UpdateProductDto } from '../services/products.service';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/products
 * Get all products (public)
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, search, featured } = req.query;

    let products;

    if (search) {
      products = productsService.searchProducts(String(search));
    } else if (category) {
      products = productsService.getProductsByCategory(String(category));
    } else if (featured === 'true') {
      const limit = req.query['limit'] ? parseInt(String(req.query['limit']), 10) : 6;
      products = productsService.getFeaturedProducts(limit);
    } else {
      products = productsService.getAllProducts();
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
router.get('/categories', (req: Request, res: Response) => {
  try {
    const categories = productsService.getCategories();
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
router.get('/:idOrSlug', (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    
    // Try to find by ID first, then by slug
    let product = productsService.getProductById(idOrSlug);
    if (!product) {
      product = productsService.getProductBySlug(idOrSlug);
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
router.post('/', requireAuth, (req: Request, res: Response) => {
  try {
    const data: CreateProductDto = req.body;

    // Validate required fields
    if (!data.slug || !data.name_ru || !data.price || !data.category) {
      res.status(400).json({ error: 'Missing required fields: slug, name_ru, price, category' });
      return;
    }

    // Check slug uniqueness
    if (!productsService.isSlugUnique(data.slug)) {
      res.status(400).json({ error: 'Product with this slug already exists' });
      return;
    }

    const product = productsService.createProduct(data);
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
router.put('/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateProductDto = req.body;

    // Check if product exists
    const existing = productsService.getProductById(id);
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check slug uniqueness if changing slug
    if (data.slug && !productsService.isSlugUnique(data.slug, id)) {
      res.status(400).json({ error: 'Product with this slug already exists' });
      return;
    }

    const product = productsService.updateProduct(id, data);
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
router.delete('/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existing = productsService.getProductById(id);
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    productsService.deleteProduct(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
