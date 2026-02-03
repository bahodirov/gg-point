import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product, ProductCategory, ProductSpecification } from '../models/product.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private productsSignal = signal<Product[]>([]);
  private categoriesSignal = signal<ProductCategory[]>([]);

  products = this.productsSignal.asReadonly();
  categories = this.categoriesSignal.asReadonly();

  constructor() {
    this.loadProducts();
  }

  async loadProducts(): Promise<void> {
    try {
      // Fetch from API
      const serverProducts = await firstValueFrom(this.http.get<any[]>('/api/products'));
      const products = serverProducts.map(p => this.transformProduct(p));
      this.productsSignal.set(products);
      this.extractCategories(products);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  private transformProduct(p: any): Product {
    // Transform from server representation ({ru, uz} objects) to frontend representation
    const specifications: ProductSpecification[] = Object.entries(p.specs || {}).map(
      ([key, value]) => ({
        key,
        value: String(value)
      })
    );

    return {
      id: p.id,
      slug: p.slug,
      name: p.name.ru,
      nameUz: p.name.uz,
      category: p.category,
      price: p.price,
      originalPrice: p.oldPrice,
      currency: 'UZS',
      description: p.description.ru,
      descriptionUz: p.description.uz,
      specifications,
      images: p.images || [],
      thumbnail: p.images?.[0] || '',
      inStock: p.inStock ?? true,
      featured: p.featured ?? false,
      tags: [],
      relatedProducts: p.relatedProducts,
      createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
      isNew: p.isNew
    } as Product;
  }

  private extractCategories(products: Product[]): void {
    const categoryMap = new Map<string, ProductCategory>();

    products.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, {
          id: product.category.toLowerCase().replace(/\s+/g, '-'),
          name: product.category,
          slug: product.category.toLowerCase().replace(/\s+/g, '-'),
          productCount: 1
        });
      } else {
        const cat = categoryMap.get(product.category)!;
        cat.productCount = (cat.productCount || 0) + 1;
      }
    });

    this.categoriesSignal.set(Array.from(categoryMap.values()));
  }

  getProductById(id: string): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.productsSignal().find(p => p.slug === slug);
  }

  getProductsByCategory(category: string): Product[] {
    return this.productsSignal().filter(p =>
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  getFeaturedProducts(limit: number = 6): Product[] {
    return this.productsSignal()
      .filter(p => p.featured)
      .slice(0, limit);
  }

  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this.productsSignal().filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  filterProducts(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  }): Product[] {
    let filtered = this.productsSignal();

    if (filters.category) {
      filtered = filtered.filter(p =>
        p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.inStock !== undefined) {
      filtered = filtered.filter(p => p.inStock === filters.inStock);
    }

    return filtered;
  }

  getRelatedProducts(productId: string, limit: number = 4): Product[] {
    const product = this.getProductById(productId);
    if (!product) return [];

    // Get products from the same category, excluding the current product
    return this.productsSignal()
      .filter(p =>
        p.id !== productId &&
        p.category === product.category
      )
      .slice(0, limit);
  }
}
