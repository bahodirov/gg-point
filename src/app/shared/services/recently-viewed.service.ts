import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const RV_KEY = 'ggpoint_recently_viewed';
const MAX_ITEMS = 10;

@Injectable({ providedIn: 'root' })
export class RecentlyViewedService {
  private platformId = inject(PLATFORM_ID);
  private idsSignal = signal<string[]>(this.loadFromStorage());

  ids = this.idsSignal.asReadonly();

  private loadFromStorage(): string[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(RV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(ids: string[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { localStorage.setItem(RV_KEY, JSON.stringify(ids)); } catch {}
  }

  add(productId: string): void {
    const ids = this.idsSignal().filter(id => id !== productId);
    const updated = [productId, ...ids].slice(0, MAX_ITEMS);
    this.idsSignal.set(updated);
    this.save(updated);
  }
}
