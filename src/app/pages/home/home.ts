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
      alert("Informe um valor válido!");
      return;
    }

    this.creating = true;
    this.cdr.detectChanges();

    this.bankrollService.createBankroll(initial).subscribe({
      next: () => {
        this.loadBankroll(); // 🔥 Atualiza card após criar
      },
      error: (err) => {
        this.creating = false;

        if (err.status === 409) {
          alert("Já existe uma banca ativa!");
        } else {
          alert("Erro ao criar a banca.");
        }

        this.cdr.detectChanges();
      }
    });
  }

  // Processar bilhetes e atualizar saldo da banca
  processarResultados() {
    if (!confirm("Deseja processar os bilhetes e atualizar sua banca?")) return;

    this.bankrollService.validarAutomatico().subscribe({
      next: (res) => {
        alert("Banca atualizada com sucesso!");
        this.loadBankroll(); // Atualiza card após processar
      },
      error: (err) => {
        console.error(err);
        alert("Erro ao processar resultados!");
      }
    });
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

