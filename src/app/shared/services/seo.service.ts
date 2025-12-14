import { Injectable, inject, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
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
  canonical?: string;
  robots?: string;
  languageAlternates?: { lang: string; url: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private title = inject(Title);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private isBrowser: boolean;

  private readonly defaultConfig = {
    title: 'GGPoint - Computer Accessories Store',
    description: 'Modern computer accessories and gadgets store in Uzbekistan. Find the best quality products for your setup.',
    keywords: 'computer, accessories, gadgets, Uzbekistan, gaming, peripherals, компьютерные аксессуары, игровые устройства',
    image: 'https://ggpoint.uz/assets/images/og-image.png',
    type: 'website',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  };

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  updateMetaTags(config: SEOConfig): void {
    const seoConfig = { ...this.defaultConfig, ...config };
    const url = seoConfig.canonical || seoConfig.url || `https://ggpoint.uz${this.router.url}`;

    // Set title
    this.title.setTitle(seoConfig.title!);

    // Set basic meta tags
    this.meta.updateTag({ name: 'description', content: seoConfig.description! });
    this.meta.updateTag({ name: 'keywords', content: seoConfig.keywords! });
    this.meta.updateTag({ name: 'robots', content: seoConfig.robots! });
    this.meta.updateTag({ name: 'author', content: 'GGPoint' });

    // Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: seoConfig.title! });
    this.meta.updateTag({ property: 'og:description', content: seoConfig.description! });
    this.meta.updateTag({ property: 'og:type', content: seoConfig.type! });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: seoConfig.image! });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:site_name', content: 'GGPoint' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seoConfig.title! });
    this.meta.updateTag({ name: 'twitter:description', content: seoConfig.description! });
    this.meta.updateTag({ name: 'twitter:image', content: seoConfig.image! });

    // Canonical URL
    this.setCanonicalURL(url);

    // Language alternates
    if (seoConfig.languageAlternates) {
      this.setLanguageAlternates(seoConfig.languageAlternates);
    }

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

  setCanonicalURL(url: string): void {
    if (!this.isBrowser) return;

    // Remove existing canonical link
    const existingLink = this.document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Add new canonical link
    const link: HTMLLinkElement = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    this.document.head.appendChild(link);
  }

  setLanguageAlternates(alternates: { lang: string; url: string }[]): void {
    if (!this.isBrowser) return;

    // Remove existing alternate links
    const existingLinks = this.document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingLinks.forEach(link => link.remove());

    // Add new alternate links
    alternates.forEach(alternate => {
      const link: HTMLLinkElement = this.document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', alternate.lang);
      link.setAttribute('href', alternate.url);
      this.document.head.appendChild(link);
    });
  }

  addStructuredData(data: any, id?: string): void {
    if (!this.isBrowser) return;

    const scriptId = id || `structured-data-${Date.now()}`;
    
    // Remove existing script with same id
    const existingScript = this.document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  removeStructuredData(id: string): void {
    if (!this.isBrowser) return;

    const script = this.document.getElementById(id);
    if (script) {
      script.remove();
    }
  }

  generateProductSchema(product: any): any {
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: product.images || [product.thumbnail],
      description: product.description,
      brand: {
        '@type': 'Brand',
        name: product.brand || 'GGPoint'
      },
      offers: {
        '@type': 'Offer',
        url: `https://ggpoint.uz/catalog/${product.id}`,
        priceCurrency: 'UZS',
        price: product.price.toString(),
        priceValidUntil: '2026-12-31',
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.inStock 
          ? 'https://schema.org/InStock' 
          : 'https://schema.org/OutOfStock'
      },
      aggregateRating: product.rating ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toString(),
        reviewCount: product.reviewCount?.toString() || '1'
      } : undefined
    };
  }

  generateOrganizationSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'GGPoint',
      url: 'https://ggpoint.uz',
      logo: 'https://ggpoint.uz/assets/images/logo.png',
      description: 'Modern computer accessories and gadgets store in Uzbekistan',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'UZ',
        addressRegion: 'Tashkent',
        addressLocality: 'Tashkent'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['English', 'Russian', 'Uzbek']
      },
      sameAs: [
        'https://t.me/ggpoint_bot'
      ]
    };
  }

  generateLocalBusinessSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: 'GGPoint',
      description: 'Premium computer accessories and gaming peripherals store in Tashkent, Uzbekistan',
      url: 'https://ggpoint.uz',
      telephone: '+998-XX-XXX-XXXX',
      email: 'info@ggpoint.uz',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Tashkent',
        addressLocality: 'Tashkent',
        addressRegion: 'Tashkent',
        addressCountry: 'UZ'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 41.2995,
        longitude: 69.2401
      },
      priceRange: '$$',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '09:00',
          closes: '21:00'
        }
      ],
      paymentAccepted: 'Cash, Credit Card, Online Payment',
      currenciesAccepted: 'UZS',
      areaServed: {
        '@type': 'City',
        name: 'Tashkent'
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Computer Accessories',
        itemListElement: [
          {
            '@type': 'OfferCatalog',
            name: 'Gaming Peripherals',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Gaming Mice' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Gaming Keyboards' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Gaming Headsets' } }
            ]
          },
          {
            '@type': 'OfferCatalog',
            name: 'Monitors',
            itemListElement: [
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Gaming Monitors' } },
              { '@type': 'Offer', itemOffered: { '@type': 'Product', name: '4K Monitors' } }
            ]
          }
        ]
      }
    };
  }

  generateWebSiteSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'GGPoint',
      url: 'https://ggpoint.uz',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://ggpoint.uz/catalog?search={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    };
  }

  generateBreadcrumbSchema(items: { name: string; url?: string }[]): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url ? `https://ggpoint.uz${item.url}` : undefined
      }))
    };
  }

  generateArticleSchema(article: any): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: article.image,
      author: {
        '@type': 'Organization',
        name: 'GGPoint'
      },
      publisher: {
        '@type': 'Organization',
        name: 'GGPoint',
        logo: {
          '@type': 'ImageObject',
          url: 'https://ggpoint.uz/assets/images/logo.png'
        }
      },
      datePublished: article.publishDate,
      dateModified: article.modifiedDate || article.publishDate
    };
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
