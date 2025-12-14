# SEO Quick Reference Card 📋

Quick commands and checklists for SEO maintenance.

---

## 🚀 Most Used Commands

```bash
# Generate sitemap after adding products/posts
npm run generate:sitemap

# Build for production with SSR
npm run build:ssr

# Test SSR locally
npm run serve:ssr:ggpoint
```

---

## ✅ After Adding New Products

1. Add to `src/assets/data/products.json`
2. Run: `npm run generate:sitemap`
3. Commit: `git add public/sitemap.xml`
4. Deploy

---

## ✅ After Adding Blog Posts

1. Add to `src/assets/data/blog-posts.json`
2. Run: `npm run generate:sitemap`
3. Commit: `git add public/sitemap.xml`
4. Deploy

---

## ✅ Monthly SEO Checklist

```
[ ] Write 2-4 new blog posts
[ ] Check Google Search Console for errors
[ ] Monitor keyword rankings
[ ] Check indexing status
[ ] Review search queries and CTR
[ ] Check Yandex Webmaster
[ ] Update any out-of-stock products
```

---

## 🔗 Important URLs

### Your Site
- Live: https://ggpoint.uz
- Sitemap: https://ggpoint.uz/sitemap.xml
- Robots: https://ggpoint.uz/robots.txt

### Testing Tools
- Rich Results: https://search.google.com/test/rich-results
- Mobile Test: https://search.google.com/test/mobile-friendly
- PageSpeed: https://pagespeed.web.dev/

### Search Consoles
- Google: https://search.google.com/search-console
- Yandex: https://webmaster.yandex.com/

---

## 🎯 Target Keywords

### Primary (English)
- computer accessories Uzbekistan
- gaming peripherals Tashkent
- mechanical keyboard Uzbekistan
- gaming mouse Tashkent

### Primary (Russian)
- компьютерные аксессуары Узбекистан
- игровые устройства Ташкент

### Long-tail
- best gaming mouse under 2 million uzs
- where to buy mechanical keyboard Tashkent

---

## 📊 Key Metrics to Monitor

### Google Search Console
- Total clicks (organic traffic)
- Total impressions (visibility)
- Average CTR (click-through rate)
- Average position (rankings)
- Coverage issues (indexing problems)

### Goals
- Month 1: 10-50 clicks
- Month 3: 50-200 clicks
- Month 6: 200-500 clicks
- Month 12: 500-1000+ clicks

---

## 🚨 Common Issues & Fixes

### "Pages not indexed"
```
1. Check robots.txt allows crawling
2. Submit sitemap in Search Console
3. Request indexing manually
4. Wait 1-2 weeks
```

### "Structured data errors"
```
1. Test at: search.google.com/test/rich-results
2. Check SEO service schema methods
3. Ensure SSR is working
```

### "SSR not working"
```
1. npm run build:ssr
2. npm run serve:ssr:ggpoint
3. Visit localhost:4000
4. View page source - should see full HTML
```

### "Sitemap outdated"
```
npm run generate:sitemap
git add public/sitemap.xml
git commit -m "Update sitemap"
git push
```

---

## 📱 Social Sharing Tests

After creating OG image, test:

- **Facebook:** https://developers.facebook.com/tools/debug/
- **Twitter:** https://cards-dev.twitter.com/validator
- **LinkedIn:** https://www.linkedin.com/post-inspector/

---

## 💡 SEO Tips

1. **Content is King** - Write valuable blog posts
2. **Keywords Naturally** - Don't stuff them
3. **User Experience** - Fast, mobile-friendly, easy to navigate
4. **Regular Updates** - Fresh content signals activity
5. **Local Focus** - Uzbekistan keywords perform better
6. **Patience** - SEO takes 2-8 weeks minimum

---

## 📚 Documentation Files

- **SEO_IMPLEMENTATION_SUMMARY.md** - Quick overview & next steps
- **SEO_GUIDE.md** - Complete SEO reference (60+ pages)
- **SEO_QUICK_REFERENCE.md** - This file
- **public/assets/images/README.md** - OG image guide
- **scripts/generate-sitemap.js** - Sitemap generator

---

## 🎯 First Week Action Items

Day 1:
- [ ] Create OG image
- [ ] Deploy all changes
- [ ] Verify SSR working

Day 2:
- [ ] Submit to Google Search Console
- [ ] Submit sitemap
- [ ] Submit to Yandex

Day 3-7:
- [ ] Request indexing for top 5 pages
- [ ] Test rich results
- [ ] Write first blog post
- [ ] Share on social media

---

## 📞 Emergency Contacts

**Google Search Console Issues:**
- Help: https://support.google.com/webmasters

**Yandex Issues:**
- Help: https://yandex.com/support/webmaster/

**Angular SSR Issues:**
- Docs: https://angular.dev/guide/ssr

---

Keep this file handy for quick reference! 🚀
