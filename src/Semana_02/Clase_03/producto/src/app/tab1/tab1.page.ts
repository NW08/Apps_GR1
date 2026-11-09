import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  storefrontOutline,
  cartOutline,
  cardOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
  imageOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  standalone: true,
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon],
})
export class Tab1Page {
  private enrutador = inject(Router);

  imagen_fallida = false;

  constructor() {
    addIcons({
      storefrontOutline,
      cartOutline,
      cardOutline,
      arrowForwardOutline,
      shieldCheckmarkOutline,
      imageOutline,
    });
  }

  al_fallar_imagen(): void {
    this.imagen_fallida = true;
  }

  ir_a_compra(): void {
    this.enrutador.navigateByUrl('/tabs/compra');
  }
}
