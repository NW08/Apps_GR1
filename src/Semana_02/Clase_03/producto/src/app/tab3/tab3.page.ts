import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonIcon,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService } from '../services/compra.service';
import { addIcons } from 'ionicons';
import {
  cardOutline,
  cashOutline,
  receiptOutline,
  pricetagOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  arrowBackOutline,
  refreshOutline,
  walletOutline,
  trendingDownOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab3',
  standalone: true,
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonIcon,
    FormsModule,
  ],
})
export class Tab3Page {
  public servicio_compra = inject(CompraService);
  private enrutador = inject(Router);

  descuento_input: number | null = null;
  dinero_input: number | null = null;

  error_descuento: string = '';
  error_dinero: string = '';

  constructor() {
    addIcons({
      cardOutline,
      cashOutline,
      receiptOutline,
      pricetagOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      arrowBackOutline,
      refreshOutline,
      walletOutline,
      trendingDownOutline,
    });
  }

  limpiar_error(campo: 'descuento' | 'dinero'): void {
    if (campo === 'descuento') this.error_descuento = '';
    if (campo === 'dinero') this.error_dinero = '';
  }

  procesar_calculo(): void {
    let es_valido = true;

    const desc_valor = this.descuento_input === null || this.descuento_input === ('' as unknown as number)
      ? 0
      : Number(this.descuento_input);

    const dinero_valor = this.dinero_input === null || this.dinero_input === ('' as unknown as number)
      ? 0
      : Number(this.dinero_input);

    if (isNaN(desc_valor) || desc_valor < 0 || desc_valor > 100) {
      this.error_descuento = 'El descuento debe estar entre 0% y 100%.';
      es_valido = false;
    } else {
      this.error_descuento = '';
    }

    if (isNaN(dinero_valor) || dinero_valor < 0) {
      this.error_dinero = 'El dinero entregado debe ser mayor o igual a 0.';
      es_valido = false;
    } else {
      this.error_dinero = '';
    }

    if (!es_valido) {
      return;
    }

    this.servicio_compra.actualizar_pago(desc_valor, dinero_valor);
  }

  ir_a_compra(): void {
    this.enrutador.navigateByUrl('/tabs/compra');
  }

  nueva_compra(): void {
    this.servicio_compra.reiniciar_todo();
    this.descuento_input = null;
    this.dinero_input = null;
    this.error_descuento = '';
    this.error_dinero = '';
    this.enrutador.navigateByUrl('/tabs/compra');
  }
}
