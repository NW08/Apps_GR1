import { TestBed } from '@angular/core/testing';
import { CompraService } from './compra.service';

describe('CompraService', () => {
  let service: CompraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate subtotal correctly', () => {
    service.registrar_compra('Laptop', 2, 500);
    expect(service.subtotal()).toBe(1000);
  });

  it('should calculate total with discount correctly', () => {
    service.registrar_compra('Monitor', 1, 200);
    service.actualizar_pago(10, 200);
    expect(service.monto_descuento()).toBe(20);
    expect(service.total_final()).toBe(180);
    expect(service.cambio()).toBe(20);
    expect(service.saldo_pendiente()).toBe(0);
  });
});
