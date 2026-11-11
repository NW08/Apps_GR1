import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  personAddOutline,
  peopleOutline,
  briefcaseOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" class="tf-tab-bar">
        <ion-tab-button tab="registro" href="/tabs/registro">
          <ion-icon aria-hidden="true" name="person-add-outline"></ion-icon>
          <ion-label>Postular</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="candidatos" href="/tabs/candidatos">
          <ion-icon aria-hidden="true" name="people-outline"></ion-icon>
          <ion-label>Candidatos</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    .tf-tab-bar {
      --background: var(--tf-surface);
      border-top: 1px solid var(--tf-surface-border);
      height: 60px;
      padding-bottom: 4px;
    }
    ion-tab-button {
      --color: var(--tf-text-secondary);
      --color-selected: var(--ion-color-primary);
      font-weight: 500;
      transition: all 0.2s ease;
    }
    ion-tab-button.tab-selected {
      font-weight: 700;
    }
  `]
})
export class TabsPage {
  constructor() {
    addIcons({ personAddOutline, peopleOutline, briefcaseOutline });
  }
}
