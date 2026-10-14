import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
} from '@ionic/angular';
import { Router } from '@angular/router';
import { DatosService } from '../services/datos';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  schoolOutline,
  calculatorOutline,
  checkmarkCircleOutline,
  arrowBackOutline,
  refreshOutline,
  documentTextOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  standalone: true,
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonIcon],
})
export class Tab2Page {
  public servicio_datos = inject(DatosService);
  private enrutador = inject(Router);

  constructor() {
    addIcons({
      personOutline,
      mailOutline,
      schoolOutline,
      calculatorOutline,
      checkmarkCircleOutline,
      arrowBackOutline,
      refreshOutline,
      documentTextOutline,
    });
  }

  regresar_a_registro(): void {
    this.enrutador.navigateByUrl('/tabs/tab1');
  }

  limpiar_y_volver(): void {
    this.servicio_datos.reiniciar_datos();
    this.enrutador.navigateByUrl('/tabs/tab1');
  }
}