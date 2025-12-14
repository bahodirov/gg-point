import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MarkdownModule } from 'ngx-markdown';
import { TranslateModule } from '@ngx-translate/core';
import { BlogCardComponent } from '../../shared/components/blog-card/blog-card.component';
import { TelegramButtonComponent } from '../../shared/components/telegram-button/telegram-button.component';
import { BlogService } from '../../shared/services/blog.service';
import { SeoService } from '../../shared/services/seo.service';
import { BlogPost } from '../../shared/models/blog.model';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MarkdownModule,
    TranslateModule,
    BlogCardComponent,
    TelegramButtonComponent
  ],
  template: `
    @if (post()) {
      <article class="blog-post-page bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
        <div class="container mx-auto px-4">
          <!-- Breadcrumb -->
          <nav class="mb-6 text-sm">
            <a routerLink="/" class="text-primary-600 dark:text-primary-400 hover:underline">
              {{ 'header.home' | translate }}
            </a>
            <span class="mx-2 text-gray-500">/</span>
            <a routerLink="/blog" class="text-primary-600 dark:text-primary-400 hover:underline">
              {{ 'header.blog' | translate }}
            </a>
            <span class="mx-2 text-gray-500">/</span>
            <span class="text-gray-600 dark:text-gray-400">{{ getPostTitle() }}</span>
          </nav>

          <!-- Post Header -->
          <header class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <!-- Featured Image -->
            <div class="mb-6 rounded-lg overflow-hidden">
              <img [src]="post()!.thumbnail" 
                   [alt]="getPostTitle()"
                   class="w-full h-96 object-cover">
            </div>

            <!-- Category and Date -->
            <div class="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div class="flex items-center space-x-4">
                <mat-chip>{{ post()!.category }}</mat-chip>
                <span class="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <mat-icon class="mr-1 text-base">schedule</mat-icon>
                  {{ post()!.readTime }} min read
                </span>
              </div>
              <div class="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span class="flex items-center">
                  <mat-icon class="mr-1 text-base">person</mat-icon>
                  {{ post()!.author }}
                </span>
                <span class="flex items-center">
                  <mat-icon class="mr-1 text-base">calendar_today</mat-icon>
                  {{ post()!.publishDate | date:'MMMM d, yyyy' }}
                </span>
              </div>
            </div>

            <!-- Title -->
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {{ getPostTitle() }}
            </h1>

            <!-- Excerpt -->
            <p class="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ getPostExcerpt() }}
            </p>

            <!-- Tags -->
            @if (post()!.tags.length > 0) {
              <div class="flex flex-wrap gap-2 mt-6">
                @for (tag of post()!.tags; track tag) {
                  <mat-chip class="text-xs">#{{ tag }}</mat-chip>
                }
              </div>
            }

            <!-- Share Buttons -->
            <mat-divider class="my-6"></mat-divider>
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Share this post
              </span>
              <div class="flex space-x-2">
                <button mat-icon-button 
                        [attr.aria-label]="'Share on Telegram'"
                        (click)="shareOnTelegram()">
                  <mat-icon>send</mat-icon>
                </button>
                <button mat-icon-button 
                        [attr.aria-label]="'Share on Facebook'"
                        (click)="shareOnFacebook()">
                  <mat-icon>facebook</mat-icon>
                </button>
                <button mat-icon-button 
                        [attr.aria-label]="'Copy link'"
                        (click)="copyLink()">
                  <mat-icon>link</mat-icon>
                </button>
              </div>
            </div>
          </header>

          <!-- Post Content -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <div class="prose dark:prose-invert max-w-none">
              <markdown [data]="getPostContent()"></markdown>
            </div>
          </div>

          <!-- Related Posts -->
          @if (relatedPosts().length > 0) {
            <section class="mb-8">
              <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Related Posts
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (relatedPost of relatedPosts(); track relatedPost.id) {
                  <app-blog-card [post]="relatedPost"></app-blog-card>
                }
              </div>
            </section>
          }
        </div>

        <!-- Floating Telegram Button -->
        <app-telegram-button [floating]="true"></app-telegram-button>
      </article>
    } @else {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <mat-icon class="text-6xl text-gray-400 mb-4">error_outline</mat-icon>
          <p class="text-xl text-gray-600 dark:text-gray-400">Blog post not found</p>
          <button mat-raised-button color="primary" routerLink="/blog" class="mt-4">
            Back to Blog
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .prose {
      color: inherit;
    }

    :host ::ng-deep .prose h1,
    :host ::ng-deep .prose h2,
    :host ::ng-deep .prose h3 {
      color: inherit;
      font-weight: 600;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }

    :host ::ng-deep .prose p {
      margin-bottom: 1em;
      line-height: 1.75;
    }

    :host ::ng-deep .prose a {
      color: #0ea5e9;
      text-decoration: underline;
    }

    :host ::ng-deep .prose code {
      background-color: rgba(14, 165, 233, 0.1);
      padding: 0.2em 0.4em;
      border-radius: 0.25em;
      font-size: 0.875em;
    }

    :host ::ng-deep .prose ul,
    :host ::ng-deep .prose ol {
      margin-left: 1.5em;
      margin-bottom: 1em;
    }

    :host ::ng-deep .mat-mdc-chip {
      font-size: 0.875rem !important;
    }
  `]
})
export class BlogPostComponent implements OnInit {
  private blogService = inject(BlogService);
  private seoService = inject(SeoService);
  private route = inject(ActivatedRoute);

  post = signal<BlogPost | null>(null);
  relatedPosts = signal<BlogPost[]>([]);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.loadPost(slug);
    });
  }

  private loadPost(slug: string): void {
    const post = this.blogService.getPostBySlug(slug);
    if (post) {
      this.post.set(post);
      this.relatedPosts.set(this.blogService.getRelatedPosts(post.id, 3));
      this.updateSEO(post);
    }
  }

  getPostTitle(): string {
    const p = this.post();
    if (!p) return '';
    return p.title;
  }

  getPostExcerpt(): string {
    const p = this.post();
    if (!p) return '';
    return p.excerpt;
  }

  getPostContent(): string {
    const p = this.post();
    if (!p) return '';
    return p.content;
  }

  shareOnTelegram(): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(this.getPostTitle());
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  }

  shareOnFacebook(): void {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href);
    // You could add a snackbar notification here
    alert('Link copied to clipboard!');
  }

  private updateSEO(post: BlogPost): void {
    const currentUrl = `https://ggpoint.uz/blog/${post.slug}`;
    
    // Update meta tags
    this.seoService.updateMetaTags({
      title: `${post.title} - GGPoint Blog | Computer Accessories Guide`,
      description: post.excerpt,
      keywords: `${post.tags.join(', ')}, computer accessories, gaming guide, tech blog, GGPoint`,
      image: post.thumbnail,
      type: 'article',
      author: post.author,
      publishDate: new Date(post.publishDate).toISOString(),
      canonical: currentUrl,
      languageAlternates: [
        { lang: 'en', url: currentUrl },
        { lang: 'ru', url: currentUrl },
        { lang: 'uz', url: currentUrl }
      ]
    });

    // Add Article Schema
    const articleSchema = this.seoService.generateArticleSchema({
      title: post.title,
      description: post.excerpt,
      image: post.thumbnail,
      publishDate: new Date(post.publishDate).toISOString()
    });
    this.seoService.addStructuredData(articleSchema, 'article-schema');

    // Add Breadcrumb Schema
    const breadcrumbSchema = this.seoService.generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Blog', url: '/blog' },
      { name: post.title }
    ]);
    this.seoService.addStructuredData(breadcrumbSchema, 'breadcrumb-schema');
  }
}
