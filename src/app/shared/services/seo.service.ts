import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishDate?: string;
  modifiedDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);

  private readonly defaultConfig = {
    title: 'GGPoint - Computer Accessories Store',
    description: 'Modern computer accessories and gadgets store in Uzbekistan. Find the best quality products for your setup.',
    keywords: 'computer, accessories, gadgets, Uzbekistan, gaming, peripherals',
    image: '/assets/images/og-image.jpg',
    type: 'website'
  };

  updateMetaTags(config: SEOConfig): void {
    const seoConfig = { ...this.defaultConfig, ...config };
    const url = seoConfig.url || `https://ggpoint.uz${this.router.url}`;

    // Set title
    this.title.setTitle(seoConfig.title!);

    // Set basic meta tags
    this.meta.updateTag({ name: 'description', content: seoConfig.description! });
    this.meta.updateTag({ name: 'keywords', content: seoConfig.keywords! });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: seoConfig.title! });
    this.meta.updateTag({ property: 'og:description', content: seoConfig.description! });
    this.meta.updateTag({ property: 'og:type', content: seoConfig.type! });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: seoConfig.image! });

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seoConfig.title! });
    this.meta.updateTag({ name: 'twitter:description', content: seoConfig.description! });
    this.meta.updateTag({ name: 'twitter:image', content: seoConfig.image! });

    // Article specific tags
    if (seoConfig.type === 'article') {
      if (seoConfig.author) {
        this.meta.updateTag({ property: 'article:author', content: seoConfig.author });
      }
      if (seoConfig.publishDate) {
        this.meta.updateTag({ property: 'article:published_time', content: seoConfig.publishDate });
      }
      if (seoConfig.modifiedDate) {
        this.meta.updateTag({ property: 'article:modified_time', content: seoConfig.modifiedDate });
      }
    }
  }

  generateStructuredData(type: string, data: any): string {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    };
    return JSON.stringify(structuredData);
  }
}
