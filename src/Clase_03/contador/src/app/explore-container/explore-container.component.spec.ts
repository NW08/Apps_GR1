import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreContainerComponent } from './explore-container.component';

describe('ExploreContainerComponent', () => {
  let componente: ExploreContainerComponent;
  let elemento_fixture: ComponentFixture<ExploreContainerComponent>;

  beforeEach(async () => {
    elemento_fixture = TestBed.createComponent(ExploreContainerComponent);
    componente = elemento_fixture.componentInstance;
    elemento_fixture.detectChanges();
  });

  it('should create', () => {
    expect(componente).toBeTruthy();
  });
});
