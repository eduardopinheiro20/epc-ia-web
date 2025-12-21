import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BankrollService } from '../../services/bankroll.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';


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

 // ===== LISTAGEM =====
  items: any[] = [];
  page = 1;
  pages = 0;
  pageSize = 20;
  loading = true;

  // ===== FILTROS =====
  startDate: string = '';
  endDate: string = '';

  // ===== MODAL =====
  showModal = false;
  selectedItem: any = null;

  modalLeft = 200;
  modalTop = 100;

  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private dragging = false;


  constructor(
    private bankrollService: BankrollService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHistorico(1);
  }

  // =============================
  // BUSCAR HISTÓRICO
  // =============================
  loadHistorico(page: number): void {
    this.loading = true;

    this.bankrollService.getHistoricoBilhetes(
      page,
      this.pageSize,
      this.startDate,
      this.endDate
    ).subscribe({
      next: (resp: any) => {
        this.items = (resp.items || []).map((t: any) => ({
          id: t.id,
          saved_at: t.savedAt,
          final_odd: t.finalOdd,
          combined_prob: t.combinedProb,
          status: t.status,
          result: t.result,
          selections: (t.selections || []).map((s: any) => ({
            home: s.homeName,
            away: s.awayName,
            date: null, // você não tem data do fixture aqui
            market: s.market,
            odd: s.odd
          }))
        }));

     
        this.page = resp.page || page;
        this.pages = resp.pages || 0;

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar histórico', err);
        this.items = [];
        this.loading = false;
      }
    });
  }

  // =============================
  // FILTRO
  // =============================
  filtrar(): void {
    this.loadHistorico(1);
  }

  // =============================
  // PAGINAÇÃO
  // =============================
  anterior(): void {
    if (this.page > 1) {
      this.loadHistorico(this.page - 1);
    }
  }

  proxima(): void {
    if (this.page < this.pages) {
      this.loadHistorico(this.page + 1);
    }
  }

  // =============================
  // MODAL
  // =============================
  openModal(item: any): void {
    this.selectedItem = item;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedItem = null;
  }

  // =============================
  // DRAG DO MODAL (MOUSE)
  // =============================
  startDrag(event: MouseEvent): void {
    this.dragging = true;
    this.dragOffsetX = event.clientX - this.modalLeft;
    this.dragOffsetY = event.clientY - this.modalTop;

    document.onmousemove = (e) => this.onDrag(e);
    document.onmouseup = () => this.stopDrag();
  }

  onDrag(event: MouseEvent): void {
    if (!this.dragging) return;
    this.modalLeft = event.clientX - this.dragOffsetX;
    this.modalTop = event.clientY - this.dragOffsetY;
  }

  stopDrag(): void {
    this.dragging = false;
    document.onmousemove = null;
    document.onmouseup = null;
  }

  // =============================
  // DRAG TOUCH (CELULAR)
  // =============================
  startTouchDrag(event: TouchEvent): void {
    const touch = event.touches[0];
    this.dragOffsetX = touch.clientX - this.modalLeft;
    this.dragOffsetY = touch.clientY - this.modalTop;

    document.ontouchmove = (e) => this.onTouchMove(e);
    document.ontouchend = () => this.stopTouchDrag();
  }

  onTouchMove(event: TouchEvent): void {
    const touch = event.touches[0];
    this.modalLeft = touch.clientX - this.dragOffsetX;
    this.modalTop = touch.clientY - this.dragOffsetY;
  }

  stopTouchDrag(): void {
    document.ontouchmove = null;
    document.ontouchend = null;
  }
}
