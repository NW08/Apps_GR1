import type { OnInit } from '@angular/core';
import { Component, inject, input, signal } from '@angular/core';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bookOutline, cloudOfflineOutline, heart, heartOutline, openOutline, refreshOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';

import type { BookDetail } from '../../models/book';
import { BooksService } from '../../services/books.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.page.html',
  styleUrls: ['./book-detail.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonContent,
    IonSpinner,
    IonChip,
  ],
})
export class BookDetailPage implements OnInit {
  /** Parámetro de ruta `book/:id` (withComponentInputBinding). */
  readonly id = input.required<string>();

  readonly books = inject(BooksService);
  readonly favorites = inject(FavoritesService);

  readonly book = signal<BookDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    addIcons({ bookOutline, cloudOfflineOutline, heart, heartOutline, openOutline, refreshOutline });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.books
      .detail(this.id())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (book) => this.book.set(book),
        error: () => this.error.set(true),
      });
  }

  toggleFavorite(): void {
    const book = this.book();
    if (book) this.favorites.toggle(book);
  }
}
