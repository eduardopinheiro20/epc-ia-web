import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BankrollService } from '../../services/bankroll.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DecimalPipe,
    FormsModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {


  cashoutAberto = false;
  cashoutValor: number | null = null;
  processandoCashout = false;
  // confirmação customizada (substitui confirm())
  confirmAberto = false;
  confirmMessage = '';
  private confirmPromiseResolve: ((value: boolean) => void) | null = null;

  toastVisible = false;
  toastMessage = "";
  toastType: "success" | "warning" | "error" = "success";
  private toastTimeout: any;

  bankroll: any = null;
  bancaExiste = false;
  creating = false;
  loading = true;

  constructor(
    private bankrollService: BankrollService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBankroll();
  }

  // 🔥 SEMPRE carregar o estado atual da banca
  loadBankroll() {
    this.loading = true;

    this.bankrollService.getBankroll().subscribe({
      next: (res: any) => {
        this.bankroll = res.bankroll || null;
        this.bancaExiste = !!this.bankroll;

        this.loading = false;
        this.creating = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.bankroll = null;
        this.bancaExiste = false;
        this.loading = false;
        this.creating = false;
        this.cdr.detectChanges();
      }
    });
  }

  // 🔥 Criar banca e atualizar card automaticamente
  criarBanca(valor: string) {
    const initial = Number(valor);

    if (isNaN(initial) || initial <= 0) {
      this.showToast('Informe um valor válido!', 'warning');
      return;
    }

    this.creating = true;
    this.cdr.detectChanges();

    this.bankrollService.createBankroll(initial).subscribe({
      next: (res: any) => {
        // Se o backend confirmou criação, mostra mensagem de sucesso
        if (res && res.created) {
          this.showToast('Banca criada com sucesso!', 'success');
        }

        this.loadBankroll(); // 🔥 Atualiza card após criar
      },
      error: (err) => {
        this.creating = false;

        if (err.status === 409) {
          this.showToast('Já existe uma banca ativa!', 'warning');
        } else {
          this.showToast('Erro ao criar a banca.', 'error');
        }

        this.cdr.detectChanges();
      }
    });
  }

  // Processar bilhetes e atualizar saldo da banca
  processarResultados() {
    // Usamos um modal de confirmação customizado para manter consistência visual
    this.requestConfirm('Deseja processar os bilhetes e atualizar sua banca?')
      .then((ok) => {
        if (!ok) return;

        this.bankrollService.validarAutomatico().subscribe({
          next: (res) => {
            // Mostra mensagem de backend quando atualização não foi possível
            if (res && res.updated === false) {
              this.showToast(res.message || 'Não é possível atualizar a banca.', 'warning');
              return;
            }

            if (res.noPendingTickets) {
              this.showToast(
                'Nenhum bilhete pendente para processar.',
                'warning'
              );
              return;
            }

            if (res.processados > 0) {
              this.showToast(
                'Banca atualizada com sucesso!',
                'success'
              );
              this.loadBankroll();// Atualiza card após processar
              return;
            }

            // Caso geral: não houve processamento, informar usuário
            if (res && res.processados === 0) {
              this.showToast(res.message || 'Nenhum bilhete processado.', 'warning');
            }
          },
          error: (err) => {
            console.error(err);
            this.showToast('Erro ao processar resultados!', 'error');
          }
        });
      });
  }

  // Abre o modal de confirmação e retorna uma Promise resolvida pela ação do usuário
  requestConfirm(message: string): Promise<boolean> {
    this.confirmMessage = message;
    this.confirmAberto = true;

    return new Promise(resolve => {
      this.confirmPromiseResolve = resolve;
    });
  }

  onConfirmAccept() {
    this.confirmAberto = false;
    if (this.confirmPromiseResolve) {
      this.confirmPromiseResolve(true);
      this.confirmPromiseResolve = null;
    }
  }

  onConfirmCancel() {
    this.confirmAberto = false;
    if (this.confirmPromiseResolve) {
      this.confirmPromiseResolve(false);
      this.confirmPromiseResolve = null;
    }
  }

  abrirCashout() {
    this.cashoutValor = this.bankroll?.currentAmount || null;
    this.cashoutAberto = true;
  }

  fecharCashout() {
    this.cashoutAberto = false;
    this.cashoutValor = null;
  }

  confirmarCashout() {
    if (this.cashoutValor == null || this.cashoutValor <= 0) {
      this.showToast('Informe um valor válido.', 'warning');
      return;
    }

    this.bankrollService.cashout(this.cashoutValor).subscribe({
      next: (res: any) => {

        if (!res.success) {
          this.showToast(res.message || 'Nenhum bilhete pendente.', 'warning');
          this.fecharCashout();
          return;
        }

        this.showToast('Cashout aplicado com sucesso!', 'success');
        this.fecharCashout();
        this.loadBankroll(); // atualiza saldo

      },
      error: () => {
        this.showToast('Erro ao ajustar banca.', 'error');
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

