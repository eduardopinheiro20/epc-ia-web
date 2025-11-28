// src/app/components/bankroll-page.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { BankrollService } from "../../app/services/bankroll.service";


@Component({
  selector: "app-bankroll-page",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h2>Gerenciar Banca</h2>

      <div *ngIf="!bankroll">
        <p>Nenhuma banca ativa.</p>
      </div>

      <div *ngIf="bankroll">
        <p>Saldo atual: R$ {{ bankroll.currentAmount | number:'1.2-2' }}</p>
        <p>Status: {{ bankroll.status }}</p>

        <button (click)="forcarValidacao()">Forçar validação (processar tickets)</button>
        <button (click)="reset()" style="margin-left: 8px">Resetar banca</button>
      </div>
    </div>
  `,
})
export class BankrollPageComponent implements OnInit {
  bankroll: any = null;

  constructor(private bankrollService: BankrollService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.bankrollService.getBankroll().subscribe((res: any) => {
      this.bankroll = res?.bankroll ?? null;
    });
  }

  forcarValidacao() {
    this.bankrollService.validarAutomatico().subscribe({
      next: (res) => {
        alert("Validação solicitada. Recarregue em alguns segundos.");
        this.load();
      },
      error: (err) => {
        console.error(err);
        alert("Erro ao solicitar validação.");
      },
    });
  }

  reset() {
    if (!confirm("Resetar banca (limpar histórico)?")) return;
    this.bankrollService.resetBankroll().subscribe({
      next: (res) => {
        alert("Banca resetada.");
        this.load();
      },
      error: (err) => {
        console.error(err);
        alert("Erro ao resetar banca.");
      },
    });
  }
}
