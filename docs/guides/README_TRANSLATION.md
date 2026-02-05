# Quick Start: Using Translations

## 🌐 Language Switching for Users

1. **Open the website**: Navigate to your GGPoint website
2. **Find the language icon**: Look for the 🌐 globe icon in the top right of the header
3. **Click to open menu**: A dropdown will show available languages:
   - **Русский** (Russian)
   - **O'zbek** (Uzbek)
4. **Select your language**: Click on your preferred language
5. **Done!** The entire website will instantly switch to your selected language

Your language preference is automatically saved and will be remembered next time you visit.

---

## 👨‍💻 For Developers: Adding/Editing Translations

### Step 1: Edit Translation Files

Translation files are located in `src/assets/i18n/`:

**Russian**: `src/assets/i18n/ru.json`
**Uzbek**: `src/assets/i18n/uz.json`

### Step 2: Add Your Translation Key

Add the same key to both files with appropriate translations:

**ru.json:**
```json
{
  "mySection": {
    "myKey": "Мой текст на русском"
  }
}
```

**uz.json:**
```json
{
  "mySection": {
    "myKey": "Mening o'zbek tilidagi matnim"
  }
}
```

### Step 3: Use in Your Component

**In HTML Template:**
```html
<p>{{ 'mySection.myKey' | translate }}</p>
```

**In TypeScript:**
```typescript
import { TranslateService } from '@ngx-translate/core';

constructor(private translate: TranslateService) {}

// Get translation instantly
const text = this.translate.instant('mySection.myKey');

// Or subscribe to changes
this.translate.get('mySection.myKey').subscribe(text => {
  console.log(text);
});
```

### Step 4: Import TranslateModule

Make sure your component imports `TranslateModule`:

```typescript
import { TranslateModule } from '@ngx-translate/core';

@Component({
  // ...
  imports: [CommonModule, TranslateModule, /* other imports */]
})
```

---

## 🔍 Translation Key Naming Convention

Use dot notation for hierarchical organization:

```
section.subsection.key

Examples:
- header.home
- product.price
- blog.readMore
- contact.form.name
```

---

## 🛠️ Common Translation Patterns

### Simple Text
```html
<h1>{{ 'page.title' | translate }}</h1>
```

### With Parameters
```html
<p>{{ 'greeting' | translate:{ name: userName } }}</p>
```

In translation file:
```json
{
  "greeting": "Hello, {{name}}!"
}
```

### In Attributes
```html
<input [placeholder]="'search.placeholder' | translate">
<button [attr.aria-label]="'button.label' | translate">
```

---

## 🚀 Quick Commands

```bash
# Development server with translations
npm start

# Build with translations
npm run build

# Build SSR with translations
npm run build:ssr
```

---

## ✨ Tips

1. **Always translate both files**: Keep `ru.json` and `uz.json` in sync
2. **Use descriptive keys**: `header.navigation.home` is better than `h1`
3. **Group related keys**: Use nested objects for organization
4. **Test both languages**: Always check both RU and UZ after adding translations
5. **Avoid hardcoded text**: Every user-visible text should use translations

---

## 📞 Need Help?

- Check `TRANSLATION_IMPLEMENTATION.md` for detailed documentation
- Review existing translation files for examples
- Look at implemented components for usage patterns

---

**Happy Translating! 🎉**
