import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

// Custom HTTP Loader for translations
export class CustomTranslateHttpLoader implements TranslateLoader {
  constructor(private http: HttpClient, private prefix: string = './assets/i18n/', private suffix: string = '.json') {}

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`);
  }
}

// Factory function for the TranslateHttpLoader
export function HttpLoaderFactory(http: HttpClient): TranslateLoader {
  return new CustomTranslateHttpLoader(http, './assets/i18n/', '.json');
}
