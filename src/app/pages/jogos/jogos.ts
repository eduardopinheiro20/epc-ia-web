import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IaService } from '../../services/ia.service';

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

  // ---- FUTUROS ----
  allFuturos: any[] = [];
  futurosFiltrados: any[] = [];

  // ---- ENCERRADOS ----
  encerrados: any[] = [];
  encerradosPage = 1;
  encerradosPages = 1;

  // ---- FILTROS ----
  qTeam = '';
  qLiga = '';
  qPlacar = '';
  startDate: string | null = null;
  endDate: string | null = null;
  dateSort: 'asc' | 'desc' = 'asc';

  // ---- PAGINAÇÃO DO FRONT PARA FUTUROS ----
  page = 1;
  size = 20;
  pages = 1;

  ligasList: string[] = [];

  constructor(
    private ia: IaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFuturos();
  }

  // ============================================================
  // 🔹 TROCA DE ABA
  // ============================================================
  setTab(tab: 'futuros' | 'encerrados') {
    this.activeTab = tab;

    if (tab === 'futuros') {
      this.loadFuturos();
    } else {
      this.loadEncerrados();
    }
  }

  // ============================================================
  // 🔹 FUTUROS — Backend SEM paginação (local no front)
  // ============================================================
  loadFuturos() {
    this.loading = true;

    this.ia.getJogosFuturos().subscribe({
      next: (res: any) => {
        this.allFuturos = res.items || [];

        this.allFuturos.forEach(j => j._dateObj = new Date(j.date));

        // Normaliza nomes (trim) para evitar entradas duplicadas por espaços/formatacao
        const leagues = this.allFuturos.map(j => (j.league || 'Outras Ligas').toString().trim());
        this.ligasList = [...new Set(leagues)].sort();

        this.applyFiltroFuturos();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (_) => { this.loading = false; }
    });
  }

  applyFiltroFuturos() {
    const qt = this.qTeam.toLowerCase();
    const ql = this.qLiga.toLowerCase();

    this.futurosFiltrados = this.allFuturos.filter(j => {
      if (qt && !j.home.toLowerCase().includes(qt) && !j.away.toLowerCase().includes(qt)) return false;

      // Para o filtro de Liga (seleção do dropdown) usamos igualdade case-insensitive
      if (ql) {
        const league = (j.league || '').toString().trim().toLowerCase();
        if (league !== ql) return false;
      }

      return true;
    });

    this.futurosFiltrados.sort((a, b) => {
      return this.dateSort === 'asc'
        ? a._dateObj - b._dateObj
        : b._dateObj - a._dateObj;
    });

    this.pages = Math.max(1, Math.ceil(this.futurosFiltrados.length / this.size));

    this.cdr.detectChanges();
  }

  private matchesScore(homeGoals: number, awayGoals: number, qp: string): boolean {
    const q = qp.trim();
    if (q.includes('-')) {
      const [hs, as] = q.split('-');
      if (hs !== '' && as !== '') {
        return Number(hs) === homeGoals && Number(as) === awayGoals;
      }
      if (hs !== '') {
        return Number(hs) === homeGoals;
      }
      if (as !== '') {
        return Number(as) === awayGoals;
      }
    }
    const scoreStr = `${homeGoals}-${awayGoals}`;
    return scoreStr.includes(q);
  }

  // ============================================================
  // 🔹 ENCERRADOS — Backend COM paginação
  // ============================================================
loadEncerrados() {
  this.loading = true;

  const params: any = {
    page: this.encerradosPage,
    size: this.size,
    sort: this.dateSort
  };

  // Só envia se tiver valor real
  if (this.qTeam && this.qTeam.trim() !== '') {
    params.team = this.qTeam.trim();
  }

  if (this.qLiga && this.qLiga.trim() !== '') {
    params.league = this.qLiga.trim();
  }

  if (this.startDate) {
    params.start = this.startDate + "T00:00:00";
  }

  if (this.endDate) {
    params.end = this.endDate + "T23:59:59";
  }

  this.ia.getJogosEncerrados(params).subscribe({
    next: (res: any) => {
      this.encerrados = res.items || [];

      // Filtra por placar somente nos jogos retornados nesta página (front-end)
      if (this.qPlacar && this.qPlacar.trim() !== '') {
        const qp = this.qPlacar.trim();
        this.encerrados = this.encerrados.filter(j => {
          const hg = j.home_goals;
          const ag = j.away_goals;
          if (hg == null || ag == null) return false;
          return this.matchesScore(hg, ag, qp);
        });
      }

      this.encerradosPages = res.pages || 1;
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error("Erro ao carregar encerrados:", err);
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}


  // ============================================================
  // 🔹 NAVEGAÇÃO DE PÁGINAS (ENCERRADOS)
  // ============================================================
  anteriorEnc() {
    if (this.encerradosPage > 1) {
      this.encerradosPage--;
      this.loadEncerrados();
    }
  }

  proximaEnc() {
    if (this.encerradosPage < this.encerradosPages) {
      this.encerradosPage++;
      this.loadEncerrados();
    }
  }

  // ============================================================
  // 🔹 FUNÇÃO GERAL DE FILTRAGEM
  // ============================================================
  applyFilters() {
    if (this.activeTab === 'futuros') {
      this.applyFiltroFuturos();
    } else {
      this.encerradosPage = 1;
      this.loadEncerrados();
    }
  }

  toggleDateSort() {
    this.dateSort = this.dateSort === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  limparFiltros() {
    this.qTeam = '';
    this.qLiga = '';
    this.qPlacar = '';
    this.startDate = null;
    this.endDate = null;
    this.applyFilters();
  }

  // ============================================================
  // PAGINAÇÃO LOCAL (FUTUROS)
  // ============================================================
  get pageItemsFuturos() {
    const ini = (this.page - 1) * this.size;
    return this.futurosFiltrados.slice(ini, ini + this.size);
  }

  anteriorFut() {
    if (this.page > 1) {
      this.page--;
      this.applyFiltroFuturos();
    }
  }

  proximaFut() {
    if (this.page < this.pages) {
      this.page++;
      this.applyFiltroFuturos();
    }
  }

  get totalFuturosFiltrados(): number {
    return this.allFuturos?.length || 0;
  }

  get totalEncerradosPagina(): number {
    return this.encerrados?.length || 0;
  }

}
