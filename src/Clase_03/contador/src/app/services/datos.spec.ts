import { TestBed } from '@angular/core/testing';
import { DatosService } from './datos';

describe('DatosService', () => {
  let servicio_datos: DatosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    servicio_datos = TestBed.inject(DatosService);
  });

  it('should be created', () => {
    expect(servicio_datos).toBeTruthy();
  });
});
