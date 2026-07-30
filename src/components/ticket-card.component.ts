// src/app/components/ticket-card/ticket-card.component.ts
import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs/operators";
import { BankrollService } from "../app/services/bankroll.service";

@Component({
  selector: "app-ticket-card",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ticket-card">
      <div class="header">
        <strong>#{{ ticket.id }}</strong>
        <span>Odd: {{ ticket.final_odd }}</span>
      </div>

      <div class="body">
        <div *ngFor="let s of ticket.selections">
          {{ s.home }} x {{ s.away }} — {{ s.market }} — {{ s.odd }}
        </div>
      </div>

      <div class="footer">
        <button (click)="usarNaBanca()" [disabled]="applying || ticket.applied_to_bankroll">
          {{ applying ? 'Vinculando...' : ticket.applied_to_bankroll ? 'Aplicado' : 'Usar na banca' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .ticket-card { background:#071226; padding:12px; border-radius:8px; border:1px solid #23303a; color:#dfeef8; margin-bottom:8px; }
    .header { display:flex; justify-content:space-between; margin-bottom:8px; }
    .footer { margin-top:10px; }
    button { background:#10b981; color:black; padding:6px 10px; border-radius:6px; border:none; cursor:pointer; }
    button[disabled] { opacity:0.6; cursor:not-allowed; }
  `]
})
export class TicketCardComponent {
  @Input() ticket: any;
  applying = false;

  constructor(private bankrollService: BankrollService) {}

  usarNaBanca() {
    if (!confirm("Aplicar esse bilhete na banca ativa?")) {
      return;
    }
    this.applying = true;
    this.bankrollService.linkTicket(this.ticket.id)
      .pipe(finalize(() => (this.applying = false)))
      .subscribe({
        next: (res) => {
          this.ticket.applied_to_bankroll = true;
          alert("Ticket vinculado à banca. Será processado pelo cron.");
        },
        error: (err) => {
          console.error(err);
          if (err?.status === 409) {
            alert("Não existe banca ativa ou ticket já vinculado.");
          } else {
            alert("Erro ao vincular ticket. Veja console.");
          }
        }
      });
  }
}
