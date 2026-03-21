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

const CATEGORIES = ['mice', 'keyboards', 'headsets', 'monitors', 'mousepads', 'webcams', 'cables', 'other'];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">{{ isEditMode() ? 'Edit Product' : 'Add New Product' }}</h1>
          <p class="text-gray-400 text-sm mt-0.5">{{ isEditMode() ? 'Update product information' : 'Fill in the details below' }}</p>
        </div>
        <a routerLink="/admin/products"
           class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Back
        </a>
      </div>

      @if (isLoading()) {
        <div class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

          <!-- Basic Information -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-700">
              <h2 class="font-semibold text-white">Basic Information</h2>
            </div>
            <div class="p-5 space-y-4">


              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Name (Russian) <span class="text-red-400">*</span></label>
                  <input type="text" formControlName="name_ru" placeholder="Product name in Russian"
                         class="w-full bg-gray-700 border text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                         [ngClass]="form.get('name_ru')?.invalid && form.get('name_ru')?.touched ? 'border-red-500' : 'border-gray-600'">
                  @if (form.get('name_ru')?.hasError('required') && form.get('name_ru')?.touched) {
                    <p class="text-xs text-red-400 mt-1">Name is required</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Name (Uzbek)</label>
                  <input type="text" formControlName="name_uz" placeholder="Product name in Uzbek"
                         class="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Description (Russian)</label>
                <textarea formControlName="description_ru" rows="3" placeholder="Product description in Russian"
                          class="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Description (Uzbek)</label>
                <textarea formControlName="description_uz" rows="3" placeholder="Product description in Uzbek"
                          class="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"></textarea>
              </div>
            </div>
          </div>

          <!-- Pricing & Category -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-700">
              <h2 class="font-semibold text-white">Pricing & Category</h2>
            </div>
            <div class="p-5 space-y-4">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Price (UZS) <span class="text-red-400">*</span></label>
                  <div class="relative">
                    <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">UZS</span>
                    <input type="number" formControlName="price" placeholder="1000000"
                           class="w-full bg-gray-700 border text-white text-sm rounded-lg pl-12 pr-3.5 py-2.5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                           [ngClass]="form.get('price')?.invalid && form.get('price')?.touched ? 'border-red-500' : 'border-gray-600'">
                  </div>
                  @if (form.get('price')?.hasError('required') && form.get('price')?.touched) {
                    <p class="text-xs text-red-400 mt-1">Price is required</p>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1.5">Old Price (UZS)</label>
                  <div class="relative">
                    <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">UZS</span>
                    <input type="number" formControlName="old_price" placeholder="Optional — leave empty if no discount"
                           class="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg pl-12 pr-3.5 py-2.5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-300 mb-1.5">Category <span class="text-red-400">*</span></label>
                <select formControlName="category"
                        class="w-full bg-gray-700 border text-white text-sm rounded-lg px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        [ngClass]="form.get('category')?.invalid && form.get('category')?.touched ? 'border-red-500' : 'border-gray-600'">
                  <option value="">Select a category</option>
                  @for (cat of categories; track cat) {
                    <option [value]="cat">{{ cat }}</option>
                  }
                </select>
                @if (form.get('category')?.hasError('required') && form.get('category')?.touched) {
                  <p class="text-xs text-red-400 mt-1">Category is required</p>
                }
              </div>

              <div class="flex flex-wrap gap-5">
                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" formControlName="in_stock"
                         class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2">
                  <span class="text-sm text-gray-300">In Stock</span>
                </label>
                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" formControlName="featured"
                         class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2">
                  <span class="text-sm text-gray-300">Featured</span>
                </label>
                <label class="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" formControlName="is_new"
                         class="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2">
                  <span class="text-sm text-gray-300">New</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Images -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-700">
              <h2 class="font-semibold text-white">Images</h2>
              <p class="text-gray-500 text-xs mt-0.5">Upload images or paste URLs</p>
            </div>
            <div class="p-5 space-y-3">

              <input #fileInput type="file" accept="image/*" multiple class="hidden" (change)="onFilesSelected($event)">

              @if (imagesArray.controls.length > 0) {
                <div class="flex flex-wrap gap-3">
                  @for (imageCtrl of imagesArray.controls; track $index) {
                    @if (imageCtrl.value) {
                      <div class="relative group">
                        <img [src]="imageCtrl.value" alt="preview"
                             class="w-24 h-24 object-cover rounded-lg border border-gray-600">
                        <button type="button" (click)="removeImage($index)"
                                class="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transition-colors">
                          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    }
                  }
                </div>
              }

              @if (isUploading()) {
                <div class="space-y-1.5">
                  <div class="w-full bg-gray-700 rounded-full h-1.5">
                    <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                         [style.width]="uploadProgress() + '%'"></div>
                  </div>
                  <p class="text-xs text-gray-500">Uploading... {{ uploadProgress() }}%</p>
                </div>
              }

              <div class="flex gap-2.5 pt-1">
                <button type="button" (click)="fileInput.click()" [disabled]="isUploading()"
                        class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  Upload from PC
                </button>
              </div>
            </div>
          </div>

          <!-- Specifications -->
          <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-700">
              <h2 class="font-semibold text-white">Specifications</h2>
              <p class="text-gray-500 text-xs mt-0.5">Technical details shown on the product page</p>
            </div>
            <div class="p-5 space-y-3">
              <div formArrayName="specs" class="space-y-2.5">
                @for (specGroup of specsArray.controls; track $index) {
                  <div [formGroupName]="$index" class="flex gap-2.5 items-center">
                    <input type="text" formControlName="key" placeholder="Property (e.g. Sensor)"
                           class="flex-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                    <input type="text" formControlName="value" placeholder="Value (e.g. HERO 25K)"
                           class="flex-1 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3.5 py-2.5 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors">
                    <button type="button" (click)="removeSpec($index)"
                            class="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors flex-shrink-0">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                }
              </div>
              <button type="button" (click)="addSpec()"
                      class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Add Specification
              </button>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-3 py-2">
            <a routerLink="/admin/products"
               class="px-5 py-2.5 text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors">
              Cancel
            </a>
            <button type="submit" [disabled]="isSaving() || form.invalid"
                    class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors">
              @if (isSaving()) {
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        [attr.d]="isEditMode() ? 'M5 13l4 4L19 7' : 'M12 4v16m8-8H4'"/>
                </svg>
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

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor() {
    this.form = this.fb.group({
      slug: [''],
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

        if (product.images?.length) {
          product.images.forEach(url => this.addImage(url));
        }

        if (product.specs) {
          Object.entries(product.specs).forEach(([key, value]) => this.addSpec(key, value));
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

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  sanitizeSlugField(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pos = input.selectionStart ?? input.value.length;
    const slug = this.toSlug(input.value);
    this.form.get('slug')?.setValue(slug, { emitEvent: false });
    input.value = slug;
    input.setSelectionRange(pos, pos);
  }

  autoSlug(event: Event): void {
    if (this.isEditMode()) return;
    const name = (event.target as HTMLInputElement).value;
    this.form.get('slug')?.setValue(this.toSlug(name), { emitEvent: false });
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

    const uploadPromises = fileArray.map(file =>
      this.uploadFile(file).then(url => {
        completedCount++;
        this.uploadProgress.set(Math.round((completedCount / totalFiles) * 100));
        return url;
      })
    );

    Promise.all(uploadPromises)
      .then(urls => {
        urls.forEach(url => { if (url) this.addImage(url); });
      })
      .catch(() => alert('Failed to upload some images'))
      .finally(() => {
        this.isUploading.set(false);
        if (this.fileInput) this.fileInput.nativeElement.value = '';
      });
  }

  private uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('image', file);
    return new Promise((resolve, reject) => {
      this.http.post<{ success: boolean; image: { url: string } }>('/api/admin/upload-image', formData)
        .subscribe({
          next: (res) => resolve(res.image?.url || null),
          error: (err) => reject(err)
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
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.form.value;

    const specs: Record<string, string> = {};
    formValue.specs.forEach((spec: { key: string; value: string }) => {
      if (spec.key && spec.value) specs[spec.key] = spec.value;
    });

    const slug = this.isEditMode() && formValue.slug
      ? formValue.slug
      : this.toSlug(formValue.name_ru);

    const data: ProductFormData = {
      slug,
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
        this.router.navigate(['/admin/products']);
      },
      error: (error) => {
        this.isSaving.set(false);
        alert(error.error?.error || 'Failed to save product');
      }
    });
  }
}
