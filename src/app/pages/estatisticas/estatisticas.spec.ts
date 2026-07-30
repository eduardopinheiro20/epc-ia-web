import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EstatisticasComponent } from './estatisticas';
import { StatisticsService } from '../../services/StatisticsService';

describe('Estatisticas', () => {
  let component: EstatisticasComponent;
  let fixture: ComponentFixture<EstatisticasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstatisticasComponent],
      providers: [
        { provide: StatisticsService, useValue: { getAll: () => of([]) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstatisticasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
