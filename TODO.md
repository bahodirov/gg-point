# GGPoint — TODO List

## ✅ Implementatsiya qilinayotganlar (v1.3.0)

### 🛒 2. Cart (Savat) funksionalligi
- [x] `CartService` — localStorage'da saqlash, mahsulot qo'shish/o'chirish/miqdor o'zgartirish
- [x] Header'da savat ikonkasi + mahsulotlar soni
- [x] Product card'da "Savatga qo'shish" tugmasi

### ❤️ 3. Sevimlilar (Favorites/Wishlist)
- [x] `FavoritesService` — localStorage'da saqlash
- [x] Product card'da yurak ikonkasi (qo'shish/o'chirish)
- [x] Product detail sahifasida sevimlilar tugmasi

### 🕐 4. So'nggi ko'rilgan mahsulotlar (Recently Viewed)
- [x] `RecentlyViewedService` — localStorage'da oxirgi 10 ta mahsulot
- [x] Katalog sahifasida pastda ko'rsatish

### 🏷️ 5. Brand filter (Katalogda)
- [x] Mahsulot modeliga `brand` maydoni qo'shildi
- [x] Katalog filtrsida brand dropdown

### 🔥 6. Chegirma filter
- [x] "Faqat chegirmali" checkbox filter katalogda

### 📋 7. Grid/List ko'rinish o'zgartirish
- [x] Katalogda grid ↔ list toggle tugmasi
- [x] List ko'rinishida gorizontal karta layout

### 🏅 8. Mahsulot Badge'lari
- [x] "Yangi" (isNew) badge — yashil rang
- [x] "Chegirma" (hasDiscount) badge — qizil rang, foiz bilan

### 🖼️ 9. Mahsulot sahifasi — Image Gallery
- [x] Thumbnails (5 ta)
- [x] Fullscreen/zoom modal
- [x] Klaviatura navigatsiyasi (← →, Esc)

### 📝 10. Mahsulot sahifasi — Kengaytirilgan tavsif
- [x] 200 belgidan keyin "Ko'proq ko'rish" tugmasi
- [x] Collapsible tavsif

### ✅ 11. Mahsulot sahifasi — Features ro'yxati
- [x] Checkmark ikonkalar bilan xususiyatlar

### 🚚 12. Mahsulot sahifasi — Yetkazib berish ma'lumoti
- [x] Alohida bo'lim — yetkazib berish shartlari

### 📺 13. Mahsulot sahifasi — YouTube video
- [x] YouTube embed bo'limi (agar mahsulotda video URL bo'lsa)

### 🔔 14. Stokda yo'q — Xabar berish
- [x] Telegram orqali "Mavjud bo'lganda xabar bering" funksiyasi

### 🏢 16. Bosh sahifa — Brandlar vitrinasi
- [x] Brendlar logolari/nomlari bilan bo'lim

### 🎁 17. Bosh sahifa — Aksiyalar bo'limi
- [x] Chegirmali mahsulotlar ("Акции") bo'limi
- [x] Yangi mahsulotlar ("Новинки") bo'limi

### 🎯 18. "Tez kunda" Modal (Soon Modal)
- [x] Trigger tugma bosh sahifada
- [x] Modal ichida mahsulotlar karuseli

### 📂 19. Keycaps va Mouse Pads navigatsiya
- [x] Navigatsiyada Keycaps va Mouse Pads havolalari (katalogga filter bilan)

### ⬆️ 20. Sorting — Nom bo'yicha
- [x] "Nom: A-Z" va "Nom: Z-A" saralash variantlari

---

## ⏳ Keyinroq (TODO)

### 🎠 1. Promotional Carousel (Swiper)
**Nima bu:** Bosh sahifada avtomatik aylanadigan reklama bannerlari.
Mavjud saytda Swiper.js kutubxonasi va Firebase real-time database ishlatiladi.
Bizning loyihada Firebase yo'q va Swiper o'rnatilmagan.
**Kerak bo'ladi:**
- `swiper` npm paketi o'rnatish
- Admin panelda poster/banner boshqarish
- Backend'da banner API endpoint
- Bosh sahifada karusel komponenti

