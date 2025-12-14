# Open Graph Images

This directory contains Open Graph images for social media sharing.

## Required Images

### 1. og-image.png (Primary OG Image)
- **Dimensions**: 1200x630 pixels
- **Format**: PNG or JPG
- **Max Size**: 8 MB (recommended < 300KB)
- **Purpose**: Default social media preview image
- **Content**: Should include:
  - GGPoint logo
  - Tagline: "Computer Accessories Store in Uzbekistan"
  - Eye-catching design with brand colors
  - Text should be readable at small sizes

### 2. logo.png (Brand Logo)
- **Dimensions**: 512x512 pixels (square)
- **Format**: PNG with transparent background
- **Purpose**: Used in structured data for Organization schema
- **Content**: GGPoint logo only

## How to Create OG Image

### Option 1: Online Tools (Easy)
1. Use [Canva](https://canva.com) or [Figma](https://figma.com)
2. Create new design with dimensions 1200x630px
3. Add your logo and text
4. Export as PNG
5. Save as `og-image.png` in this directory

### Option 2: Design Software
1. Use Photoshop, GIMP, or similar
2. Create canvas: 1200x630px
3. Design with:
   - Background: Gradient or solid color
   - Logo: GGPoint logo
   - Text: "Computer Accessories Store"
   - Subtext: "Gaming • Office • Streaming"
4. Export as PNG
5. Optimize with [TinyPNG](https://tinypng.com)

### Option 3: Code-Based (Advanced)
Use the included script to generate programmatically:
```bash
node scripts/generate-og-image.js
```

## Best Practices

1. **Keep text large and bold** - Will be displayed small in feeds
2. **Use high contrast** - Makes text readable
3. **Include branding** - Logo and site name
4. **Test preview** - Use [Meta Debugger](https://developers.facebook.com/tools/debug/)
5. **Optimize file size** - Faster loading = better SEO

## Current Status

⚠️ **TODO**: Create actual og-image.png file
- The SEO service references this file but it doesn't exist yet
- Create and upload the image following specifications above
- After upload, test with social media debuggers

## Testing OG Images

After creating the image, test with these tools:

1. **Facebook**: https://developers.facebook.com/tools/debug/
2. **Twitter**: https://cards-dev.twitter.com/validator
3. **LinkedIn**: https://www.linkedin.com/post-inspector/
4. **Generic**: https://www.opengraph.xyz/

## Per-Product OG Images (Optional)

You can also create custom OG images for each product:
- Filename: `og-product-{productId}.png`
- Example: `og-product-prod-001.png`
- Update product schema to reference these specific images
