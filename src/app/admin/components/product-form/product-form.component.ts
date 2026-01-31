import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

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
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
  ],
  template: `
    <div class="product-form">
      <div class="header">
        <h1>{{ isEditMode() ? 'Edit Product' : 'Add New Product' }}</h1>
        <a mat-button routerLink="/admin/products">
          <mat-icon>arrow_back</mat-icon>
          Back to Products
        </a>
      </div>

      @if (isLoading()) {
        <div class="loading">
          <mat-spinner></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-grid">
            <!-- Basic Information -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>Basic Information</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Slug (URL)</mat-label>
                  <input matInput formControlName="slug" placeholder="product-slug">
                  <mat-hint>Used in product URL, e.g., /product/product-slug</mat-hint>
                  @if (form.get('slug')?.hasError('required')) {
                    <mat-error>Slug is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Name (Russian)</mat-label>
                  <input matInput formControlName="name_ru" placeholder="Product name in Russian">
                  @if (form.get('name_ru')?.hasError('required')) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Name (Uzbek)</mat-label>
                  <input matInput formControlName="name_uz" placeholder="Product name in Uzbek">
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description (Russian)</mat-label>
                  <textarea matInput formControlName="description_ru" rows="4" 
                            placeholder="Product description in Russian"></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description (Uzbek)</mat-label>
                  <textarea matInput formControlName="description_uz" rows="4" 
                            placeholder="Product description in Uzbek"></textarea>
                </mat-form-field>
              </mat-card-content>
            </mat-card>

            <!-- Pricing & Category -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>Pricing & Category</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="two-columns">
                  <mat-form-field appearance="outline">
                    <mat-label>Price (UZS)</mat-label>
                    <input matInput type="number" formControlName="price" placeholder="1000000">
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

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Category</mat-label>
                  <mat-select formControlName="category">
                    @for (cat of categories; track cat) {
                      <mat-option [value]="cat">{{ cat | titlecase }}</mat-option>
                    }
                  </mat-select>
                  @if (form.get('category')?.hasError('required')) {
                    <mat-error>Category is required</mat-error>
                  }
                </mat-form-field>

                <div class="checkboxes">
                  <mat-checkbox formControlName="in_stock">In Stock</mat-checkbox>
                  <mat-checkbox formControlName="featured">Featured</mat-checkbox>
                  <mat-checkbox formControlName="is_new">New</mat-checkbox>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Images -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>Images</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div formArrayName="images">
                  @for (imageCtrl of imagesArray.controls; track $index) {
                    <div class="image-row">
                      <mat-form-field appearance="outline" class="image-field">
                        <mat-label>Image URL {{ $index + 1 }}</mat-label>
                        <input matInput [formControlName]="$index" placeholder="https://example.com/image.jpg">
                      </mat-form-field>
                      <button mat-icon-button color="warn" type="button" (click)="removeImage($index)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
                <button mat-stroked-button type="button" (click)="addImage()">
                  <mat-icon>add</mat-icon>
                  Add Image
                </button>

                @if (imagesArray.length > 0) {
                  <div class="image-preview">
                    @for (imageCtrl of imagesArray.controls; track $index) {
                      @if (imageCtrl.value) {
                        <img [src]="imageCtrl.value" [alt]="'Preview ' + ($index + 1)" class="preview-img">
                      }
                    }
                  </div>
                }
              </mat-card-content>
            </mat-card>

            <!-- Specifications -->
            <mat-card class="form-section">
              <mat-card-header>
                <mat-card-title>Specifications</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div formArrayName="specs">
                  @for (specGroup of specsArray.controls; track $index) {
                    <div class="spec-row" [formGroupName]="$index">
                      <mat-form-field appearance="outline">
                        <mat-label>Key</mat-label>
                        <input matInput formControlName="key" placeholder="e.g., Sensor">
                      </mat-form-field>
                      <mat-form-field appearance="outline">
                        <mat-label>Value</mat-label>
                        <input matInput formControlName="value" placeholder="e.g., HERO 25K">
                      </mat-form-field>
                      <button mat-icon-button color="warn" type="button" (click)="removeSpec($index)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  }
                </div>
                <button mat-stroked-button type="button" (click)="addSpec()">
                  <mat-icon>add</mat-icon>
                  Add Specification
                </button>
              </mat-card-content>
            </mat-card>
          </div>

          <div class="form-actions">
            <button mat-button type="button" routerLink="/admin/products">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="isSaving() || form.invalid">
              @if (isSaving()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <ng-container>
                  <mat-icon>save</mat-icon>
                  {{ isEditMode() ? 'Save Changes' : 'Create Product' }}
                </ng-container>
              }
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .product-form {
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .loading {
      display: flex;
      justify-content: center;
      padding: 3rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }

    .form-section {
      height: fit-content;
    }

    mat-card-header {
      margin-bottom: 1rem;
    }

    mat-card-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .full-width {
      width: 100%;
    }

    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .checkboxes {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .image-row,
    .spec-row {
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .image-field {
      flex: 1;
    }

    .spec-row mat-form-field {
      flex: 1;
    }

    .image-preview {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .preview-img {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding: 1rem 0;
    }

    .form-actions button mat-spinner {
      display: inline-block;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .two-columns {
        grid-template-columns: 1fr;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }
    }
  `]
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  form: FormGroup;
  categories = CATEGORIES;
  
  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = signal(false);
  productId = signal<string | null>(null);

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
        this.snackBar.open('Failed to load product', 'Close', { duration: 3000 });
        this.router.navigate(['/admin/products']);
      }
    });
  }

  addImage(url: string = ''): void {
    this.imagesArray.push(this.fb.control(url));
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
        this.snackBar.open(
          this.isEditMode() ? 'Product updated successfully' : 'Product created successfully',
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        this.isSaving.set(false);
        this.snackBar.open(
          error.error?.error || 'Failed to save product',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }
}
