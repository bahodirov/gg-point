# Project Plan: Website for a Computer Accessories Store

## 1. Goals and Scope
- Build a modern, high-performance, SEO-friendly **catalog website** (no checkout) to showcase computer gadgets in Uzbekistan.
- Provide intuitive navigation, bilingual support (RU/UZ), and fast loading on mobile devices.
- Users place orders via a Telegram deep-link; no on-site payments, cart, or account system are required.
- **Use SSR (Server-Side Rendering)** for optimal SEO and search engine indexing.

## 2. Technology Stack Selection
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Static HTML/CSS/JS | Simplicity, low entry barrier | Harder to scale, manual content management, poor SEO | |
| Next.js (React) | Great SSR support, large ecosystem | React learning curve | |
| **Angular with SSR (Angular Universal)** | Enterprise-grade, built-in SSR, TypeScript-first, excellent SEO, mature ecosystem | Steeper learning curve, larger bundle size | **✅ Chosen** |
| Nuxt 3 (Vue 3) | File-based routing, great SEO | Different framework | |

### UI Component Library
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **Angular Material** | Official Google design system, comprehensive components, excellent a11y, SSR compatible | Material Design style (can be customized) | **✅ Chosen** |
| PrimeNG | Very mature, many components, free themes | Heavier bundle, less modern styling | |
| ng-bootstrap | Bootstrap 5 components | Bootstrap dependency | |
| NG-ZORRO | Ant Design system, feature-rich | Chinese documentation focus | |

## 3. Main Deliverables
1. Git repository with source code.
2. Complete project folder structure.
3. Ready-made pages and components according to the requirements.
4. Sample product data (JSON) and 3 blog posts.
5. Optimized images (lazy-loading, WebP).
6. `robots.txt`, `sitemap.xml`, and Schema.org markup.
7. Deployment and content-management instructions.

## 4. Phases & Timeline (6-week schedule)
| Week | Phase | Key Tasks | Responsible |
|------|-------|----------|-------------|
| 1 | Initialization | • Create repo, set up **Angular** with SSR enabled <br>• Configure ESLint/Prettier <br>• Base folder structure <br>• Install Tailwind CSS + **Angular Material** | Dev |
| 2 | Global UI | • Header, Footer, Theme toggle <br>• Layout with i18n (`@ngx-translate/core`) <br>• Dark/light theme with Angular Material theming | Dev |
| 3 | Catalog & Products | • Product JSON schema <br>• Catalog pages per category <br>• Simple filters (category, price range) <br>• Product Card component, Quick View Dialog | Dev |
| 4 | Blog Pages | • Markdown support with `ngx-markdown` or Scully <br>• Listing & Single post pages <br>• TOC, share buttons | Dev |
| 5 | SEO & Performance | • Schema.org, OG tags with Angular Meta service <br>• Sitemap/robots with `@angular/ssr` <br>• Image lazy loading (Angular built-in) <br>• Lighthouse audit | Dev |
| 6 | Testing & Release | • Manual QA (mobile/desktop) <br>• "Add product/post" docs <br>• Build SSR app and deploy to Vercel/Firebase/Cloud Run | Dev |

## 5. Folder Structure
```
.
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── home/
│   │   │   │   └── home.component.ts       # Home page
│   │   │   ├── catalog/
│   │   │   │   ├── catalog-list.component.ts
│   │   │   │   └── product-detail.component.ts
│   │   │   ├── blog/
│   │   │   │   ├── blog-list.component.ts
│   │   │   │   └── blog-post.component.ts
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── faq/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── header/
│   │   │   │   ├── footer/
│   │   │   │   ├── product-card/
│   │   │   │   ├── blog-card/
│   │   │   │   └── telegram-button/
│   │   │   ├── services/
│   │   │   │   ├── product.service.ts
│   │   │   │   ├── blog.service.ts
│   │   │   │   └── seo.service.ts
│   │   │   └── models/
│   │   │       ├── product.model.ts
│   │   │       └── blog.model.ts
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   └── theme.service.ts
│   │   │   └── interceptors/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts           # Angular routing
│   │   └── app.config.ts
│   ├── assets/
│   │   ├── i18n/
│   │   │   ├── ru.json            # Russian translations
│   │   │   └── uz.json            # Uzbek translations
│   │   ├── blog/                  # Markdown blog posts
│   │   ├── data/
│   │   │   └── products.json      # Product catalog
│   │   └── images/
│   ├── styles/
│   │   ├── styles.scss            # Global styles + Tailwind
│   │   └── _material-theme.scss   # Angular Material custom theme
│   └── environments/
├── public/                        # Static assets (favicon, robots.txt)
├── server.ts                      # SSR server entry point
├── angular.json
├── tailwind.config.js
└── README.md
```

## 6. Detailed Task List
### 6.1 Global Infrastructure
- [ ] Initialize **Angular** project with `ng new --ssr` (enable SSR from the start)
- [ ] Install and configure Tailwind CSS (`ng add @angular/material`)
- [ ] Install **Angular Material** with `ng add @angular/material`
- [ ] Configure custom Material theme with Tailwind integration
- [ ] Set up language switcher (RU/UZ) using `@ngx-translate/core` with localStorage
- [ ] Implement dark/light mode service with Angular Material theming

### 6.2 UI Components
- [ ] Configure Angular Material modules: MatButton, MatCard, MatDialog, MatExpansionPanel, MatSelect, MatSidenav
- [ ] Header component (logo, nav, language selector, theme toggle, hamburger menu with MatSidenav)
- [ ] Footer component (links, contacts, socials, copyright)
- [ ] ProductCard component (using MatCard, badges, buttons)
- [ ] BlogCard component (MatCard with image, title, excerpt)
- [ ] Telegram Floating Button component (mobile, fixed position)

### 6.3 Pages
- [ ] Home: hero section, featured products, categories, blog preview
- [ ] Catalog: product grid by category, simple filters (MatSelect, pipes)
- [ ] Product Detail: image gallery, specs table, "Order via Telegram" button, related products
- [ ] Blog listing: search input, category filter, pinned post
- [ ] Blog post: TOC, share buttons, CTA banner, related posts
- [ ] About, Contact (reactive form with validation), FAQ (MatExpansionPanel)

### 6.4 Content & Data
- [ ] Create 15-20 sample products (JSON)
- [ ] Write 3 blog posts (Markdown with `ngx-markdown` or static JSON)
- [ ] Add placeholder images (unsplash.it or local)

### 6.5 SEO & Optimization
- [ ] Schema.org structured data for Organization, Product, BlogPosting, FAQPage
- [ ] Open Graph & Twitter Cards using Angular Meta and Title services
- [ ] Sitemap generation (manual or using `@angular/ssr` prerendering)
- [ ] robots.txt in public folder (allow all)
- [ ] Lighthouse ≥ 90 score on Mobile (SSR should help significantly)

### 6.6 Testing & Release
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Responsive checks 320-1440 px
- [ ] Telegram CTA verification (desktop/mobile)
- [ ] Deployment guide: Build SSR with `npm run build:ssr` and deploy to Vercel/Firebase/Cloud Run/Render

## 7. Resources & Dependencies
- **Angular 17+** (with SSR support via Angular Universal)
- **@angular/ssr** (Server-Side Rendering)
- **TypeScript** (Angular's primary language)
- **Tailwind CSS 3** (utility-first CSS framework)
- **@angular/material** (UI component library)
- **@angular/cdk** (Component Dev Kit, comes with Material)
- **@ngx-translate/core** (internationalization)
- **@ngx-translate/http-loader** (translation file loader)
- **ngx-markdown** (Markdown rendering for blog posts)
- **marked** (Markdown parser, dependency of ngx-markdown)
- **RxJS** (reactive programming, comes with Angular)
- **@angular/platform-server** (SSR platform)

## 8. Risks & Mitigation
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Content delays (photos, texts) | Medium | Medium | Use placeholders, prepare content in parallel |
| Slow mobile internet speeds | High | High | Lazy loading, image optimization, minification |
| Changes in Telegram policies | Low | Medium | Use `tg://` deep-link, review regularly |

## 9. Acceptance Criteria
- All pages match designs and are fully responsive.
- HTML5 validation and Lighthouse ≥ 90.
- Schema.org tests pass without errors.
- Order via Telegram works with pre-filled message.
- **SSR works correctly**: page source shows rendered content (verify with "View Page Source").
- **SEO meta tags** are correctly rendered on server side for all pages.
- Project builds and deploys successfully using `npm run build:ssr` without errors.

---
**Last updated:** 13 Dec 2025  
**Tech Stack:** Angular 17+ with SSR (Universal) + Tailwind CSS + Angular Material
