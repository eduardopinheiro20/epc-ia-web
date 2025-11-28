import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BankrollService } from '../../services/bankroll.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DecimalPipe
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {


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

  // 🔥 Processar bilhetes e atualizar saldo da banca
  processarResultados() {
    if (!confirm("Deseja processar os bilhetes e atualizar sua banca?")) return;

    this.bankrollService.validarAutomatico().subscribe({
      next: (res) => {
        alert("Banca atualizada com sucesso!");
        this.loadBankroll(); // 🔥 Atualiza card após processar
      },
      error: (err) => {
        console.error(err);
        alert("Erro ao processar resultados!");
      }
    });
  }
}