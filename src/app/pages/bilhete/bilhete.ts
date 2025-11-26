import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IaService } from '../../services/ia.service';
import { ChangeDetectorRef } from '@angular/core';
import { SaveResult } from '../../models/save-result.model';

@Component({
  selector: 'app-bilhete',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bilhete.html',
  styleUrls: ['./bilhete.css']
})
export class BilheteComponent implements OnInit {

  loading = true;
  ticket: any = null;
  modalVisible = false;
  modalMessage = "";
  modalIcon: "success" | "warning" | "error" = "success";

  toastMsg: string | null = null;   

  constructor(private iaService: IaService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.iaService.getBilhete().subscribe({
      next: (res) => {
        if (res.found) {
          this.ticket = res.ticket;
        }
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
    setTimeout(() => this.toastMsg = null, 3000);
  }

  salvarAposta() {
    this.iaService.salvarBilhete(this.ticket).subscribe({
      next: (res: SaveResult) => {
        if (res.duplicate) {
          this.showModal("⚠️ Este bilhete já foi salvo antes.");
        } else {
          this.showModal("✅ Bilhete salvo com sucesso!");
        }
      },
      error: err => {
        this.showModal("❌ Erro ao salvar aposta.");
      }
    });
  }

  showModal(msg: string, icon: "success" | "warning" | "error" = "success") {
    this.modalMessage = msg;
    this.modalIcon = icon;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

}
