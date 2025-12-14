import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'ru' | 'uz';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translateService = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);
  
  // Signal for reactive language state
  currentLanguage = signal<Language>('ru');
  
  private readonly STORAGE_KEY = 'ggpoint-language';
  private readonly DEFAULT_LANGUAGE: Language = 'ru';
  private readonly SUPPORTED_LANGUAGES: Language[] = ['ru', 'uz'];

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Set available languages
    this.translateService.addLangs(this.SUPPORTED_LANGUAGES);
    this.translateService.setDefaultLang(this.DEFAULT_LANGUAGE);

    // Get language from localStorage or browser or default
    const savedLanguage = this.getSavedLanguage();
    const browserLanguage = this.getBrowserLanguage();
    const initialLanguage = savedLanguage || browserLanguage || this.DEFAULT_LANGUAGE;

    this.setLanguage(initialLanguage);
  }

  private getSavedLanguage(): Language | null {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(this.STORAGE_KEY) as Language;
      return this.SUPPORTED_LANGUAGES.includes(saved) ? saved : null;
    }
    return null;
  }

  private getBrowserLanguage(): Language | null {
    if (isPlatformBrowser(this.platformId)) {
      const browserLang = navigator.language.split('-')[0];
      return this.SUPPORTED_LANGUAGES.includes(browserLang as Language) 
        ? (browserLang as Language) 
        : null;
    }
    return null;
  }

  setLanguage(lang: Language): void {
    if (!this.SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Language '${lang}' is not supported. Using default.`);
      lang = this.DEFAULT_LANGUAGE;
    }

    this.translateService.use(lang);
    this.currentLanguage.set(lang);

    // Save to localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, lang);
      // Update HTML lang attribute for accessibility and SEO
      document.documentElement.lang = lang;
    }
  }

  toggleLanguage(): void {
    const newLang: Language = this.currentLanguage() === 'ru' ? 'uz' : 'ru';
    this.setLanguage(newLang);
  }

  getSupportedLanguages(): Language[] {
    return [...this.SUPPORTED_LANGUAGES];
  }

  getLanguageName(lang: Language): string {
    const names: Record<Language, string> = {
      ru: 'Русский',
      uz: "O'zbek"
    };
    return names[lang] || lang;
  }
}
