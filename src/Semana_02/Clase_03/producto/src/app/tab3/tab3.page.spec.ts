import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Tab3Page } from './tab3.page';

describe('Tab3Page', () => {
  let componente: Tab3Page;
  let elemento_fixture: ComponentFixture<Tab3Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();

    elemento_fixture = TestBed.createComponent(Tab3Page);
    componente = elemento_fixture.componentInstance;
    elemento_fixture.detectChanges();
  });

  it('should create', () => {
    expect(componente).toBeTruthy();
  });
});
