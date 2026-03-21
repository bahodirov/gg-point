# Changelog

## [1.2.0] - 2026-03-22

### ✨ Admin Panel — Full Redesign (Flowbite style)

#### UI
- Replaced Angular Material with pure Tailwind CSS throughout the entire admin panel
- New fixed sidebar with logo, nav icons, user info and logout at the bottom
- Flowbite-style dark theme: `gray-900` sidebar, `gray-800` cards, `gray-950` background
- Responsive mobile sidebar with overlay

#### Dashboard
- Stat cards with colored icons (blue, yellow, red, purple)
- Category breakdown with progress bars
- Quick action buttons

#### Product List
- Native HTML table replacing `mat-table`
- Client-side search, sort (by name/category/price), and pagination — no Angular Material dependencies
- Category filter dropdown
- Inline delete confirmation modal (replaces `MatDialog`)
- Status badges: In Stock / Out of Stock / Featured / New

#### Product Form
- Slug field removed from UI — auto-generated from product name on submit
- Image upload only (URL input removed), uploaded images shown as thumbnail grid with remove button
- Native HTML inputs, selects, and checkboxes styled with Tailwind

#### Auth Guard Fix
- Refresh no longer redirects to login — guard now waits for session check to complete using `toObservable`

---

## [1.1.0] - 2025-12-14

### ✨ Added - Complete i18n Implementation

#### Core Features
- **@ngx-translate/core** and **@ngx-translate/http-loader** integration
- Complete bilingual support (Russian/Uzbek)
- Language switcher with dropdown menu in header
- Persistent language preference using localStorage
- Browser language detection
- SSR-compatible translation implementation

#### New Services
- `LanguageService` - Centralized translation management
  - Reactive language state using Angular signals
  - Type-safe language operations
  - Platform-aware (SSR/browser) implementation

#### New Configuration
- `CustomTranslateHttpLoader` - HTTP loader for translation files
- Translation module configuration in app providers
- Translation config file with factory function

#### Translation Coverage
- ✅ All 13 components fully translated
- ✅ All 7 pages fully translated
- ✅ 110+ translation keys implemented
- ✅ Both RU and UZ languages complete

#### Documentation
- `TRANSLATION_IMPLEMENTATION.md` - Comprehensive implementation guide
- `README_TRANSLATION.md` - Quick start guide for developers
- Updated `PROJECT_SUMMARY.md` with translation details
- Updated `project_plan.md` with completed checkboxes

### 🔧 Fixed
- TranslateHttpLoader constructor compatibility issues
- Telegram button undefined text handling
- SSR platform detection for localStorage

### 📝 Changed
- All component templates now use translation pipes
- Header component includes language switcher
- Footer, product cards, blog cards all translated
- All page components support multiple languages

### 🎨 UI/UX Improvements
- Language selector with checkmark for active language
- Smooth language switching without page reload
- Persistent user language preference

---

## [1.0.0] - 2025-12-13

### Initial Release
- Complete Angular 20 + SSR website
- Tailwind CSS + Angular Material
- Dark/Light theme support
- 7 pages: Home, Catalog, Product Detail, Blog, About, Contact, FAQ
- 13 components with responsive design
- SEO optimization
- Telegram integration
- Sample products and blog posts
