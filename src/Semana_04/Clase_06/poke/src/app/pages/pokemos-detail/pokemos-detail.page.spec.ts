import { TestBed } from '@angular/core/testing';

import { PokemosDetailPage } from './pokemos-detail.page';

describe('PokemosDetailPage', () => {
  let component: PokemosDetailPage;

  beforeEach(() => {
    const fixture = TestBed.createComponent(PokemosDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
