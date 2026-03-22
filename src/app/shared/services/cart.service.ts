import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  thumbnail: string;
  quantity: number;
}

const CART_KEY = 'ggpoint_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private itemsSignal = signal<CartItem[]>(this.loadFromStorage());

  items = this.itemsSignal.asReadonly();
  totalCount = computed(() => this.itemsSignal().reduce((sum, i) => sum + i.quantity, 0));
  totalPrice = computed(() => this.itemsSignal().reduce((sum, i) => sum + i.price * i.quantity, 0));

  private loadFromStorage(): CartItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private save(items: CartItem[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
  }

  addToCart(product: { id: string; name: string; price: number; thumbnail: string }): void {
    const items = [...this.itemsSignal()];
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.push({ productId: product.id, name: product.name, price: product.price, thumbnail: product.thumbnail, quantity: 1 });
    }
    this.itemsSignal.set(items);
    this.save(items);
  }

  removeFromCart(productId: string): void {
    const items = this.itemsSignal().filter(i => i.productId !== productId);
    this.itemsSignal.set(items);
    this.save(items);
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) { this.removeFromCart(productId); return; }
    const items = this.itemsSignal().map(i => i.productId === productId ? { ...i, quantity } : i);
    this.itemsSignal.set(items);
    this.save(items);
  }

  isInCart(productId: string): boolean {
    return this.itemsSignal().some(i => i.productId === productId);
  }

  clearCart(): void {
    this.itemsSignal.set([]);
    this.save([]);
  }
}
