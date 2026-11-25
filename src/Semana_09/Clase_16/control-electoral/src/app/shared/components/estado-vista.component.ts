import { Component, computed, input } from '@angular/core';
import { IonButton, IonIcon, IonSkeletonText, IonText } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { alertCircleOutline, fileTrayOutline, refreshOutline } from 'ionicons/icons';
import type { Estado } from '../../domain/models/estado';

@Component({
  selector: 'app-estado-vista',
  imports: [IonSkeletonText, IonText, IonButton, IonIcon],
  template: `
    @switch (estado().tipo) {
      @case ('cargando') {
        <div class="ion-padding">
          @for (i of [1, 2, 3, 4]; track i) {
            <ion-skeleton-text [animated]="true" style="height: 48px; margin-bottom: 12px"></ion-skeleton-text>
          }
        </div>
      }
      @case ('vacio') {
        <div class="centro ion-padding">
          <ion-icon name="file-tray-outline" size="large" color="medium"></ion-icon>
          <ion-text color="medium"><p>{{ mensajeVacio() }}</p></ion-text>
        </div>
      }
      @case ('error') {
        <div class="centro ion-padding">
          <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
          <ion-text color="danger"><p>{{ error()?.error?.mensaje }}</p></ion-text>
          @if (error()?.reintentar) {
            <ion-button fill="outline" (click)="error()?.reintentar?.()">
              <ion-icon slot="start" name="refresh-outline"></ion-icon> Reintentar
            </ion-button>
          }
        </div>
      }
      @case ('exito') {
        <ng-content></ng-content>
      }
    }
  `,
  styles: `
    .centro {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-top: 15vh;
    }
  `,
})
export class EstadoVistaComponent {
  readonly estado = input.required<Estado<unknown>>();
  readonly mensajeVacio = input('No hay datos para mostrar.');
  protected readonly error = computed(() => {
    const e = this.estado();
    return e.tipo === 'error' ? e : null;
  });

  constructor() {
    addIcons({ alertCircleOutline, fileTrayOutline, refreshOutline });
  }
}
