import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

export interface ProductRow {
  id: string;
  slug: string;
  name_ru: string;
  name_uz: string | null;
  description_ru: string | null;
  description_uz: string | null;
  price: number;
  old_price: number | null;
  category: string;
  images: string; // JSON array
  specs: string; // JSON object
  in_stock: number;
  featured: number;
  is_new: number;
  related_products: string | null; // JSON array
  created_at: string;
  updated_at: string;
}

export interface CreateProductDto {
  slug: string;
  name_ru: string;
  name_uz?: string;
  description_ru?: string;
  description_uz?: string;
  price: number;
  old_price?: number;
  category: string;
  images?: string[];
  specs?: Record<string, string>;
  in_stock?: boolean;
  featured?: boolean;
  is_new?: boolean;
  related_products?: string[];
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface Product {
  id: string;
  slug: string;
  name: {
    ru: string;
    uz: string;
  };
  description: {
    ru: string;
    uz: string;
  };
  price: number;
  oldPrice?: number;
  category: string;
  images: string[];
  specs: Record<string, string>;
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  relatedProducts: string[];
  createdAt: string;
  updatedAt: string;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: {
      ru: row.name_ru,
      uz: row.name_uz || row.name_ru,
    },
    description: {
      ru: row.description_ru || '',
      uz: row.description_uz || row.description_ru || '',
    },
    price: row.price,
    oldPrice: row.old_price || undefined,
    category: row.category,
    images: JSON.parse(row.images || '[]'),
    specs: JSON.parse(row.specs || '{}'),
    inStock: row.in_stock === 1,
    featured: row.featured === 1,
    isNew: row.is_new === 1,
    relatedProducts: JSON.parse(row.related_products || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ProductsService {
  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    const rows = await db.products.all();
    // Sort by created_at descending
    rows.sort((a, b) => {
      const dateA = typeof a.created_at === 'string' ? a.created_at : new Date(a.created_at).toISOString();
      const dateB = typeof b.created_at === 'string' ? b.created_at : new Date(b.created_at).toISOString();
      return dateB.localeCompare(dateA);
    });
    return rows.map(rowToProduct);
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    const row = await db.products.findById(id);
    return row ? rowToProduct(row) : null;
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const row = await db.products.findBySlug(slug);
    return row ? rowToProduct(row) : null;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    const rows = await db.products.filterByCategory(category);
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return rows.map(rowToProduct);
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const rows = await db.products.filterByOptions({ featured: true });
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return rows.slice(0, limit).map(rowToProduct);
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<Product[]> {
    const rows = await db.products.searchByText(query);
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return rows.map(rowToProduct);
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const product: ProductRow = {
      id,
      slug: data.slug,
      name_ru: data.name_ru,
      name_uz: data.name_uz || null,
      description_ru: data.description_ru || null,
      description_uz: data.description_uz || null,
      price: Number(data.price),
      old_price: data.old_price ? Number(data.old_price) : null,
      category: data.category,
      images: JSON.stringify(data.images || []),
      specs: JSON.stringify(data.specs || {}),
      in_stock: data.in_stock !== false ? 1 : 0,
      featured: data.featured ? 1 : 0,
      is_new: data.is_new ? 1 : 0,
      related_products: JSON.stringify(data.related_products || []),
      created_at: now,
      updated_at: now,
    };

    await db.products.insert(product);

    // Return the product we just created (convert from row format)
    return rowToProduct(product);
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product | null> {
    const existing = await db.products.findById(id);
    if (!existing) {
      return null;
    }

    const updates: Partial<ProductRow> = {
      updated_at: new Date().toISOString(),
    };

    if (data.slug !== undefined) updates.slug = data.slug;
    if (data.name_ru !== undefined) updates.name_ru = data.name_ru;
    if (data.name_uz !== undefined) updates.name_uz = data.name_uz || null;
    if (data.description_ru !== undefined) updates.description_ru = data.description_ru || null;
    if (data.description_uz !== undefined) updates.description_uz = data.description_uz || null;
    if (data.price !== undefined) updates.price = data.price;
    if (data.old_price !== undefined) updates.old_price = data.old_price || null;
    if (data.category !== undefined) updates.category = data.category;
    if (data.images !== undefined) updates.images = JSON.stringify(data.images);
    if (data.specs !== undefined) updates.specs = JSON.stringify(data.specs);
    if (data.in_stock !== undefined) updates.in_stock = data.in_stock ? 1 : 0;
    if (data.featured !== undefined) updates.featured = data.featured ? 1 : 0;
    if (data.is_new !== undefined) updates.is_new = data.is_new ? 1 : 0;
    if (data.related_products !== undefined) updates.related_products = JSON.stringify(data.related_products);

    await db.products.update(id, updates);
    return await this.getProductById(id);
  }

  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    return await db.products.delete(id);
  }

  /**
   * Get all categories with product counts
   */
  async getCategories(): Promise<{ category: string; count: number }[]> {
    const products = await db.products.all();
    const categoryMap = new Map<string, number>();

    products.forEach(p => {
      const count = categoryMap.get(p.category) || 0;
      categoryMap.set(p.category, count + 1);
    });

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }

  /**
   * Check if slug is unique
   */
  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await db.products.findBySlug(slug);
    if (!existing) return true;
    if (excludeId && existing.id === excludeId) return true;
    return false;
  }
}

export const productsService = new ProductsService();
