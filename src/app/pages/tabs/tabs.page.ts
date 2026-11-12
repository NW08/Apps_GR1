import { Component, inject } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { peopleOutline, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" id="tf-tab-bar" class="tf-tab-bar" (ionTabButtonClick)="alPulsarPestana($event)">
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
  styles: [
    `
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
    `,
  ],
})
export class TabsPage {
  private readonly navCtrl = inject(NavController);

  constructor() {
    addIcons({ personAddOutline, peopleOutline });
  }

  /**
   * ion-tabs recuerda la última URL de cada pestaña, así que tras editar reabriría
   * `/tabs/registro?editar=<id>`. Se intercepta el clic para abrir siempre el registro limpio.
   */
  alPulsarPestana(evento: Event): void {
    const { tab } = (evento as CustomEvent<{ tab: string }>).detail;
    if (tab !== 'registro') return;
    evento.stopPropagation();
    void this.navCtrl.navigateRoot('/tabs/registro', { animated: true, animationDirection: 'back' });
  }
}
