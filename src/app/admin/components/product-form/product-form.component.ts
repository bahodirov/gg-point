import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';

interface Product {
  id: string;
  slug: string;
  name: { ru: string; uz: string };
  description: { ru: string; uz: string };
  price: number;
  oldPrice?: number;
  category: string;
  images: string[];
  specs: Record<string, string>;
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  relatedProducts: string[];
}

interface ProductFormData {
  slug: string;
  name_ru: string;
  name_uz: string;
  description_ru: string;
  description_uz: string;
  price: number;
  old_price?: number;
  category: string;
  images: string[];
  specs: Record<string, string>;
  in_stock: boolean;
  featured: boolean;
  is_new: boolean;
  related_products: string[];
}

const CATEGORIES = [
  'mice',
  'keyboards',
  'headsets',
  'monitors',
  'mousepads',
  'webcams',
  'cables',
  'other'
];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
  ],
  template: `
    <div>
      <div>
        <h1>{{ isEditMode() ? 'Edit Product' : 'Add New Product' }}</h1>
        <a routerLink="/admin/products">Back to Products</a>
      </div>

      @if (errorMessage()) {
        <div style="background-color: #fee; border: 1px solid #fcc; padding: 12px; margin-bottom: 16px; border-radius: 4px; color: #c33;">
          <strong>Error:</strong> {{ errorMessage() }}
          <button (click)="errorMessage.set(null)" style="float: right; background: none; border: none; cursor: pointer; font-size: 18px;">&times;</button>
        </div>
      }

      @if (successMessage()) {
        <div style="background-color: #efe; border: 1px solid #cfc; padding: 12px; margin-bottom: 16px; border-radius: 4px; color: #3c3;">
          <strong>Success:</strong> {{ successMessage() }}
          <button (click)="successMessage.set(null)" style="float: right; background: none; border: none; cursor: pointer; font-size: 18px;">&times;</button>
        </div>
      }

      @if (isLoading()) {
        <div>
          <p>Loading...</p>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Basic Information -->
          <fieldset>
            <legend>Basic Information</legend>

            <div>
              <label for="slug">Slug (URL)</label>
              <input id="slug" formControlName="slug" placeholder="product-slug">
              <small>Used in product URL, e.g., /product/product-slug</small>
              @if (form.get('slug')?.hasError('required')) {
                <span>Slug is required</span>
              }
            </div>

            <div>
              <label for="name_ru">Name (Russian)</label>
              <input id="name_ru" formControlName="name_ru" placeholder="Product name in Russian">
              @if (form.get('name_ru')?.hasError('required')) {
                <span>Name is required</span>
              }
            </div>

            <div>
              <label for="name_uz">Name (Uzbek)</label>
              <input id="name_uz" formControlName="name_uz" placeholder="Product name in Uzbek">
            </div>

            <div>
              <label for="description_ru">Description (Russian)</label>
              <textarea id="description_ru" formControlName="description_ru" rows="4"
                        placeholder="Product description in Russian"></textarea>
            </div>

            <div>
              <label for="description_uz">Description (Uzbek)</label>
              <textarea id="description_uz" formControlName="description_uz" rows="4"
                        placeholder="Product description in Uzbek"></textarea>
            </div>
          </fieldset>

          <!-- Pricing & Category -->
          <fieldset>
            <legend>Pricing & Category</legend>

            <div>
              <label for="price">Price (UZS)</label>
              <input id="price" type="number" formControlName="price" placeholder="1000000">
              @if (form.get('price')?.hasError('required')) {
                <span>Price is required</span>
              }
              @if (form.get('price')?.hasError('min')) {
                <span>Price must be positive</span>
              }
            </div>

            <div>
              <label for="old_price">Old Price (UZS)</label>
              <input id="old_price" type="number" formControlName="old_price" placeholder="Optional">
              <small>Leave empty if no discount</small>
            </div>

            <div>
              <label for="category">Category</label>
              <select id="category" formControlName="category">
                <option value="">Select category</option>
                @for (cat of categories; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
              @if (form.get('category')?.hasError('required')) {
                <span>Category is required</span>
              }
            </div>

            <div>
              <label>
                <input type="checkbox" formControlName="in_stock"> In Stock
              </label>
              <label>
                <input type="checkbox" formControlName="featured"> Featured
              </label>
              <label>
                <input type="checkbox" formControlName="is_new"> New
              </label>
            </div>
          </fieldset>

          <!-- Images -->
          <fieldset>
            <legend>Images</legend>

            <div formArrayName="images">
              @for (imageCtrl of imagesArray.controls; track $index) {
                <div>
                  <input [formControlName]="$index" placeholder="https://example.com/image.jpg">
                  <button type="button" (click)="removeImage($index)">Remove</button>
                </div>
              }
            </div>

            <div>
              <input
                #fileInput
                type="file"
                accept="image/*"
                multiple
                style="display: none"
                (change)="onFilesSelected($event)"
              >
              <button type="button" (click)="fileInput.click()" [disabled]="isUploading()">
                Upload from PC
              </button>
              <button type="button" (click)="addImage()">
                Add URL
              </button>
            </div>

            @if (isUploading()) {
              <div>
                <progress [value]="uploadProgress()" max="100"></progress>
                <span>{{ uploadProgress() }}% uploading...</span>
              </div>
            }

            @if (imagesArray.length > 0) {
              <div>
                @for (imageCtrl of imagesArray.controls; track $index) {
                  @if (imageCtrl.value) {
                    <img [src]="imageCtrl.value" [alt]="'Preview ' + ($index + 1)" width="90" height="90">
                  }
                }
              </div>
            }
          </fieldset>

          <!-- Specifications -->
          <fieldset>
            <legend>Specifications</legend>

            <div formArrayName="specs">
              @for (specGroup of specsArray.controls; track $index) {
                <div [formGroupName]="$index">
                  <input formControlName="key" placeholder="e.g., Sensor">
                  <input formControlName="value" placeholder="e.g., HERO 25K">
                  <button type="button" (click)="removeSpec($index)">Remove</button>
                </div>
              }
            </div>
            <button type="button" (click)="addSpec()">
              Add Specification
            </button>
          </fieldset>

          <div>
            <a routerLink="/admin/products">Cancel</a>
            <button type="submit" [disabled]="isSaving() || form.invalid">
              @if (isSaving()) {
                Saving...
              } @else {
                {{ isEditMode() ? 'Save Changes' : 'Create Product' }}
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: []
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  categories = CATEGORIES;

  isLoading = signal(false);
  isSaving = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  isEditMode = signal(false);
  productId = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor() {
    this.form = this.fb.group({
      slug: ['', Validators.required],
      name_ru: ['', Validators.required],
      name_uz: [''],
      description_ru: [''],
      description_uz: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      old_price: [null],
      category: ['', Validators.required],
      in_stock: [true],
      featured: [false],
      is_new: [false],
      images: this.fb.array([]),
      specs: this.fb.array([])
    });
  }

  get imagesArray(): FormArray {
    return this.form.get('images') as FormArray;
  }

  get specsArray(): FormArray {
    return this.form.get('specs') as FormArray;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.http.get<Product>(`/api/products/${id}`).subscribe({
      next: (product) => {
        this.form.patchValue({
          slug: product.slug,
          name_ru: product.name.ru,
          name_uz: product.name.uz,
          description_ru: product.description.ru,
          description_uz: product.description.uz,
          price: product.price,
          old_price: product.oldPrice || null,
          category: product.category,
          in_stock: product.inStock,
          featured: product.featured,
          is_new: product.isNew
        });

        // Load images
        if (product.images?.length) {
          product.images.forEach(url => this.addImage(url));
        }

        // Load specs
        if (product.specs) {
          Object.entries(product.specs).forEach(([key, value]) => {
            this.addSpec(key, value);
          });
        }

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load product. Redirecting to product list...');
        setTimeout(() => this.router.navigate(['/admin/products']), 2000);
      }
    });
  }

  addImage(url: string = ''): void {
    this.imagesArray.push(this.fb.control(url));
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    const fileArray = Array.from(files);
    let completedCount = 0;
    const totalFiles = fileArray.length;

    const uploadPromises = fileArray.map(file => {
      return this.uploadFile(file).then(url => {
        completedCount++;
        this.uploadProgress.set(Math.round((completedCount / totalFiles) * 100));
        return url;
      });
    });

    Promise.all(uploadPromises)
      .then(urls => {
        urls.forEach(url => {
          if (url) this.addImage(url);
        });
        const successCount = urls.filter(u => u).length;
        this.successMessage.set(`Successfully uploaded ${successCount} image${successCount !== 1 ? 's' : ''}`);
        // Auto-dismiss after 3 seconds
        setTimeout(() => this.successMessage.set(null), 3000);
      })
      .catch(error => {
        this.errorMessage.set('Failed to upload some images. Please try again.');
      })
      .finally(() => {
        this.isUploading.set(false);
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      });
  }

  private uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('image', file);

    return new Promise((resolve, reject) => {
      this.http.post<{ success: boolean; image: { url: string } }>('/api/admin/upload-image', formData)
        .subscribe({
          next: (response) => {
            resolve(response.image?.url || null);
          },
          error: (error) => {
            reject(error);
          }
        });
    });
  }

  removeImage(index: number): void {
    this.imagesArray.removeAt(index);
  }

  addSpec(key: string = '', value: string = ''): void {
    this.specsArray.push(this.fb.group({ key, value }));
  }

  removeSpec(index: number): void {
    this.specsArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSaving.set(true);

    const formValue = this.form.value;

    // Convert specs array to object
    const specs: Record<string, string> = {};
    formValue.specs.forEach((spec: { key: string; value: string }) => {
      if (spec.key && spec.value) {
        specs[spec.key] = spec.value;
      }
    });

    const data: ProductFormData = {
      slug: formValue.slug,
      name_ru: formValue.name_ru,
      name_uz: formValue.name_uz || formValue.name_ru,
      description_ru: formValue.description_ru,
      description_uz: formValue.description_uz || formValue.description_ru,
      price: formValue.price,
      old_price: formValue.old_price || undefined,
      category: formValue.category,
      images: formValue.images.filter((url: string) => url.trim()),
      specs,
      in_stock: formValue.in_stock,
      featured: formValue.featured,
      is_new: formValue.is_new,
      related_products: []
    };

    const request = this.isEditMode()
      ? this.http.put(`/api/products/${this.productId()}`, data)
      : this.http.post('/api/products', data);

    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set(this.isEditMode() ? 'Product updated successfully' : 'Product created successfully');
        // Redirect after showing success message
        setTimeout(() => this.router.navigate(['/admin/products']), 1500);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.errorMessage.set(error.error?.error || 'Failed to save product. Please try again.');
      }
    });
  }
}
