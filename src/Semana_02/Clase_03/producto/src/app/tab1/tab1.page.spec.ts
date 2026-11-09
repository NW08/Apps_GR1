import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let componente: Tab1Page;
  let elemento_fixture: ComponentFixture<Tab1Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();

    elemento_fixture = TestBed.createComponent(Tab1Page);
    componente = elemento_fixture.componentInstance;
    elemento_fixture.detectChanges();
  });

  it('should create', () => {
    expect(componente).toBeTruthy();
  });
});
