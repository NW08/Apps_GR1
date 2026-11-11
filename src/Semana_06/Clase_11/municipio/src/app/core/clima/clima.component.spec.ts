import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClimaComponent } from './clima.component';

describe('ClimaComponent', () => {
  let component: ClimaComponent;
  let fixture: ComponentFixture<ClimaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClimaComponent],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ClimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
