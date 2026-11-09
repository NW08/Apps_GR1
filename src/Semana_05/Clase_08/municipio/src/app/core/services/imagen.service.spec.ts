import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ImagenService } from './imagen.service';

describe('ImagenService', () => {
  let service: ImagenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ImagenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
