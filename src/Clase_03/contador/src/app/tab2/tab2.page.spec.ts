import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Tab2Page } from './tab2.page';

describe('Tab2Page', () => {
  let componente: Tab2Page;
  let elemento_fixture: ComponentFixture<Tab2Page>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])]
    }).compileComponents();

    elemento_fixture = TestBed.createComponent(Tab2Page);
    componente = elemento_fixture.componentInstance;
    elemento_fixture.detectChanges();
  });

  it('should create', () => {
    expect(componente).toBeTruthy();
  });
});
