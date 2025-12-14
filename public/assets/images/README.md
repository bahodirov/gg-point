# Open Graph & SEO Images Guide 🎨

This directory contains Open Graph images and brand assets for social media sharing and SEO.

## 📋 Required Images (CRITICAL for SEO!)

### 1. og-image.png (Primary OG Image) ⭐ **HIGHEST PRIORITY**
- **Dimensions**: 1200x630 pixels (exact)
- **Format**: PNG or JPG (PNG recommended for quality)
- **File Size**: < 300KB (optimized for fast loading)
- **Max Size Limit**: 8 MB (but keep it small!)
- **Purpose**: Shows when people share your site on social media
- **Impact**: Makes your links look professional and increases click-through rates by 30-50%!

**Must Include:**
  - GGPoint logo (clear and prominent)
  - Tagline: "Computer Accessories Store in Uzbekistan"
  - Background: Use brand colors (primary blue #0ea5e9)
  - Icon or image: Gaming mouse/keyboard/headset
  - Keep text LARGE - will be displayed as a thumbnail
  - High contrast for readability

### 2. logo.png (Brand Logo)
- **Dimensions**: 512x512 pixels (square, 1:1 ratio)
- **Format**: PNG with transparent background
- **Purpose**: Organization schema, favicon, app icons
- **Content**: GGPoint logo only, no text
- **Padding**: Leave 10-15% margin around logo

## 🎨 How to Create OG Image (Step-by-Step)

### Option 1: Canva (Easiest - 15 minutes) ⭐ RECOMMENDED

1. **Go to Canva**: https://canva.com (free account)
2. **Create Custom Size**:
   - Click "Create a design"
   - Select "Custom size"
   - Enter: 1200 x 630 pixels
   - Click "Create new design"

3. **Design Your Image**:
   - **Background**: Add gradient or solid color
     - Recommended: Blue gradient (#0ea5e9 to #0284c7)
   - **Add Logo**: Upload GGPoint logo to center-top
   - **Add Text**:
     - Main: "GGPoint" (72-96px, bold, white)
     - Subtitle: "Computer Accessories Store in Uzbekistan" (36-48px, white)
     - Bottom text: "Gaming • Office • Streaming" (24-32px, light blue)
   - **Add Icon**: Search "gaming mouse" or "keyboard" and add to corner
   
4. **Export**:
   - Click "Share" → "Download"
   - Format: PNG
   - Quality: Recommended
   - Download

5. **Optimize**:
   - Go to https://tinypng.com
   - Upload your PNG
   - Download optimized version
   
6. **Save**: Rename to `og-image.png` and place in this directory

### Option 2: Figma (Free - Professional)

1. Go to https://figma.com
2. Create new file: 1200x630px frame
3. Design following same guidelines as Canva
4. Export as PNG at 2x resolution
5. Optimize with TinyPNG

### Option 3: Photoshop/GIMP (Advanced)

1. Create new canvas: 1200x630px, 72 DPI
2. Add layers:
   - Layer 1: Background (gradient or solid)
   - Layer 2: Logo (centered top)
   - Layer 3: Text (main heading)
   - Layer 4: Text (subtitle)
   - Layer 5: Icons/decorations
3. Export as PNG-24 (high quality)
4. Optimize with [TinyPNG](https://tinypng.com)

### Quick Template (Copy This Design)

```
┌─────────────────────────────────────┐
│                                     │
│            [GG LOGO]                │
│                                     │
│           GGPOINT                   │
│    Computer Accessories Store       │
│         in Uzbekistan               │
│                                     │
│   Gaming • Office • Streaming       │
│                                     │
│         [Gaming Icons]              │
└─────────────────────────────────────┘
    1200px × 630px
```

**Color Palette:**
- Primary: #0ea5e9 (Sky Blue)
- Secondary: #0284c7 (Blue)
- Text: #ffffff (White)
- Accent: #38bdf8 (Light Blue)

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
