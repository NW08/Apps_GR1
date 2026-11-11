import { TestBed } from '@angular/core/testing';
import { BorradorService } from './borrador.service';

describe('BorradorService', () => {
  let service: BorradorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BorradorService],
    });
    service = TestBed.inject(BorradorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
