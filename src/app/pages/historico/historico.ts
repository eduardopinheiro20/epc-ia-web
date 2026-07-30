import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BankrollService } from '../../services/bankroll.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TicketService } from '../../services/ticket.service';
import { forkJoin } from 'rxjs';


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
  consecutiveGreens = 0; // novo: contador de greens seguidos

  // ===== FILTROS =====
  startDate: string = '';
  endDate: string = '';

  // ===== MODAL =====
  showModal = false;
  selectedItem: any = null;
  listarTodos = false;

  modalLeft = 200;
  modalTop = 100;

  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private dragging = false;


  constructor(
    private ticketService: TicketService,
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

    // Pede a primeira página para descobrir se há várias páginas
    this.ticketService.getHistoricoBilhetes(
      1,
      this.pageSize,
      this.startDate,
      this.endDate,
      this.listarTodos
    ).subscribe({
      next: (resp: any) => {
        const pages = resp.pages || 1;

        // Se só tiver 1 página, usa os itens retornados
        if (pages <= 1) {
          this.items = (resp.items || []).map((t: any) => this.mapTicket(t));
          this.page = resp.page || 1;
          this.pages = resp.pages || 0;
          this.computeConsecutiveGreens();

          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        // Se houver várias páginas, buscar todas (em paralelo) e concatenar
        const calls = [];
        for (let p = 1; p <= pages; p++) {
          calls.push(this.ticketService.getHistoricoBilhetes(p, this.pageSize, this.startDate, this.endDate, this.listarTodos));
        }

        forkJoin(calls).subscribe({
          next: (responses: any[]) => {
            let all: any[] = [];
            responses.forEach(r => { all = all.concat(r.items || []); });

            this.items = (all || []).map((t: any) => this.mapTicket(t));

            // Sem paginação: exibimos tudo e ajustamos contadores para página única
            this.page = 1;
            this.pages = 1;

            this.computeConsecutiveGreens();

            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Erro ao carregar histórico (multipagens)', err);
            this.items = [];
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
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
  // HELPERS
  // =============================
  private mapTicket(t: any) {
    return {
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
    };
  }

  private computeConsecutiveGreens() {
    // Agora conta o total de bilhetes com resultado GREEN na lista carregada
    this.consecutiveGreens = this.items.filter(it => it.result === 'GREEN').length;
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

  listarAtivos(): void {
    this.listarTodos = false;
    this.loadHistorico(1);
  }

  listarTodosBilhetes(): void {
    this.listarTodos = true;
    this.loadHistorico(1);
  }

}
