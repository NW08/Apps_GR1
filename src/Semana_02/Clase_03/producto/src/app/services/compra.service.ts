import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CompraService {
  nombre_producto = signal<string>('');
  cantidad = signal<number>(0);
  precio_unitario = signal<number>(0);
  compra_registrada = signal<boolean>(false);

  descuento_porcentaje = signal<number>(0);
  dinero_recibido = signal<number>(0);

  subtotal = computed(() => {
    const total = this.cantidad() * this.precio_unitario();
    return Number(total.toFixed(2));
  });

  monto_descuento = computed(() => {
    const descuento = (this.subtotal() * this.descuento_porcentaje()) / 100;
    return Number(descuento.toFixed(2));
  });

  total_final = computed(() => {
    const total = this.subtotal() - this.monto_descuento();
    return Number(Math.max(0, total).toFixed(2));
  });

  diferencia = computed(() => {
    const diff = this.dinero_recibido() - this.total_final();
    return Number(diff.toFixed(2));
  });

  cambio = computed(() => {
    const diff = this.diferencia();
    return diff >= 0 ? diff : 0;
  });

  saldo_pendiente = computed(() => {
    const diff = this.diferencia();
    return diff < 0 ? Math.abs(diff) : 0;
  });

  pago_completado = computed(() => {
    return this.compra_registrada() && this.dinero_recibido() >= this.total_final();
  });

  registrar_compra(nombre: string, cantidad: number, precio: number): void {
    this.nombre_producto.set(nombre);
    this.cantidad.set(cantidad);
    this.precio_unitario.set(precio);
    this.compra_registrada.set(true);
    this.descuento_porcentaje.set(0);
    this.dinero_recibido.set(0);
  }

  actualizar_pago(descuento: number, dinero: number): void {
    this.descuento_porcentaje.set(descuento);
    this.dinero_recibido.set(dinero);
  }

  reiniciar_todo(): void {
    this.nombre_producto.set('');
    this.cantidad.set(0);
    this.precio_unitario.set(0);
    this.compra_registrada.set(false);
    this.descuento_porcentaje.set(0);
    this.dinero_recibido.set(0);
  }
}
