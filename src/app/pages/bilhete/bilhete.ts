import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { IaService } from '../../services/ia.service';
import { ChangeDetectorRef } from '@angular/core';
import { SaveResult } from '../../models/save-result.model';
import { RouterModule } from '@angular/router';
import { BankrollService } from '../../services/bankroll.service';

@Component({
  selector: 'app-bilhete',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    DecimalPipe
  ],
  templateUrl: './bilhete.html',
  styleUrls: ['./bilhete.css']
})
export class BilheteComponent implements OnInit {

  loading = true;
  ticket: any = null;
  toastVisible = false;
  saving = false;
  toastMessage = "";
  toastType: "success" | "warning" | "error" = "success";
  private toastTimeout: any;
  
  constructor(
    private iaService: IaService,
    private cdr: ChangeDetectorRef,
    private bankrollService: BankrollService,
    ) {}

  ngOnInit(): void {
    this.iaService.getBilhete().subscribe({
      next: (res) => {
        if (res.found) this.ticket = res.ticket;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
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

    this.iaService.salvarBilhete(this.ticket).subscribe({
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
      }, 3000);
    }, 10);

  }

}