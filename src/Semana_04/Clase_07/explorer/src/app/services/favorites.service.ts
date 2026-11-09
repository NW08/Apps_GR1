import { Injectable, signal } from '@angular/core';

import type { Book } from '../models/book';

const STORAGE_KEY = 'explorer.favorites';

/**
 * Favoritos persistentes. Se usa `localStorage` (equivalente web a Capacitor
 * Preferences, disponible también en el WebView de Android) para no depender
 * de un plugin extra. Solo se guarda el resumen del libro.
 */
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly items = signal<Book[]>(this.read());
  readonly favorites = this.items.asReadonly();

  isFavorite(id: string): boolean {
    return this.items().some((b) => b.id === id);
  }

  toggle(book: Book): void {
    const next = this.isFavorite(book.id)
      ? this.items().filter((b) => b.id !== book.id)
      : [this.summary(book), ...this.items()];
    this.items.set(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private summary({ id, title, authors, year, coverId, editions }: Book): Book {
    return { id, title, authors, year, coverId, editions };
  }

  private read(): Book[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Book[];
    } catch {
      return [];
    }
  }
}
