import { Component, inject } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { heartOutline } from 'ionicons/icons';

import { BookCardComponent } from '../../components/book-card/book-card.component';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  imports: [BookCardComponent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon],
})
export class FavoritesPage {
  readonly favorites = inject(FavoritesService).favorites;

  constructor() {
    addIcons({ heartOutline });
  }
}
