import { Component } from '@angular/core';
import type { Routes } from '@angular/router';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { gridOutline, peopleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-recinto-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="mesas">
          <ion-icon name="grid-outline"></ion-icon>
          <ion-label>Mesas</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="veedores">
          <ion-icon name="people-outline"></ion-icon>
          <ion-label>Veedores</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class RecintoTabsComponent {
  constructor() {
    addIcons({ gridOutline, peopleOutline });
  }
}

export const RECINTO_ROUTES: Routes = [
  {
    path: '',
    component: RecintoTabsComponent,
    children: [
      { path: 'mesas', loadComponent: () => import('./mesas.page').then((m) => m.MesasRecintoPage) },
      { path: 'veedores', loadComponent: () => import('./veedores.page').then((m) => m.VeedoresPage) },
      {
        path: 'acta/:jrvId/:dignidad',
        loadComponent: () => import('../actas/acta-form.page').then((m) => m.ActaFormPage),
      },
      { path: '', redirectTo: 'mesas', pathMatch: 'full' },
    ],
  },
];
