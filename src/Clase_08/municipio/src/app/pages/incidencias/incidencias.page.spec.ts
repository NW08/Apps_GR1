import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IncidenciasPage } from './incidencias.page';

describe('IncidenciasPage', () => {
  let component: IncidenciasPage;
  let fixture: ComponentFixture<IncidenciasPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenciasPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidenciasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
