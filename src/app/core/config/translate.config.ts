import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

// Custom type definition matching @ngx-translate/core's expected TranslationObject structure
// This mirrors the library's internal type but is defined locally since it's not exported
type StrictTranslation = string | StrictTranslation[] | TranslationObject | undefined | null;
interface TranslationObject {
  [key: string]: StrictTranslation;
}

// Custom HTTP Loader for translations
export class CustomTranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient, private prefix: string = './assets/i18n/', private suffix: string = '.json') {}

  getTranslation(lang: string): Observable<TranslationObject> {
    return this.http.get<TranslationObject>(`${this.prefix}${lang}${this.suffix}`);
  }
}

// Factory function for the TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new CustomTranslateHttpLoader(http, './assets/i18n/', '.json');
}
