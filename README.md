# GGPoint - Computer Accessories Store

A modern, lightweight ecommerce catalog website built with Angular 20 featuring Server-Side Rendering (SSR), bilingual support (Russian/Uzbek), and a beautiful, mobile-responsive UI.

## 🚀 Features

### Frontend Features
- **Server-Side Rendering (SSR)** - Optimal SEO and fast initial page load
- **Bilingual Support** - Russian and Uzbek translations with easy language switching
- **Dark/Light Theme** - User preference with system detection
- **Modern UI** - Built with Angular Material and Tailwind CSS
- **Mobile Responsive** - Fully optimized for all screen sizes
- **Product Catalog** - Advanced filtering and sorting capabilities
- **Blog System** - Markdown-based blog with categories and tags
- **Telegram Integration** - Quick order placement via Telegram bot
- **SEO Optimized** - Schema.org markup, OG tags, sitemap, robots.txt

### Admin Panel Features
- **Product Management** - Create, edit, delete products with rich editor
- **Image Upload & Optimization** - Automatic WebP conversion and thumbnail generation
- **User Authentication** - Secure login with session management
- **Dashboard** - Overview of products and statistics
- **Responsive Admin UI** - Mobile-friendly admin interface

### Security Features
- **Rate Limiting** - Prevents brute force attacks (10 attempts/15min for auth)
- **Input Validation** - Server-side validation for all endpoints
- **XSS Protection** - Input sanitization and security headers
- **Password Requirements** - Strong password policy (12+ chars, mixed case, numbers, special chars)
- **CSRF Protection** - Secure session cookies with httpOnly and sameSite flags
- **SQL Injection Prevention** - Parameterized queries for all database operations
- **Security Headers** - Helmet.js for Content Security Policy, HSTS, etc.
- **Audit Logging** - Track all admin actions and security events

### Database Options
- **PostgreSQL** - Production-ready with connection pooling, transactions, and migrations
- **JSON Files** - Simple fallback for development (automatic)

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

### Database Configuration

The application supports two storage options:
1. **JSON Files** (default, no setup required)
2. **PostgreSQL** (recommended for production)

#### Using PostgreSQL (Recommended for Production)

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql@15
   ```

2. **Create Database**
   ```bash
   sudo -u postgres psql
   ```
   ```sql
   CREATE DATABASE ggpoint;
   CREATE USER ggpoint_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ggpoint TO ggpoint_user;
   \q
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://ggpoint_user:your_password@localhost:5432/ggpoint
   
   # Session secret (generate a random string)
   SESSION_SECRET=your-super-secret-32-character-string
   
   # Environment
   NODE_ENV=production
   PORT=4000
   ```

4. **Run Migration**
   
   The database schema and data will be automatically created when you start the server:
   ```bash
   npm run serve:ssr:ggpoint
   ```
   
   For detailed migration instructions, see [Database Migration Guide](./docs/deployment/DATABASE_MIGRATION.md)

#### Using JSON Files (Development)

No configuration required. The application will automatically use JSON file storage if PostgreSQL is not configured. Data is stored in the `data/` directory.

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

## 👤 Admin Panel

### Access the Admin Panel

1. Navigate to `/admin` or `/admin/login`
2. Configure admin credentials via environment variables:
   - `ADMIN_USERNAME` (defaults to `admin`)
   - `ADMIN_PASSWORD` (if omitted, a random password is generated and logged on first setup)
3. Change the password after your first login.

### Features

- **Product Management**
  - Create, edit, and delete products
  - Upload and manage product images
  - Set prices, categories, and specifications
  - Featured and new product flags
  - Stock management

- **Image Management**
  - Upload product images (JPEG, PNG, WebP)
  - Automatic image optimization (WebP conversion)
  - Thumbnail generation
  - View all uploaded images
  - Delete unused images

- **Security**
  - Secure authentication with session management
  - Password change functionality
  - Rate limiting on login attempts
  - Automatic session expiration

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login with username and password
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/session` - Check current session
- `POST /api/auth/change-password` - Change password

#### Products (Public)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - List categories

#### Products (Admin)
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Images (Admin, PostgreSQL only)
- `POST /api/admin/upload-image` - Upload and optimize image
- `GET /api/admin/images` - List all images with pagination
- `GET /api/admin/images/:id` - Get image details
- `DELETE /api/admin/images/:id` - Delete image

### Security Best Practices

1. **Set a strong admin password immediately:**
   ```bash
    # Login to admin panel and navigate to settings
    # Or use API:
    curl -X POST http://localhost:4000/api/auth/change-password \
      -H "Content-Type: application/json" \
      -d '{"currentPassword":"<current-password>","newPassword":"YourStrongPassword123!"}'
    ```

2. **Use strong passwords:** Minimum 12 characters with uppercase, lowercase, numbers, and special characters

3. **Enable PostgreSQL in production:** JSON files are not suitable for production use

4. **Use HTTPS in production:** Set up SSL/TLS certificates

5. **Configure environment variables:**
    ```env
    NODE_ENV=production
    SESSION_SECRET=<generate-random-32-char-string>
    DATABASE_URL=<your-postgresql-url>
    ADMIN_USERNAME=admin
    ADMIN_PASSWORD=<strong-admin-password>
    ```

6. **Set up firewall rules:** Restrict access to admin panel by IP if possible

7. **Regular backups:** Backup your PostgreSQL database regularly

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

## 📚 Documentation

For comprehensive guides, see the [docs/](./docs/) folder:

- **[SEO Guide](./docs/seo/index.md)** - Complete SEO optimization guide
- **[Deployment Guide](./docs/deployment/DEPLOYMENT.md)** - Production deployment instructions
- **[Database Migration](./docs/deployment/DATABASE_MIGRATION.md)** - PostgreSQL setup and migration
- **[Security Guide](./docs/SECURITY.md)** - Security best practices and features
- **[Implementation Guides](./docs/guides/)** - Admin panel, translations, and other features

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

Developed by the GGPoint team.

## 📞 Support

For support, email info@gg-point.uz or join our Telegram channel.

---

**Last Updated:** December 13, 2025  
**Version:** 1.0.0
