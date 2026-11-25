import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { gridOutline } from 'ionicons/icons';

@Component({
  selector: 'app-veedor-shell',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="mesas" href="/veedor/mesas">
          <ion-icon name="grid-outline"></ion-icon>
          <ion-label>Mis mesas</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class VeedorShellComponent {
  constructor() {
    addIcons({ gridOutline });
  }
}
