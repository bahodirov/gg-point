import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BlogCardComponent } from '../../shared/components/blog-card/blog-card.component';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { BlogService } from '../../shared/services/blog.service';
import { SeoService } from '../../shared/services/seo.service';
import { BlogPost } from '../../shared/models/blog.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TranslateModule,
    BlogCardComponent,
    TelegramButtonComponent
  ],
  template: `
    <div class="blog-list-page bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div class="container mx-auto px-4">
        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ 'blog.title' | translate }}
          </h1>
        </div>

        <!-- Search and Filter -->
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Search -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>{{ 'blog.search' | translate }}</mat-label>
              <input matInput 
                     [(ngModel)]="searchQuery" 
                     (ngModelChange)="applyFilters()"
                     [placeholder]="'blog.search' | translate">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <!-- Category Filter -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Category</mat-label>
              <mat-select [(value)]="selectedCategory" (selectionChange)="applyFilters()">
                <mat-option value="">All Categories</mat-option>
                @for (category of categories; track category.id) {
                  <mat-option [value]="category.slug">{{ category.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <!-- Results Count -->
        <div class="mb-6">
          <p class="text-gray-600 dark:text-gray-400">
            {{ filteredPosts().length }} articles
          </p>
        </div>

        <!-- Pinned Posts -->
        @if (pinnedPosts().length > 0 && !searchQuery && !selectedCategory) {
          <section class="mb-12">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              @for (post of pinnedPosts(); track post.id) {
                <app-blog-card [post]="post"></app-blog-card>
              }
            </div>
          </section>
        }

        <!-- Blog Posts Grid -->
        @if (filteredPosts().length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (post of filteredPosts(); track post.id) {
              <app-blog-card [post]="post"></app-blog-card>
            }
          </div>
        } @else {
          <div class="text-center py-16">
            <mat-icon class="text-6xl text-gray-400 mb-4">article</mat-icon>
            <p class="text-xl text-gray-600 dark:text-gray-400">No articles found</p>
          </div>
        }
      </div>

      <!-- Floating Telegram Button -->
      <app-telegram-button [floating]="true"></app-telegram-button>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
  `]
})
export class BlogListComponent implements OnInit {
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);

  allPosts: BlogPost[] = [];
  filteredPosts = signal<BlogPost[]>([]);
  pinnedPosts = signal<BlogPost[]>([]);
  categories: any[] = [];

  searchQuery: string = '';
  selectedCategory: string = '';

  ngOnInit(): void {
    this.loadData();
    this.updateSEO();
  }

  private loadData(): void {
    this.allPosts = this.blogService.posts();
    this.categories = this.blogService.categories();
    this.pinnedPosts.set(this.blogService.getPinnedPosts());
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allPosts];

    // Category filter
    if (this.selectedCategory) {
      filtered = this.blogService.getPostsByCategory(this.selectedCategory);
    }

    // Search filter
    if (this.searchQuery) {
      filtered = this.blogService.searchPosts(this.searchQuery);
    }

    // Remove pinned posts from regular list if no filters
    if (!this.searchQuery && !this.selectedCategory) {
      filtered = filtered.filter(p => !p.pinned);
    }

    this.filteredPosts.set(filtered);
  }

  private updateSEO(): void {
    this.seoService.updateMetaTags({
      title: 'Blog - GGPoint',
      description: 'Read the latest articles about computer accessories, gaming, and tech guides.',
      keywords: 'blog, articles, gaming, computer, guides',
      type: 'website'
    });
  }
}
