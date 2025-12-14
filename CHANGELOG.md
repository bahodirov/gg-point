# Changelog

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
