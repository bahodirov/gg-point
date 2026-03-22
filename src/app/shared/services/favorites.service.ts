import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const FAV_KEY = 'ggpoint_favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private platformId = inject(PLATFORM_ID);
  private idsSignal = signal<string[]>(this.loadFromStorage());

  ids = this.idsSignal.asReadonly();
  count = computed(() => this.idsSignal().length);

  private loadFromStorage(): string[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(FAV_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(ids: string[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { localStorage.setItem(FAV_KEY, JSON.stringify(ids)); } catch {}
  }

  toggle(productId: string): void {
    const ids = this.idsSignal();
    const updated = ids.includes(productId)
      ? ids.filter(id => id !== productId)
      : [...ids, productId];
    this.idsSignal.set(updated);
    this.save(updated);
  }

  isFavorite(productId: string): boolean {
    return this.idsSignal().includes(productId);
  }
}
