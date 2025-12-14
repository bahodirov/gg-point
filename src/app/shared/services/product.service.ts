import { Injectable, signal } from '@angular/core';
import { Product, ProductCategory, ProductSpecification } from '../models/product.model';
import rawProductsData from '../../../../data/products';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSignal = signal<Product[]>([]);
  private categoriesSignal = signal<ProductCategory[]>([]);

  products = this.productsSignal.asReadonly();
  categories = this.categoriesSignal.asReadonly();

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    // Transform raw product data to match Product interface
    const products = rawProductsData.map(p => this.transformProduct(p));
    this.productsSignal.set(products);
    this.extractCategories(products);
  }

  private transformProduct(rawProduct: any): Product {
    // Convert specs object to ProductSpecification array
    const specifications: ProductSpecification[] = Object.entries(rawProduct.specs || {}).map(
      ([key, value]) => ({
        key,
        value: String(value)
      })
    );

    return {
      id: rawProduct.id,
      slug: rawProduct.slug,
      name: rawProduct.name.ru, // Default to Russian
      nameUz: rawProduct.name.uz,
      category: rawProduct.category,
      price: rawProduct.price,
      originalPrice: rawProduct.oldPrice,
      currency: 'UZS',
      description: rawProduct.description.ru,
      descriptionUz: rawProduct.description.uz,
      specifications,
      images: rawProduct.images || [],
      thumbnail: rawProduct.images?.[0] || '',
      inStock: rawProduct.inStock ?? true,
      featured: rawProduct.featured ?? false,
      tags: [], // Can be added later if needed
      relatedProducts: rawProduct.relatedProducts,
      createdAt: new Date(),
      isNew: rawProduct.isNew
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
