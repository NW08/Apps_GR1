import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { IncidenciasService } from './incidencias.service';

describe('IncidenciasService', () => {
  let service: IncidenciasService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(IncidenciasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
