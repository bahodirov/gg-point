import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencySymbol', standalone: true, pure: true })
export class CurrencySymbolPipe implements PipeTransform {
  transform(currency: string): string {
    return currency === 'USD' ? '$' : 'UZS';
  }
}
