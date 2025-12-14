export interface Product {
  id: string;
  slug: string;
  name: string;
  nameUz?: string;
  category: string;
  price: number;
  originalPrice?: number;
  currency: string;
  description: string;
  descriptionUz?: string;
  specifications: ProductSpecification[];
  images: string[];
  thumbnail: string;
  inStock: boolean;
  featured: boolean;
  isNew?: boolean;
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
