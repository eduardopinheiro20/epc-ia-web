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
  modalVisible = false;
  saving = false;
  modalMessage = "";
  modalIcon: "success" | "warning" | "error" = "success";

  toastMsg: string | null = null;   

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

  showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => {
      this.toastMsg = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  salvarBilhete() {

    if (this.saving) return;

    // 1️⃣ verificar se existe banca antes de salvar
    this.bankrollService.getBankroll().subscribe({
      next: (res: any) => {
        const banca = res.bankroll;

        if (!banca || banca.status !== "ACTIVE") {
          this.showModal("⚠️ Você precisa criar uma banca antes de salvar bilhetes!", "warning");
          return;
        }

        // 2️⃣ Se banca existe → salvar normal
        this.salvarBilheteComBanca();
      },
      error: () => {
        this.showModal("❌ Erro ao verificar banca.", "error");
      }
    });
  }

  private salvarBilheteComBanca() {
    this.saving = true;

    this.iaService.salvarBilhete(this.ticket).subscribe({
      next: (res: any) => {

        this.saving = false;

        // O backend já salvou e aplicou automaticamente!
        this.showModal("✅ Bilhete salvo e aplicado na banca!");

      },
      error: () => {
        this.saving = false;
        this.showModal("❌ Erro ao salvar aposta.");
      }
    });
  }


  showModal(msg: string, icon: "success" | "warning" | "error" = "success") {
    this.modalMessage = msg;
    this.modalIcon = icon;
    this.modalVisible = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.modalVisible = false;
    this.cdr.detectChanges();
  }

}

