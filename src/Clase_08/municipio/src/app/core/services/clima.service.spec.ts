import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClimaService } from './clima.service';

describe('ClimaService', () => {
  let service: ClimaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ClimaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
