import { Component } from '@angular/core';
import type { Routes } from '@angular/router';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { barChartOutline, businessOutline, mapOutline } from 'ionicons/icons';

@Component({
  selector: 'app-provincial-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="recintos">
          <ion-icon name="business-outline"></ion-icon>
          <ion-label>Recintos</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="avance">
          <ion-icon name="map-outline"></ion-icon>
          <ion-label>Avance y GPS</ion-label>
        </ion-tab-button>
        <ion-tab-button tab="dashboard">
          <ion-icon name="bar-chart-outline"></ion-icon>
          <ion-label>Dashboard</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
})
export class ProvincialTabsComponent {
  constructor() {
    addIcons({ businessOutline, mapOutline, barChartOutline });
  }
}

export const PROVINCIAL_ROUTES: Routes = [
  {
    path: '',
    component: ProvincialTabsComponent,
    children: [
      { path: 'recintos', loadComponent: () => import('./recintos.page').then((m) => m.RecintosPage) },
      { path: 'avance', loadComponent: () => import('./avance.page').then((m) => m.AvancePage) },
      { path: 'dashboard', loadComponent: () => import('./dashboard.page').then((m) => m.DashboardPage) },
      { path: '', redirectTo: 'recintos', pathMatch: 'full' },
    ],
  },
];
