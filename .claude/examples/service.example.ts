/**
 * SERVICE TEMPLATE EXAMPLE
 *
 * Use this as a template when creating new admin services.
 * This example shows a complete Product service with CRUD operations.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Standard API response wrapper for all endpoints
 */
interface ApiResponse<T> {
  success: boolean;
  data: T | T[];
  total?: number;
  page?: number;
  pageSize?: number;
  message?: string;
}

/**
 * Error response format
 */
interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: any;
}

/**
 * List query parameters (reusable across services)
 */
interface ListQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  [key: string]: any; // Service-specific filters
}

/**
 * Product model as returned from API
 */
interface Product {
  id: string;
  slug: string;
  name: { ru: string; uz?: string };
  description: { ru: string; uz?: string };
  category: string;
  price: number;
  oldPrice?: number;
  specs?: Record<string, string>;
  images?: string[];
  inStock: boolean;
  featured: boolean;
  isNew?: boolean;
  createdAt: string;
}

/**
 * Product form data (for create/update)
 * Note: Snake case for API compatibility
 */
interface ProductFormData {
  slug: string;
  name_ru: string;
  name_uz?: string;
  description_ru: string;
  description_uz?: string;
  price: number;
  old_price?: number;
  category: string;
  images?: string[];
  specs?: Record<string, string>;
  in_stock: boolean;
  featured: boolean;
  is_new: boolean;
  related_products?: string[];
}

/**
 * ProductService
 *
 * Handles all product-related API calls for the admin panel.
 * Uses dependency injection, proper error handling, and follows
 * Angular best practices.
 */
@Injectable({
  providedIn: 'root' // Provide at root to ensure single instance
})
export class ProductService {
  // Inject HttpClient via inject() helper
  private http = inject(HttpClient);

  // API base URL
  private readonly API_URL = '/api/products';
  private readonly UPLOAD_URL = '/api/admin/upload-image';

  /**
   * GET: Fetch products list with pagination and filtering
   *
   * @param params Query parameters (page, pageSize, filters, sort)
   * @returns Observable of paginated product list
   *
   * @example
   * service.list({
   *   page: 1,
   *   pageSize: 20,
   *   category: 'mice',
   *   inStock: true,
   *   sortBy: 'price',
   *   order: 'asc'
   * }).subscribe(response => {
   *   console.log(response.data); // Array of products
   *   console.log(response.total); // Total count
   * });
   */
  list(params: ListQueryParams = {}): Observable<ApiResponse<Product[]>> {
    // Convert params to HttpParams (handles undefined values)
    let httpParams = new HttpParams();

    // Add pagination
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }

    // Add sorting
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.order) {
      httpParams = httpParams.set('order', params.order);
    }

    // Add search
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    // Add service-specific filters (category, inStock, etc.)
    Object.keys(params).forEach(key => {
      if (
        !['page', 'pageSize', 'search', 'sortBy', 'order'].includes(key)
        && params[key] !== undefined
      ) {
        httpParams = httpParams.set(key, String(params[key]));
      }
    });

    return this.http.get<ApiResponse<Product[]>>(this.API_URL, { params: httpParams }).pipe(
      tap(response => {
        console.log(`Fetched ${response.data?.length || 0} products`);
      }),
      catchError(error => this.handleError('Failed to fetch products', error))
    );
  }

  /**
   * GET: Fetch single product by ID
   *
   * @param id Product ID
   * @returns Observable of single product
   *
   * @example
   * service.getById('prod-123').subscribe(response => {
   *   console.log(response.data);
   * });
   */
  getById(id: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.API_URL}/${id}`).pipe(
      tap(response => {
        console.log(`Fetched product: ${response.data.id}`);
      }),
      catchError(error => this.handleError(`Failed to fetch product ${id}`, error))
    );
  }

  /**
   * POST: Create new product
   *
   * @param data Product form data
   * @returns Observable of created product (includes generated ID)
   *
   * @example
   * service.create({
   *   slug: 'new-product',
   *   name_ru: 'Новый товар',
   *   name_uz: 'Yangi tovar',
   *   description_ru: '...',
   *   description_uz: '...',
   *   price: 100000,
   *   category: 'mice',
   *   in_stock: true,
   *   featured: false,
   *   is_new: true
   * }).subscribe(response => {
   *   console.log('Created:', response.data.id);
   * });
   */
  create(data: ProductFormData): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.API_URL, data).pipe(
      tap(response => {
        console.log(`Product created: ${response.data.id}`);
      }),
      catchError(error => this.handleError('Failed to create product', error))
    );
  }

  /**
   * PUT: Update existing product (full update)
   *
   * Note: All required fields must be provided (use PUT, not PATCH)
   *
   * @param id Product ID
   * @param data Updated product data
   * @returns Observable of updated product
   *
   * @example
   * service.update('prod-123', {
   *   slug: 'updated-slug',
   *   name_ru: 'Обновленное название',
   *   // ... all other required fields
   * }).subscribe(response => {
   *   console.log('Updated:', response.data);
   * });
   */
  update(id: string, data: ProductFormData): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.API_URL}/${id}`, data).pipe(
      tap(response => {
        console.log(`Product updated: ${response.data.id}`);
      }),
      catchError(error => this.handleError(`Failed to update product ${id}`, error))
    );
  }

  /**
   * DELETE: Delete product by ID
   *
   * @param id Product ID
   * @returns Observable of delete response
   *
   * @example
   * service.delete('prod-123').subscribe(response => {
   *   console.log('Product deleted');
   * });
   */
  delete(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        console.log(`Product deleted: ${id}`);
      }),
      catchError(error => this.handleError(`Failed to delete product ${id}`, error))
    );
  }

  /**
   * POST: Upload image file
   *
   * Returns the image URL from the server.
   *
   * @param file Image file to upload
   * @returns Observable of upload response with image URL
   *
   * @example
   * service.uploadImage(fileInput.files[0]).subscribe(
   *   response => {
   *     const imageUrl = response.image.url;
   *     this.form.patchValue({ images: [imageUrl] });
   *   },
   *   error => {
   *     console.error('Upload failed');
   *   }
   * );
   */
  uploadImage(file: File): Observable<{ success: boolean; image: { url: string } }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ success: boolean; image: { url: string } }>(
      this.UPLOAD_URL,
      formData
    ).pipe(
      tap(response => {
        console.log(`Image uploaded: ${response.image.url}`);
      }),
      catchError(error => this.handleError('Failed to upload image', error))
    );
  }

  /**
   * Helper: Central error handling
   *
   * Logs errors, extracts meaningful messages, and re-throws
   * for component-level handling.
   *
   * @param context Brief description of what was being done
   * @param error HTTP error response
   * @returns Observable that throws the processed error
   */
  private handleError(context: string, error: HttpErrorResponse): Observable<never> {
    // Log full error for debugging
    console.error(`[${context}]`, error);

    // Build user-friendly error message
    let errorMessage = context;

    if (error.error?.error) {
      // Use API error message if available
      errorMessage = error.error.error;
    } else if (error.status === 0) {
      errorMessage = 'Network error - check your connection';
    } else if (error.status === 401) {
      errorMessage = 'Authentication required - please log in';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission for this action';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.status === 409) {
      errorMessage = 'Conflict - resource may have been modified';
    } else if (error.status === 422) {
      errorMessage = 'Validation failed - check your input';
    } else if (error.status >= 500) {
      errorMessage = 'Server error - please try again later';
    }

    // Create error object with detailed information
    const apiError: ApiError = {
      success: false,
      error: errorMessage,
      code: error.error?.code || `HTTP_${error.status}`,
      details: error.error?.details || { status: error.status }
    };

    // Re-throw error for component handling
    return throwError(() => apiError);
  }

  /**
   * ADVANCED: Service-level caching (optional)
   *
   * For performance, you might cache products at service level.
   * This example shows the pattern (not required for initial implementation).
   */
  private _cache = new Map<string, { data: Product[]; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get products with client-side caching
   */
  listCached(params: ListQueryParams = {}): Observable<ApiResponse<Product[]>> {
    const cacheKey = JSON.stringify(params);

    // Check cache
    const cached = this._cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Using cached products');
      return new Observable(observer => {
        observer.next({ success: true, data: cached.data });
        observer.complete();
      });
    }

    // Fetch and cache
    return this.list(params).pipe(
      tap(response => {
        if (Array.isArray(response.data)) {
          this._cache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
          });
        }
      })
    );
  }

  /**
   * Clear cache (call after mutations)
   */
  clearCache(): void {
    this._cache.clear();
    console.log('Service cache cleared');
  }
}

/**
 * USAGE EXAMPLE IN COMPONENT
 */
export class ProductListComponentExample {
  private service = inject(ProductService);

  loadProducts(): void {
    // Simple list
    this.service.list({
      page: 1,
      pageSize: 20,
      sortBy: 'createdAt',
      order: 'desc'
    }).subscribe({
      next: (response) => {
        console.log('Products:', response.data);
        console.log('Total:', response.total);
      },
      error: (error: ApiError) => {
        console.error('Error:', error.error);
        // Show snackbar notification
        // this.snackBar.open(error.error, 'Close', { duration: 5000 });
      }
    });
  }

  createProduct(data: ProductFormData): void {
    this.service.create(data).subscribe({
      next: (response) => {
        console.log('Created:', response.data.id);
        this.service.clearCache(); // Invalidate cache
      },
      error: (error: ApiError) => {
        console.error('Error:', error);
      }
    });
  }

  uploadProductImage(file: File): void {
    this.service.uploadImage(file).subscribe({
      next: (response) => {
        const imageUrl = response.image.url;
        console.log('Image uploaded:', imageUrl);
        // Add to form
      },
      error: (error) => {
        console.error('Upload failed:', error);
      }
    });
  }
}
