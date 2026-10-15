import { Component, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonIcon,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService } from '../services/compra.service';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  pricetagOutline,
  layersOutline,
  cashOutline,
  arrowForwardOutline,
  alertCircleOutline,
  refreshOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tab2',
  standalone: true,
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonIcon,
    FormsModule,
  ],
})
export class Tab2Page {
  private servicio_compra = inject(CompraService);
  private enrutador = inject(Router);

  nombre_producto: string = '';
  cantidad: number | null = null;
  precio_unitario: number | null = null;

  error_nombre: string = '';
  error_cantidad: string = '';
  error_precio: string = '';

  constructor() {
    addIcons({
      cartOutline,
      pricetagOutline,
      layersOutline,
      cashOutline,
      arrowForwardOutline,
      alertCircleOutline,
      refreshOutline,
    });
  }

  get subtotal_previo(): number {
    const cant = Number(this.cantidad);
    const precio = Number(this.precio_unitario);
    if (!isNaN(cant) && !isNaN(precio) && cant > 0 && precio > 0) {
      return Number((cant * precio).toFixed(2));
    }
    return 0;
  }

  limpiar_error(campo: 'nombre' | 'cantidad' | 'precio'): void {
    if (campo === 'nombre') this.error_nombre = '';
    if (campo === 'cantidad') this.error_cantidad = '';
    if (campo === 'precio') this.error_precio = '';
  }

  validar_y_enviar(): void {
    const nombre_limpio = this.nombre_producto.trim();
    const cantidad_valor = Number(this.cantidad);
    const precio_valor = Number(this.precio_unitario);

    let es_valido = true;

    if (!nombre_limpio) {
      this.error_nombre = 'El nombre del producto es obligatorio.';
      es_valido = false;
    } else {
      this.error_nombre = '';
    }

    if (
      this.cantidad === null ||
      this.cantidad === ('' as unknown as number) ||
      isNaN(cantidad_valor) ||
      !Number.isInteger(cantidad_valor) ||
      cantidad_valor <= 0
    ) {
      this.error_cantidad = 'La cantidad debe ser un número entero mayor que cero.';
      es_valido = false;
    } else {
      this.error_cantidad = '';
    }

    if (
      this.precio_unitario === null ||
      this.precio_unitario === ('' as unknown as number) ||
      isNaN(precio_valor) ||
      precio_valor <= 0
    ) {
      this.error_precio = 'El precio unitario debe ser mayor que cero.';
      es_valido = false;
    } else {
      this.error_precio = '';
    }

    if (!es_valido) {
      return;
    }

    this.servicio_compra.registrar_compra(
      nombre_limpio,
      cantidad_valor,
      precio_valor
    );

    this.enrutador.navigateByUrl('/tabs/pago');
  }

  limpiar_formulario(): void {
    this.nombre_producto = '';
    this.cantidad = null;
    this.precio_unitario = null;
    this.error_nombre = '';
    this.error_cantidad = '';
    this.error_precio = '';
  }
}
