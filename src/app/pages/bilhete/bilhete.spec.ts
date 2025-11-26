import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bilhete } from './bilhete';

describe('Bilhete', () => {
  let component: Bilhete;
  let fixture: ComponentFixture<Bilhete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bilhete]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bilhete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
