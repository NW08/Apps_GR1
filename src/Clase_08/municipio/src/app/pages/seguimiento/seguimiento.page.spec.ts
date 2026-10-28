import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SeguimientoPage } from './seguimiento.page';

describe('SeguimientoPage', () => {
  let component: SeguimientoPage;
  let fixture: ComponentFixture<SeguimientoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeguimientoPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SeguimientoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
