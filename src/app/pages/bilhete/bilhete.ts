import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaService } from '../../services/ia.service';
import { ChangeDetectorRef } from '@angular/core';
import { SaveResult } from '../../models/save-result.model';
import { RouterModule } from '@angular/router';
import { BankrollService } from '../../services/bankroll.service';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-bilhete',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    DecimalPipe,
    FormsModule
  ],
  templateUrl: './bilhete.html',
  styleUrls: ['./bilhete.css']
})
export class BilheteComponent implements OnInit {

  loading = false;
  toastVisible = false;
  saving = false;
  toastMessage = "";
  toastType: "success" | "warning" | "error" = "success";
  private toastTimeout: any;
  ticket: any | null = null;
  noOpportunityMessage: string | null = null;
  generationReason: string | null = null;
  oddsRequired: any[] = [];
  savingOdds = false;

  constructor(
    private iaService: IaService,
    private ticketService: TicketService,
    private bankrollService: BankrollService,
    private router: Router,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    ) {}

  ngOnInit(): void {
    this.buscarBilhete();
  }

  buscarBilhete(): void {
    this.loading = true;
    this.ticket = null;
    this.noOpportunityMessage = null;
    this.generationReason = null;
    this.oddsRequired = [];

    this.iaService.getBilhete()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
      next: (res) => {
        this.zone.run(() => {

          if (res.found === false) {
            this.noOpportunityMessage =
              res.message || 'Nenhuma aposta segura encontrada hoje.';
            this.generationReason = res.reason || null;
            const required = res.odds_required ?? res.oddsRequired ?? [];
            this.oddsRequired = required.map((item: any) => ({
              ...item,
              odd: null,
            }));
            this.cdr.detectChanges();
            return;
          }

          this.ticket = res.ticket;
          this.cdr.detectChanges(); // Força a detecção de mudanças
        });
      },
      error: () => {
        this.zone.run(() => {
          this.showToast('Erro ao buscar bilhete do dia', 'error');
          this.cdr.detectChanges(); // Força a detecção de mudanças
        });
      }
    });
  }

  salvarOddsEGerar(): void {
    if (this.savingOdds) return;

    const odds = this.oddsRequired
      .filter(item => Number(item.odd) > 1)
      .map(item => ({
        fixture_id: item.fixture_id,
        market_code: item.market_code,
        odd: Number(item.odd),
      }));

    if (odds.length === 0) {
      this.showToast('Informe ao menos uma odd atual da Betano.', 'warning');
      return;
    }

    this.savingOdds = true;
    this.iaService.salvarOddsBetano(odds)
      .pipe(
        finalize(() => {
          this.savingOdds = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.showToast('Odds atualizadas. Refazendo a análise...', 'success');
          this.buscarBilhete();
        },
        error: (error) => {
          const message =
            error?.error?.detail || 'Não foi possível salvar as odds.';
          this.showToast(message, 'error');
        }
      });
  }

  salvarBilhete() {
    if (this.saving) return;

    this.saving = true;

    // verificar se existe banca antes de salvar
    this.bankrollService.getBankroll().subscribe({
      next: (res: any) => {
        const banca = res.bankroll;

        if (!banca || banca.status !== "ACTIVE") {
          this.showToast('Voce precisa criar uma banca antes de cadastrar o primeiro bilhete.', 'warning')
           this.saving = false;
          return;
        }

        this.salvarBilheteComBanca();

      },
      error: () => {
        this.saving = false;
         this.showToast('Erro ao validar banca.', 'error');
      }
    });
  }

  private salvarBilheteComBanca() {

    this.ticketService.salvarBilhete(this.ticket).subscribe({
      next: (res: any) => {
        this.saving = false;

        if (res.alreadyExists) {
          this.showToast('Este bilhete já foi salvo anteriormente.', 'warning',);
          return;
        } 

          this.showToast('Bilhete cadastrado com sucesso!', 'success', );
        
      },
      error: () => {
        this.saving = false;
        this.showToast(
          'Erro ao salvar o bilhete. Tente novamente.',  'warning',
        );
      }
    });
  }


  // 2. Método showToast melhorado
  private showToast(message: string, type: 'success' | 'warning' | 'error') {
    // Limpar qualquer timeout existente para evitar conflitos
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    // Se o toast já estiver visível, primeiro esconda-o com uma pequena transição
    if (this.toastVisible) {
      this.toastVisible = false;
      
      // Aguarde a transição de saída terminar antes de mostrar o novo toast
      setTimeout(() => {
        this.showToastWithMessage(message, type);
      }, 300); // Tempo suficiente para a animação de saída
    } else {
      // Se não estiver visível, mostre imediatamente
      this.showToastWithMessage(message, type);
    }
  }

  private showToastWithMessage(message: string, type: 'success' | 'warning' | 'error') {
      // Defina as propriedades
    this.toastMessage = message;
    this.toastType = type;

    // Force a detecção de mudanças antes de tornar o toast visível
    this.cdr.detectChanges();
    
    // Use setTimeout em vez de requestAnimationFrame para garantir que o DOM foi atualizado
    setTimeout(() => {
      this.toastVisible = true;
      this.cdr.detectChanges(); // Force a detecção de mudanças novamente
      
      // Configure o timeout para esconder o toast
      this.toastTimeout = setTimeout(() => {
        this.toastVisible = false;
        this.cdr.detectChanges(); // Force a detecção de mudanças ao esconder
      }, 5000);
    }, 10);

  }

}
