import { db, isUsingPostgreSQL } from '../db/database';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { join } from 'node:path';
import { unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const MAX_IMAGE_WIDTH = parseInt(process.env['MAX_IMAGE_WIDTH'] || '1920', 10);
const THUMBNAIL_WIDTH = parseInt(process.env['THUMBNAIL_WIDTH'] || '300', 10);

export interface UploadedImage {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  path: string;
  url: string;
  uploadedBy: string | null;
  createdAt: string;
}

export interface OptimizedImageResult {
  original: {
    filename: string;
    path: string;
    url: string;
    sizeBytes: number;
  };
  thumbnail?: {
    filename: string;
    path: string;
    url: string;
    sizeBytes: number;
  };
}

export class ImageService {
  /**
   * Optimize image and create thumbnail
   */
  async optimizeImage(
    inputPath: string,
    originalFilename: string
  ): Promise<OptimizedImageResult> {
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0];
    const baseDir = join(process.cwd(), 'public', 'uploads', 'products');
    
    // Generate optimized WebP version
    const optimizedFilename = `${timestamp}-${uuid}-optimized.webp`;
    const optimizedPath = join(baseDir, optimizedFilename);
    const optimizedUrl = `/uploads/products/${optimizedFilename}`;

    // Generate thumbnail
    const thumbnailFilename = `${timestamp}-${uuid}-thumb.webp`;
    const thumbnailPath = join(baseDir, thumbnailFilename);
    const thumbnailUrl = `/uploads/products/${thumbnailFilename}`;

    try {
      // Create optimized image and thumbnail first
      const optimizedInfo = await sharp(inputPath)
        .resize(MAX_IMAGE_WIDTH, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(optimizedPath);

      const thumbnailInfo = await sharp(inputPath)
        .resize(THUMBNAIL_WIDTH, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);

      // Only delete original after successful optimization
      if (existsSync(inputPath) && inputPath !== optimizedPath) {
        try {
          await unlink(inputPath);
        } catch (error) {
          console.error('Failed to delete original file:', error);
          console.error('File path:', inputPath);
          console.error('Consider monitoring disk space and setting up alerts for cleanup failures');
        }
      }

      return {
        original: {
          filename: optimizedFilename,
          path: optimizedPath,
          url: optimizedUrl,
          sizeBytes: optimizedInfo.size,
        },
        thumbnail: {
          filename: thumbnailFilename,
          path: thumbnailPath,
          url: thumbnailUrl,
          sizeBytes: thumbnailInfo.size,
        },
      };
    } catch (error) {
      // Clean up any partially created files on error
      if (existsSync(optimizedPath)) {
        try {
          await unlink(optimizedPath);
        } catch (cleanupError) {
          console.error('Failed to cleanup optimized file:', cleanupError);
        }
      }
      if (existsSync(thumbnailPath)) {
        try {
          await unlink(thumbnailPath);
        } catch (cleanupError) {
          console.error('Failed to cleanup thumbnail file:', cleanupError);
        }
      }
      throw error;
    }
  }

  /**
   * Save image metadata to database
   */
  async saveImageMetadata(
    filename: string,
    originalName: string,
    mimeType: string,
    sizeBytes: number,
    path: string,
    url: string,
    uploadedBy: string | null
  ): Promise<UploadedImage> {
    if (!isUsingPostgreSQL()) {
      throw new Error('Image upload feature requires PostgreSQL');
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    const imageData = {
      id,
      filename,
      original_name: originalName,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      path,
      url,
      uploaded_by: uploadedBy,
      created_at: now,
    };

    await db.uploadedImages.insert(imageData);

    return {
      id,
      filename,
      originalName,
      mimeType,
      sizeBytes,
      path,
      url,
      uploadedBy,
      createdAt: now,
    };
  }

  /**
   * Get all uploaded images with pagination
   */
  async getAllImages(limit: number = 50, offset: number = 0): Promise<UploadedImage[]> {
    if (!isUsingPostgreSQL()) {
      throw new Error('Image upload feature requires PostgreSQL');
    }

    const images = await db.uploadedImages.all(limit, offset);
    
    return images.map(img => ({
      id: img.id,
      filename: img.filename,
      originalName: img.original_name,
      mimeType: img.mime_type,
      sizeBytes: img.size_bytes,
      path: img.path,
      url: img.url,
      uploadedBy: img.uploaded_by,
      createdAt: img.created_at,
    }));
  }

  /**
   * Get image by ID
   */
  async getImageById(id: string): Promise<UploadedImage | null> {
    if (!isUsingPostgreSQL()) {
      throw new Error('Image upload feature requires PostgreSQL');
    }

    const img = await db.uploadedImages.findById(id);
    
    if (!img) {
      return null;
    }

    return {
      id: img.id,
      filename: img.filename,
      originalName: img.original_name,
      mimeType: img.mime_type,
      sizeBytes: img.size_bytes,
      path: img.path,
      url: img.url,
      uploadedBy: img.uploaded_by,
      createdAt: img.created_at,
    };
  }

  /**
   * Delete image
   */
  async deleteImage(id: string): Promise<boolean> {
    if (!isUsingPostgreSQL()) {
      throw new Error('Image upload feature requires PostgreSQL');
    }

    // Get image metadata first
    const image = await this.getImageById(id);
    if (!image) {
      return false;
    }

    // Delete file from filesystem
    if (existsSync(image.path)) {
      try {
        await unlink(image.path);
      } catch (error) {
        console.error('Failed to delete image file:', error);
      }
    }

    // Delete from database
    return await db.uploadedImages.delete(id);
  }

  /**
   * Check if image is used in any products
   * 
   * Performance note: Uses JSONB operators with a GIN index for fast lookups.
   * Recommended index: CREATE INDEX idx_products_images_gin ON products USING GIN (images);
   */
  async isImageUsedInProducts(imageUrl: string): Promise<boolean> {
    if (isUsingPostgreSQL()) {
      // Use a database-level EXISTS query for scalability on large product tables
      const { getPool } = await import('../db/pool');
      const pool = getPool();
      
      if (pool) {
        const result = await pool.query(
          `SELECT EXISTS(
            SELECT 1
            FROM products
            WHERE images ? $1
          ) AS exists`,
          [imageUrl]
        );
        
        return result.rows[0]?.exists === true;
      }
    }

    // Fallback for non-PostgreSQL databases: preserve existing in-memory behavior
    const allProducts = await db.products.all();
    
    for (const product of allProducts) {
      const images = JSON.parse(product.images || '[]');
      if (images.includes(imageUrl)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get total image count
   */
  async getTotalCount(): Promise<number> {
    if (!isUsingPostgreSQL()) {
      throw new Error('Image upload feature requires PostgreSQL');
    }

    return await db.uploadedImages.count();
  }
}

export const imageService = new ImageService();
