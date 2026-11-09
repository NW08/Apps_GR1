import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonCard, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bookOutline, heart, heartOutline } from 'ionicons/icons';

import type { Book } from '../../models/book';
import { BooksService } from '../../services/books.service';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-book-card',
  templateUrl: './book-card.component.html',
  styleUrls: ['./book-card.component.scss'],
  imports: [RouterLink, IonCard, IonButton, IonIcon],
})
export class BookCardComponent {
  readonly book = input.required<Book>();
  readonly books = inject(BooksService);
  readonly favorites = inject(FavoritesService);

  constructor() {
    addIcons({ bookOutline, heart, heartOutline });
  }

  toggleFavorite(event: Event): void {
    // Evita que el clic en el corazón navegue al detalle.
    event.preventDefault();
    event.stopPropagation();
    this.favorites.toggle(this.book());
  }
}
