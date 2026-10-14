import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatosService } from '../services/datos';
import { addIcons } from 'ionicons';
import {
  addOutline,
  removeOutline,
  refreshOutline,
  arrowForwardOutline,
  alertCircleOutline,
  personOutline,
  mailOutline,
  schoolOutline,
  calculatorOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  standalone: true,
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    FormsModule,
  ],
})
export class Tab1Page {
  nombre_usuario: string = '';
  correo_electronico: string = '';
  numero_paralelo: string = '';
  valor_contador: number = 0;
  mensaje_alerta: string = '';

  private servicio_datos = inject(DatosService);
  private enrutador = inject(Router);

  constructor() {
    addIcons({
      addOutline,
      removeOutline,
      refreshOutline,
      arrowForwardOutline,
      alertCircleOutline,
      personOutline,
      mailOutline,
      schoolOutline,
      calculatorOutline,
    });
  }

  aumentar_contador(): void {
    this.valor_contador++;
  }

  disminuir_contador(): void {
    if (this.valor_contador > 0) {
      this.valor_contador--;
    }
  }

  reiniciar_contador(): void {
    this.valor_contador = 0;
  }

  enviar_resumen(): void {
    const nombre_limpio = this.nombre_usuario.trim();
    const correo_limpio = this.correo_electronico.trim();
    const paralelo_numero = Number(this.numero_paralelo) || 0;

    if (!nombre_limpio) {
      this.mensaje_alerta = 'Ingresa tu nombre antes de continuar.';
      return;
    }

    if (!correo_limpio) {
      this.mensaje_alerta = 'Ingresa tu correo electrónico antes de continuar.';
      return;
    }

    this.mensaje_alerta = '';
    this.servicio_datos.guardar_datos(
      nombre_limpio,
      correo_limpio,
      paralelo_numero,
      this.valor_contador
    );
    this.enrutador.navigateByUrl('/tabs/tab2');
  }
}
