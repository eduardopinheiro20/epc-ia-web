import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IaService } from '../../services/ia.service';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-jogos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jogos.html',
  styleUrls: ['./jogos.css']
})
export class JogosComponent implements OnInit {

  loading = true;

  activeTab: 'futuros' | 'encerrados' = 'futuros';

  allJogos: any[] = [];
  filteredJogos: any[] = [];

  ligasList: string[] = [];

  qTeam: string = '';
  qLiga: string = '';
  startDate: string | null = null;
  endDate: string | null = null;

  page = 1;
  size = 20;
  pages = 1;

  constructor(
    private ia: IaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  setTab(tab: 'futuros' | 'encerrados') {
    this.activeTab = tab;
    this.page = 1;
    this.load();
  }

  load() {
    this.loading = true;

    const req =
      this.activeTab === 'futuros'
        ? this.ia.getJogosFuturos()
        : this.ia.getJogosEncerrados(
            this.startDate ? `${this.startDate}T00:00:00` : undefined,
            this.endDate ? `${this.endDate}T23:59:59` : undefined
          );

    req.subscribe({
      next: (res: any) => {
        this.allJogos = (res.items || res) || [];

        this.allJogos.forEach(j => j._dateObj = j.date ? new Date(j.date) : null);

        const set = new Set<string>();
        this.allJogos.forEach(j => set.add(j.league ?? 'Outras Ligas'));
        this.ligasList = Array.from(set);

        this.applyFiltersLocal();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Erro ao carregar jogos', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // CHAMA O BACKEND SOMENTE NA ABA "encerrados"
  reloadBackendEncerrados() {
    if (this.activeTab !== 'encerrados') return;

    this.loading = true;

    this.ia.getJogosEncerrados(
      this.startDate ? `${this.startDate}T00:00:00` : undefined,
      this.endDate ? `${this.endDate}T23:59:59` : undefined
    ).subscribe({
      next: (res: any) => {
        this.allJogos = res.items || [];
        this.allJogos.forEach(j => j._dateObj = j.date ? new Date(j.date) : null);

        const set = new Set<string>();
        this.allJogos.forEach(j => set.add(j.league ?? 'Outras Ligas'));
        this.ligasList = Array.from(set);

        this.applyFiltersLocal();
        this.loading = false;
      }
    });
  }

  // FILTRO PARA QUANDO JÁ TEMOS OS DADOS
  applyFiltersLocal() {
    const qTeam = (this.qTeam || '').toLowerCase();
    const qLiga = (this.qLiga || '').toLowerCase();

    this.filteredJogos = this.allJogos.filter(j => {
      if (qTeam) {
        const home = (j.home || '').toLowerCase();
        const away = (j.away || '').toLowerCase();
        if (!home.includes(qTeam) && !away.includes(qTeam)) return false;
      }

      if (qLiga) {
        const liga = (j.league || '').toLowerCase();
        if (!liga.includes(qLiga)) return false;
      }

      return true;
    });

    this.filteredJogos.sort((a, b) => {
      if (!a._dateObj) return 1;
      if (!b._dateObj) return -1;
      return a._dateObj.getTime() - b._dateObj.getTime();
    });

    this.pages = Math.max(1, Math.ceil(this.filteredJogos.length / this.size));
  }

  // ESTA FUNÇÃO DECIDE O QUE FAZER DEPENDENDO DA ABA
  applyFilters() {
    // Se for aba FUTUROS → sempre local
    if (this.activeTab === 'futuros') {
      this.applyFiltersLocal();
      return;
    }

    // Se for aba ENCERRADOS → somente data chama backend
    const changedDateFilter =
      (this.startDate !== null && this.startDate !== '') ||
      (this.endDate !== null && this.endDate !== '');

    if (changedDateFilter) {
      this.reloadBackendEncerrados();
    } else {
      this.applyFiltersLocal();
    }
  }

  get pageItems() {
    const start = (this.page - 1) * this.size;
    return this.filteredJogos.slice(start, start + this.size);
  }

  anterior() {
    if (this.page > 1) this.page--;
  }

  proxima() {
    if (this.page < this.pages) this.page++;
  }

  limparFiltros() {
    this.qTeam = '';
    this.qLiga = '';
    this.startDate = null;
    this.endDate = null;
    this.applyFilters();
  }
}
