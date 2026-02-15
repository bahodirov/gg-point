import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 400;">{{ isEditMode() ? 'Edit Product' : 'Add New Product' }}</h1>
        <a mat-button routerLink="/admin/products">
          <mat-icon style="margin-right: 4px;">arrow_back</mat-icon>
          Back to Products
        </a>
      </div>

      @if (isLoading()) {
        <div style="display: flex; justify-content: center; padding: 48px;">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Basic Information Card -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Basic Information</mat-card-title>
            </mat-card-header>
            <mat-card-content style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
              <mat-form-field appearance="outline">
                <mat-label>Slug (URL)</mat-label>
                <input matInput formControlName="slug" placeholder="product-slug">
                <mat-hint>Used in product URL, e.g., /product/product-slug</mat-hint>
                @if (form.get('slug')?.hasError('required')) {
                  <mat-error>Slug is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Name (Russian)</mat-label>
                <input matInput formControlName="name_ru" placeholder="Product name in Russian">
                @if (form.get('name_ru')?.hasError('required')) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Name (Uzbek)</mat-label>
                <input matInput formControlName="name_uz" placeholder="Product name in Uzbek">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description (Russian)</mat-label>
                <textarea matInput formControlName="description_ru" rows="4"
                          placeholder="Product description in Russian"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Description (Uzbek)</mat-label>
                <textarea matInput formControlName="description_uz" rows="4"
                          placeholder="Product description in Uzbek"></textarea>
              </mat-form-field>
            </mat-card-content>
          </mat-card>

          <!-- Pricing & Category Card -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Pricing & Category</mat-card-title>
            </mat-card-header>
            <mat-card-content style="display: flex; flex-direction: column; gap: 16px; margin-top: 16px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <mat-form-field appearance="outline">
                  <mat-label>Price (UZS)</mat-label>
                  <input matInput type="number" formControlName="price" placeholder="1000000">
                  <mat-icon matPrefix>attach_money</mat-icon>
                  @if (form.get('price')?.hasError('required')) {
                    <mat-error>Price is required</mat-error>
                  }
                  @if (form.get('price')?.hasError('min')) {
                    <mat-error>Price must be positive</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Old Price (UZS)</mat-label>
                  <input matInput type="number" formControlName="old_price" placeholder="Optional">
                  <mat-hint>Leave empty if no discount</mat-hint>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option value="">Select category</mat-option>
                  @for (cat of categories; track cat) {
                    <mat-option [value]="cat">{{ cat }}</mat-option>
                  }
                </mat-select>
                @if (form.get('category')?.hasError('required')) {
                  <mat-error>Category is required</mat-error>
                }
              </mat-form-field>

              <div style="display: flex; gap: 24px;">
                <mat-checkbox formControlName="in_stock">In Stock</mat-checkbox>
                <mat-checkbox formControlName="featured">Featured</mat-checkbox>
                <mat-checkbox formControlName="is_new">New</mat-checkbox>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Images Card -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Images</mat-card-title>
              <mat-card-subtitle>Upload product images or add URLs</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content style="margin-top: 16px;">
              <div formArrayName="images" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                @for (imageCtrl of imagesArray.controls; track $index) {
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <mat-form-field appearance="outline" style="flex: 1;">
                      <mat-label>Image URL {{ $index + 1 }}</mat-label>
                      <input matInput [formControlName]="$index" placeholder="https://example.com/image.jpg">
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeImage($index)" matTooltip="Remove image">
                      <mat-icon>delete</mat-icon>
                    </button>
                    @if (imageCtrl.value) {
                      <img [src]="imageCtrl.value" [alt]="'Preview ' + ($index + 1)"
                           style="width: 52px; height: 52px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12);">
                    }
                  </div>
                }
              </div>

              <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                <input
                  #fileInput
                  type="file"
                  accept="image/*"
                  multiple
                  style="display: none"
                  (change)="onFilesSelected($event)"
                >
                <button mat-raised-button color="primary" type="button" (click)="fileInput.click()" [disabled]="isUploading()">
                  <mat-icon style="margin-right: 4px;">cloud_upload</mat-icon>
                  Upload from PC
                </button>
                <button mat-stroked-button type="button" (click)="addImage()">
                  <mat-icon style="margin-right: 4px;">add_link</mat-icon>
                  Add URL
                </button>
              </div>

              @if (isUploading()) {
                <div style="margin-bottom: 16px;">
                  <mat-progress-bar mode="determinate" [value]="uploadProgress()"></mat-progress-bar>
                  <span style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 4px; display: block;">
                    {{ uploadProgress() }}% uploading...
                  </span>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Specifications Card -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Specifications</mat-card-title>
              <mat-card-subtitle>Add product technical details</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content style="margin-top: 16px;">
              <div formArrayName="specs" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
                @for (specGroup of specsArray.controls; track $index) {
                  <div [formGroupName]="$index" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: start;">
                    <mat-form-field appearance="outline">
                      <mat-label>Property</mat-label>
                      <input matInput formControlName="key" placeholder="e.g., Sensor">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Value</mat-label>
                      <input matInput formControlName="value" placeholder="e.g., HERO 25K">
                    </mat-form-field>
                    <button mat-icon-button color="warn" type="button" (click)="removeSpec($index)" matTooltip="Remove specification">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                }
              </div>
              <button mat-stroked-button type="button" (click)="addSpec()">
                <mat-icon style="margin-right: 4px;">add</mat-icon>
                Add Specification
              </button>
            </mat-card-content>
          </mat-card>

          <!-- Form Actions -->
          <div style="display: flex; justify-content: flex-end; gap: 12px; padding: 16px; background-color: rgba(255, 255, 255, 0.05); border-radius: 4px;">
            <a mat-button routerLink="/admin/products">Cancel</a>
            <button mat-raised-button color="primary" type="submit" [disabled]="isSaving() || form.invalid">
              @if (isSaving()) {
                <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
                <span>Saving...</span>
              } @else {
                <ng-container>
                  <mat-icon style="margin-right: 4px;">{{ isEditMode() ? 'save' : 'add' }}</mat-icon>
                  <span>{{ isEditMode() ? 'Save Changes' : 'Create Product' }}</span>
                </ng-container>
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
        alert('Failed to load product');
        this.router.navigate(['/admin/products']);
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
        alert(`Successfully uploaded ${successCount} images`);
      })
      .catch(error => {
        alert('Failed to upload some images');
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
        alert(this.isEditMode() ? 'Product updated successfully' : 'Product created successfully');
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        this.isSaving.set(false);
        alert(error.error?.error || 'Failed to save product');
      }
    });
  }
}
