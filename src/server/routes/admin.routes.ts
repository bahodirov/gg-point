import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadMemory } from '../config/multer.config';
import { imageService } from '../services/image.service';
import { uploadLimiter } from '../middleware/security.middleware';
import { paginationValidation, uuidValidation, validateRequest } from '../middleware/validation.middleware';
import { join } from 'node:path';
import { getDatabaseWarning, isDatabaseHealthy } from '../db/database';

const router = Router();

/**
 * GET /api/admin/health
 * Database health check
 */
router.get('/health', requireAuth, async (req: Request, res: Response) => {
  try {
    const warning = getDatabaseWarning();
    const isHealthy = isDatabaseHealthy();
    const usingPostgreSQL = await import('../db/database').then(m => m.isUsingPostgreSQL());

    res.json({
      healthy: isHealthy,
      warning: warning,
      database: usingPostgreSQL ? 'postgresql' : 'json-fallback'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

/**
 * POST /api/admin/upload-image
 * Upload and optimize a single image
 */
router.post('/upload-image', requireAuth, uploadLimiter, uploadMemory.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image file provided' });
      return;
    }

    const userId = req.user?.id || null;

    // Save to temporary location first
    const { writeFile } = await import('node:fs/promises');
    const tempPath = join(process.cwd(), 'public', 'uploads', 'products', `temp-${Date.now()}.tmp`);
    await writeFile(tempPath, req.file.buffer);

    // Optimize image and create thumbnail
    const optimized = await imageService.optimizeImage(tempPath, req.file.originalname);

    // Save metadata to database
    const image = await imageService.saveImageMetadata(
      optimized.original.filename,
      req.file.originalname,
      'image/webp', // Always WebP after optimization
      optimized.original.sizeBytes,
      optimized.original.path,
      optimized.original.url,
      userId
    );

    res.status(201).json({
      success: true,
      image: {
        id: image.id,
        url: image.url,
        thumbnailUrl: optimized.thumbnail?.url,
        filename: image.filename,
        originalName: image.originalName,
        sizeBytes: image.sizeBytes,
        createdAt: image.createdAt,
      },
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

/**
 * GET /api/admin/images
 * List all uploaded images with pagination
 */
router.get('/images', requireAuth, paginationValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query['page'] || '1'), 10);
    const perPage = parseInt(String(req.query['per_page'] || '50'), 10);
    const offset = (page - 1) * perPage;

    const images = await imageService.getAllImages(perPage, offset);
    const total = await imageService.getTotalCount();

    res.json({
      images,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('List images error:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

/**
 * GET /api/admin/images/:id
 * Get single image by ID
 */
router.get('/images/:id', requireAuth, uuidValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = await imageService.getImageById(id);

    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    res.json(image);
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ error: 'Failed to get image' });
  }
});

/**
 * DELETE /api/admin/images/:id
 * Delete image (with validation)
 */
router.delete('/images/:id', requireAuth, uuidValidation, validateRequest, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = await imageService.getImageById(id);

    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    // Check if image is used in any products
    const isUsed = await imageService.isImageUsedInProducts(image.url);
    if (isUsed) {
      res.status(400).json({
        error: 'Cannot delete image: it is currently used in one or more products',
        code: 'IMAGE_IN_USE'
      });
      return;
    }

    const deleted = await imageService.deleteImage(id);
    if (!deleted) {
      res.status(500).json({ error: 'Failed to delete image' });
      return;
    }

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

export default router;
