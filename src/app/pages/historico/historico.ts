import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IaService } from '../../services/ia.service';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';  

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './historico.html',
  styleUrls: ['./historico.css']
})
export class HistoricoComponent implements OnInit {

  loading = true;
  items: any[] = [];

  // modal
  showModal = false;
  selectedItem: any = null;

  page = 1;
  size = 20;
  pages = 1;

  startDate: string | null = null;
  endDate: string | null = null;

  constructor(
    private ia: IaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  openModal(item: any) {
    this.selectedItem = item;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.selectedItem = null;
    this.cdr.detectChanges();
  }

  load() {
    this.loading = true;

    this.ia.getHistoricoBilhetes(this.page, this.size, this.startDate, this.endDate)
      .subscribe({
        next: (res: any) => {

          this.items = res.items;
          this.pages = res.pages;

          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }

  filtrar() {
    this.page = 1; // reset página
    this.load();
  }

  proxima() {
    if (this.page < this.pages) {
      this.page++;
      this.load();
    }
  }

  anterior() {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }
    
}
