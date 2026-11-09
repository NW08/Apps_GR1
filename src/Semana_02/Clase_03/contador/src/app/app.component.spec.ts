import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    
    const elemento_fixture = TestBed.createComponent(AppComponent);
    const instancia_app = elemento_fixture.componentInstance;
    expect(instancia_app).toBeTruthy();
  });
});
