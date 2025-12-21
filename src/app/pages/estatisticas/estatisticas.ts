import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { StatisticsService } from '../../services/StatisticsService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-estatisticas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estatisticas.html',
  styleUrls: ['./estatisticas.css']
})
export class EstatisticasComponent implements OnInit {

  loading = true;
  allStats: any[] = [];
  filtered: any[] = [];
  pageItems: any[] = [];

  qTeam = '';
  qLiga = '';
  ligas: string[] = [];

  // data filter
  startDate: any = '';
  endDate: any = '';

  // pagination
  page = 1;
  pageSize = 10;
  pages = 1;

  // date sort: 'asc' | 'desc' | null
  dateSort: 'asc' | 'desc' | null = null;

  constructor(private statsService: StatisticsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.statsService.getAll().subscribe(data => {
      // converter data string para objeto Date (ou null)
      data.forEach(f => {
        f._dateObj = f.date ? new Date(f.date) : null;
      });

      this.allStats = data;
      this.filtered = [...this.allStats];

      this.ligas = [...new Set(data.map(x => x.league))];

      this.updatePage();
      this.loading = false;
      this.cdr.detectChanges();
    }, err => {
      console.error('Erro ao carregar estatísticas', err);
      this.loading = false;
    });
  }

  applyFilters() {
    this.filtered = this.allStats.filter(g => {

      // team filter
      const teamMatch =
        !this.qTeam ||
        (g.home?.teamName && g.home.teamName.toLowerCase().includes(this.qTeam.toLowerCase())) ||
        (g.away?.teamName && g.away.teamName.toLowerCase().includes(this.qTeam.toLowerCase()));

      // league filter
      const ligaMatch = !this.qLiga || g.league === this.qLiga;

      // date range filter
      const dateMatch = (() => {
        // if no date on record and a date filter is set -> exclude
        if (!g._dateObj) {
          // include only if neither start nor end specified
          return !this.startDate && !this.endDate;
        }

        if (this.startDate) {
          const start = new Date(this.startDate);
          // normalize start to 00:00
          start.setHours(0, 0, 0, 0);
          if (g._dateObj < start) return false;
        }

        if (this.endDate) {
          const end = new Date(this.endDate);
          // set end to end of day
          end.setHours(23, 59, 59, 999);
          if (g._dateObj > end) return false;
        }

        return true;
      })();

      return teamMatch && ligaMatch && dateMatch;
    });

    // se houver ordenação ativa, reaplicar
    if (this.dateSort) {
      this.sortByDate(this.dateSort);
    }

    this.page = 1;
    this.updatePage();
  }

  resetFilters() {
    this.qTeam = '';
    this.qLiga = '';
    this.startDate = '';
    this.endDate = '';
    this.filtered = [...this.allStats];

    // reset sorting as well if you want:
    // this.dateSort = null;

    this.page = 1;
    this.updatePage();
  }

  updatePage() {
    this.pages = Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
    const start = (this.page - 1) * this.pageSize;
    this.pageItems = this.filtered.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.page < this.pages) {
      this.page++;
      this.updatePage();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.updatePage();
    }
  }

  // -------------------------
  // Ordenação por Data
  // -------------------------
  toggleDateSort() {
    if (this.dateSort === null) {
      this.dateSort = 'asc';
    } else if (this.dateSort === 'asc') {
      this.dateSort = 'desc';
    } else {
      this.dateSort = null;
    }

    if (this.dateSort) {
      this.sortByDate(this.dateSort);
    } else {
      // se removemos a ordenação, restaurar ordem natural (por fixtureId)
      this.filtered = [...this.filtered].sort((a, b) => (a.fixtureId || 0) - (b.fixtureId || 0));
    }

    this.page = 1;
    this.updatePage();
  }

  private sortByDate(direction: 'asc' | 'desc') {
    this.filtered.sort((a, b) => {
      const da: Date | null = a._dateObj ?? null;
      const db: Date | null = b._dateObj ?? null;

      // colocar nulos por último
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;

      if (direction === 'asc') {
        return da.getTime() - db.getTime();
      } else {
        return db.getTime() - da.getTime();
      }
    });
  }
}