import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { BlogPost } from '../../models/blog.model';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    TranslateModule
  ],
  template: `
    <mat-card class="blog-card h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
      <!-- Pinned Badge -->
      @if (post.pinned) {
        <div class="absolute top-2 right-2 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold z-10 flex items-center">
          <mat-icon class="text-sm mr-1">push_pin</mat-icon>
          {{ 'home.featured' | translate }}
        </div>
      }

      <!-- Blog Image -->
      <div class="relative overflow-hidden bg-gray-100 dark:bg-gray-800 rounded-t-lg cursor-pointer"
           [routerLink]="['/blog', post.slug]">
        <img [src]="post.thumbnail" 
             [alt]="post.title"
             class="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
             loading="lazy">
      </div>

      <mat-card-content class="flex-1 flex flex-col p-4">
        <!-- Category and Read Time -->
        <div class="flex items-center justify-between mb-2">
          <mat-chip class="text-xs">{{ post.category }}</mat-chip>
          <span class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <mat-icon class="text-sm mr-1">schedule</mat-icon>
            {{ post.readTime }} {{ 'blog.readTime' | translate }}
          </span>
        </div>

        <!-- Post Title -->
        <h3 class="text-lg font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
            [routerLink]="['/blog', post.slug]">
          {{ post.title }}
        </h3>

        <!-- Excerpt -->
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
          {{ post.excerpt }}
        </p>

        <!-- Meta Information -->
        <div class="flex items-center justify-between mt-auto">
          <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <mat-icon class="text-sm mr-1">person</mat-icon>
            <span>{{ post.author }}</span>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ post.publishDate | date:'MMM d, yyyy' }}
          </div>
        </div>

        <!-- Action Button -->
        <button mat-raised-button 
                color="primary" 
                class="w-full mt-4"
                [routerLink]="['/blog', post.slug]">
          {{ 'blog.readMore' | translate }}
        </button>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .blog-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    :host ::ng-deep .mat-mdc-card {
      border-radius: 12px !important;
    }

    :host ::ng-deep .mat-mdc-chip {
      font-size: 0.75rem !important;
      height: 24px !important;
    }

    :host ::ng-deep mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
  `]
})
export class BlogCardComponent {
  @Input({ required: true }) post!: BlogPost;
}
