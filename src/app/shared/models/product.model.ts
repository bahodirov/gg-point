export interface Product {
  id: string;
  slug: string;
  name: string;
  nameUz?: string;
  category: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  currency: 'UZS' | 'USD';
  description: string;
  descriptionUz?: string;
  features?: string[];
  specifications: ProductSpecification[];
  images: string[];
  thumbnail: string;
  inStock: boolean;
  featured: boolean;
  isNew?: boolean;
  videoUrl?: string;
  tags: string[];
  relatedProducts?: string[];
  createdAt: Date;
}

export interface ProductSpecification {
  key: string;
  value: string;
  keyUz?: string;
  valueUz?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  nameUz?: string;
  slug: string;
  icon?: string;
  productCount?: number;
}

// Server product response interface (from API)
export interface ServerProduct {
  id: string;
  slug: string;
  name: { ru: string; uz?: string };
  category: string;
  price: number;
  oldPrice?: number;
  description: { ru: string; uz?: string };
  specs?: Record<string, string | number | boolean>;
  images?: string[];
  inStock?: boolean;
  featured?: boolean;
  isNew?: boolean;
  relatedProducts?: string[];
  currency?: string;
  createdAt?: string;
}
