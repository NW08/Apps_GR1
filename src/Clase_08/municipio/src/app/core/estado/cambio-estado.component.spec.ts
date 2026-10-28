import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ComponentRef } from '@angular/core';
import { CambioEstadoComponent } from './cambio-estado.component';
import { Incidencia } from '../models/incidencia.model';

describe('CambioEstadoComponent', () => {
  let component: CambioEstadoComponent;
  let componentRef: ComponentRef<CambioEstadoComponent>;
  let fixture: ComponentFixture<CambioEstadoComponent>;

  const mockIncidencia: Incidencia = {
    id: '1',
    codigo: 'INC-001',
    tipo: 'bache',
    descripcion: 'Hueco profundo en el asfalto',
    direccion: 'Calle 1',
    sector: 'Centro',
    prioridad: 'alta',
    estado: 'pendiente',
    fecha: '2026-10-28',
    fotoUrl: null,
    latitud: 10.0,
    longitud: -66.0,
    observacion: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambioEstadoComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(CambioEstadoComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('incidencia', mockIncidencia);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
