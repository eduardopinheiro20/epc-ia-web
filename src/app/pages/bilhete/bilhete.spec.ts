import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { BilheteComponent } from './bilhete';
import { IaService } from '../../services/ia.service';
import { TicketService } from '../../services/ticket.service';
import { BankrollService } from '../../services/bankroll.service';

describe('Bilhete', () => {
  let component: BilheteComponent;
  let fixture: ComponentFixture<BilheteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BilheteComponent],
      providers: [
        provideRouter([{ path: 'home', component: BilheteComponent }]),
        { provide: IaService, useValue: { getBilhete: () => of({ found: true, ticket: null }) } },
        { provide: TicketService, useValue: {} },
        { provide: BankrollService, useValue: {} },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BilheteComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
