import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
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

    // posição do modal (em px)
  modalLeft = 0;
  modalTop = 0;

  // arraste
  private dragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  @ViewChild('modalBox', { read: ElementRef }) modalBox!: ElementRef;

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

    // posiciona no centro abaixo do navbar inicialmente
    const width = 600; // corresponde a w-[600px]
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // calc top: 12% do viewport ou 80px se navbar fixo, adaptável
    const initialTop = Math.max(80, Math.floor(viewportH * 0.12));

    this.modalLeft = Math.round((viewportW - width) / 2);
    this.modalTop = initialTop;

    // small timeout to ensure element exists
    setTimeout(() => {
      // ensure modal is inside viewport if smaller screens
      this.ensureInBounds();
    }, 0);
  }


  // --- mouse drag handlers ---
  startDrag(evt: MouseEvent) {
    // apenas botão esquerdo
    if (evt.button !== 0) return;
    this.dragging = true;
    const el = this.modalBox?.nativeElement as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.dragOffsetX = evt.clientX - rect.left;
    this.dragOffsetY = evt.clientY - rect.top;

    // muda cursor
    el.style.cursor = 'grabbing';
    evt.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(evt: MouseEvent) {
    if (!this.dragging) return;
    this.modalLeft = Math.round(evt.clientX - this.dragOffsetX);
    this.modalTop = Math.round(evt.clientY - this.dragOffsetY);
    this.ensureInBounds();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(evt: MouseEvent) {
    if (!this.dragging) return;
    this.dragging = false;
    const el = this.modalBox?.nativeElement as HTMLElement;
    if (el) el.style.cursor = 'grab';
  }

  // --- touch handlers ---
  startTouchDrag(evt: TouchEvent) {
    if (!evt.touches || evt.touches.length === 0) return;
    this.dragging = true;
    const touch = evt.touches[0];
    const el = this.modalBox?.nativeElement as HTMLElement;
    const rect = el.getBoundingClientRect();
    this.dragOffsetX = touch.clientX - rect.left;
    this.dragOffsetY = touch.clientY - rect.top;
    evt.preventDefault();
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(evt: TouchEvent) {
    if (!this.dragging) return;
    const touch = evt.touches[0];
    this.modalLeft = Math.round(touch.clientX - this.dragOffsetX);
    this.modalTop = Math.round(touch.clientY - this.dragOffsetY);
    this.ensureInBounds();
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd(evt: TouchEvent) {
    if (!this.dragging) return;
    this.dragging = false;
  }

  // Garante que o modal não saia da viewport
  ensureInBounds() {
    const el = this.modalBox?.nativeElement as HTMLElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (rect.width > vw) {
      this.modalLeft = 8;
    } else {
      if (this.modalLeft < 8) this.modalLeft = 8;
      if (this.modalLeft + rect.width > vw - 8) this.modalLeft = vw - rect.width - 8;
    }

    if (rect.height > vh - 40) {
      // keep top small gap
      if (this.modalTop < 8) this.modalTop = 8;
      if (this.modalTop + rect.height > vh - 8) this.modalTop = vh - rect.height - 8;
    } else {
      if (this.modalTop < 8) this.modalTop = 8;
      if (this.modalTop + rect.height > vh - 8) this.modalTop = vh - rect.height - 8;
    }
  }

  // opcional: recompute bounds on resize
  @HostListener('window:resize')
  onResize() {
    this.ensureInBounds();
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
