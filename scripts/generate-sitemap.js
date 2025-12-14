/**
 * Sitemap Generator Script for GGPoint
 * 
 * This script automatically generates a sitemap.xml file from your products and blog posts.
 * Run this script whenever you add new products or blog posts to keep your sitemap up to date.
 * 
 * Usage:
 *   node scripts/generate-sitemap.js
 * 
 * The script will:
 * - Read all products from src/assets/data/products.json
 * - Read all blog posts from src/assets/data/blog-posts.json
 * - Generate a complete sitemap.xml in the public folder
 * - Include image tags for product images
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  domain: 'https://ggpoint.uz',
  productsPath: path.join(__dirname, '../src/assets/data/products.json'),
  blogPostsPath: path.join(__dirname, '../src/assets/data/blog-posts.json'),
  outputPath: path.join(__dirname, '../public/sitemap.xml'),
  lastmod: new Date().toISOString().split('T')[0]
};

// Static pages configuration
const STATIC_PAGES = [
  { url: '/', changefreq: 'weekly', priority: '1.0' },
  { url: '/catalog', changefreq: 'daily', priority: '0.9' },
  { url: '/blog', changefreq: 'weekly', priority: '0.8' },
  { url: '/about', changefreq: 'monthly', priority: '0.7' },
  { url: '/contact', changefreq: 'monthly', priority: '0.7' },
  { url: '/faq', changefreq: 'monthly', priority: '0.6' }
];

/**
 * Read JSON file
 */
function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Escape XML special characters
 */
function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generate URL entry for sitemap
 */
function generateURL(loc, lastmod, changefreq, priority, images = []) {
  let xml = '  <url>\n';
  xml += `    <loc>${escapeXML(loc)}</loc>\n`;
  xml += `    <lastmod>${lastmod}</lastmod>\n`;
  xml += `    <changefreq>${changefreq}</changefreq>\n`;
  xml += `    <priority>${priority}</priority>\n`;
  
  // Add image tags if provided
  if (images.length > 0) {
    images.forEach(image => {
      xml += '    <image:image>\n';
      xml += `      <image:loc>${escapeXML(image.url)}</image:loc>\n`;
      if (image.title) {
        xml += `      <image:title>${escapeXML(image.title)}</image:title>\n`;
      }
      xml += '    </image:image>\n';
    });
  }
  
  xml += '  </url>\n';
  return xml;
}

/**
 * Generate sitemap content
 */
function generateSitemap() {
  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  sitemap += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
  
  // Add static pages
  sitemap += '  <!-- Main Pages -->\n';
  STATIC_PAGES.forEach(page => {
    const url = `${CONFIG.domain}${page.url}`;
    sitemap += generateURL(url, CONFIG.lastmod, page.changefreq, page.priority);
  });
  
  // Add product pages
  const productsData = readJSON(CONFIG.productsPath);
  if (productsData && productsData.products) {
    sitemap += '\n  <!-- Product Pages -->\n';
    productsData.products.forEach(product => {
      const url = `${CONFIG.domain}/catalog/${product.id}`;
      const lastmod = product.createdAt ? product.createdAt.split('T')[0] : CONFIG.lastmod;
      
      // Prepare image data
      const images = [];
      if (product.thumbnail) {
        images.push({
          url: product.thumbnail,
          title: product.name
        });
      }
      
      sitemap += generateURL(url, lastmod, 'weekly', '0.8', images);
    });
    console.log(`✓ Added ${productsData.products.length} products to sitemap`);
  }
  
  // Add blog posts
  const blogData = readJSON(CONFIG.blogPostsPath);
  if (blogData && blogData.posts) {
    sitemap += '\n  <!-- Blog Posts -->\n';
    blogData.posts.forEach(post => {
      const url = `${CONFIG.domain}/blog/${post.slug}`;
      const lastmod = post.publishDate ? post.publishDate.split('T')[0] : CONFIG.lastmod;
      
      sitemap += generateURL(url, lastmod, 'monthly', '0.7');
    });
    console.log(`✓ Added ${blogData.posts.length} blog posts to sitemap`);
  }
  
  sitemap += '</urlset>';
  return sitemap;
}

/**
 * Main function
 */
function main() {
  console.log('🗺️  Generating sitemap...\n');
  
  // Generate sitemap
  const sitemap = generateSitemap();
  
  // Write to file
  try {
    fs.writeFileSync(CONFIG.outputPath, sitemap, 'utf8');
    console.log(`\n✅ Sitemap generated successfully!`);
    console.log(`📍 Location: ${CONFIG.outputPath}`);
    console.log(`🌐 URL: ${CONFIG.domain}/sitemap.xml`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Commit the updated sitemap.xml`);
    console.log(`   2. Deploy your site`);
    console.log(`   3. Submit to Google Search Console: ${CONFIG.domain}/sitemap.xml`);
    console.log(`   4. Submit to Yandex Webmaster: ${CONFIG.domain}/sitemap.xml`);
  } catch (error) {
    console.error('❌ Error writing sitemap:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
