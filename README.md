# GGPoint - Computer Accessories Store

A modern, lightweight ecommerce catalog website built with Angular 20 featuring Server-Side Rendering (SSR), bilingual support (Russian/Uzbek), and a beautiful, mobile-responsive UI.

## 🚀 Features

- **Server-Side Rendering (SSR)** - Optimal SEO and fast initial page load
- **Bilingual Support** - Russian and Uzbek translations with easy language switching
- **Dark/Light Theme** - User preference with system detection
- **Modern UI** - Built with Angular Material and Tailwind CSS
- **Mobile Responsive** - Fully optimized for all screen sizes
- **Product Catalog** - Advanced filtering and sorting capabilities
- **Blog System** - Markdown-based blog with categories and tags
- **Telegram Integration** - Quick order placement via Telegram bot
- **SEO Optimized** - Schema.org markup, OG tags, sitemap, robots.txt

## 📋 Tech Stack

- **Framework**: Angular 20 with SSR (Angular Universal)
- **UI Library**: Angular Material + Tailwind CSS
- **Language**: TypeScript
- **Internationalization**: @ngx-translate/core
- **Markdown**: ngx-markdown
- **Build**: Angular CLI
- **Styling**: SCSS + Tailwind CSS

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ggpoint
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Run development server**
   ```bash
   npm start
   ```
   
   Navigate to `http://localhost:4200/`

## 📦 Build

### Development Build
```bash
npm run build
```

### Production Build with SSR
```bash
npm run build:ssr
```

This creates:
- Browser bundle in `dist/ggpoint/browser/`
- Server bundle in `dist/ggpoint/server/`

## 🚀 Deployment

### Serve SSR Application Locally
```bash
npm run serve:ssr:ggpoint
```

The application will be available at `http://localhost:4000/`

### Deploy to Production

#### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

#### Option 2: Firebase Hosting
1. Install Firebase CLI: `npm i -g firebase-tools`
2. Initialize: `firebase init hosting`
3. Deploy: `firebase deploy`

#### Option 3: Any Node.js Hosting
1. Build the SSR app: `npm run build:ssr`
2. Upload the `dist/ggpoint` folder to your server
3. Run: `node dist/ggpoint/server/server.mjs`

## 📁 Project Structure

```
ggpoint/
├── src/
│   ├── app/
│   │   ├── pages/                 # Page components
│   │   │   ├── home/
│   │   │   ├── catalog/
│   │   │   ├── blog/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   └── faq/
│   │   ├── shared/
│   │   │   ├── components/        # Reusable components
│   │   │   ├── services/          # Business logic services
│   │   │   └── models/            # TypeScript interfaces
│   │   ├── core/
│   │   │   └── services/          # Core services (theme, translation)
│   │   ├── app.ts                 # Main app component
│   │   ├── app.routes.ts          # Routing configuration
│   │   └── app.config.ts          # App providers
│   ├── assets/
│   │   ├── i18n/                  # Translation files
│   │   ├── data/                  # JSON data (products, blogs)
│   │   └── images/                # Images
│   ├── styles/
│   │   ├── styles.scss            # Global styles
│   │   └── material-theme.scss    # Material theme
│   └── server.ts                  # SSR server entry
├── public/
│   ├── robots.txt                 # SEO robots file
│   └── sitemap.xml                # SEO sitemap
└── tailwind.config.js             # Tailwind configuration
```

## 🎨 Customization

### Adding Products

Edit `src/assets/data/products.json`:

```json
{
  "products": [
    {
      "id": "prod-001",
      "name": "Product Name",
      "category": "Category",
      "price": 1000000,
      "description": "Product description",
      "images": ["image-url"],
      "thumbnail": "thumbnail-url",
      "inStock": true,
      "featured": false,
      "tags": ["tag1", "tag2"],
      "specifications": [
        { "key": "Spec", "value": "Value" }
      ]
    }
  ]
}
```

### Adding Blog Posts

Edit `src/assets/data/blog-posts.json`:

```json
{
  "posts": [
    {
      "id": "post-001",
      "title": "Post Title",
      "slug": "post-slug",
      "excerpt": "Short description",
      "content": "# Markdown Content",
      "author": "Author Name",
      "publishDate": "2024-12-01T00:00:00Z",
      "thumbnail": "image-url",
      "category": "Category",
      "tags": ["tag1", "tag2"],
      "readTime": 5,
      "pinned": false
    }
  ]
}
```

### Updating Translations

Edit files in `src/assets/i18n/`:
- `ru.json` - Russian translations
- `uz.json` - Uzbek translations

### Customizing Theme

Edit `src/styles/material-theme.scss` to change Material Design colors.

Edit `tailwind.config.js` to customize Tailwind utilities.

## 🔧 Configuration

### Telegram Bot

Update the bot username in:
- `src/app/shared/components/telegram-button/telegram-button.component.ts`
- `src/app/pages/catalog/product-detail.component.ts`

Replace `ggpoint_bot` with your actual Telegram bot username.

### SEO Settings

Update meta tags in:
- `src/app/shared/services/seo.service.ts`

Update sitemap in:
- `public/sitemap.xml`

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📱 Mobile Responsiveness

The application is fully responsive and tested on:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1440px
- Wide: 1441px+

## ♿ Accessibility

- WCAG 2.1 Level AA compliant
- Keyboard navigation support
- Screen reader friendly
- Proper ARIA labels

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

Developed by the GGPoint team.

## 📞 Support

For support, email info@gg-point.uz or join our Telegram channel.

---

**Last Updated:** December 13, 2025  
**Version:** 1.0.0
