import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImportIssue {
  severity: 'ERROR' | 'WARNING';
  sheet?: string;
  row?: number;
  field?: string;
  message: string;
}

export interface FixtureImportPreview {
  fixtureRef: string;
  action: 'INSERIR' | 'ATUALIZAR';
  leagueName: string;
  leagueCountry: string;
  kickoffAt: string;
  status: string;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals?: number;
  awayGoals?: number;
  homeStatistics: boolean;
  awayStatistics: boolean;
  sourceCount: number;
}

export interface SpreadsheetImportResponse {
  valid: boolean;
  imported: boolean;
  fixturesRead: number;
  statisticsRead: number;
  sourcesRead: number;
  fixturesInserted: number;
  fixturesUpdated: number;
  leaguesInserted: number;
  teamsInserted: number;
  statisticsUpserted: number;
  sourcesInserted: number;
  issues: ImportIssue[];
  fixtures: FixtureImportPreview[];
}

@Injectable({ providedIn: 'root' })
export class SpreadsheetImportService {

  private readonly api = 'http://localhost:8080/api/importacoes/planilha';

  constructor(private http: HttpClient) {}

  validate(file: File): Observable<SpreadsheetImportResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<SpreadsheetImportResponse>(`${this.api}/validar`, form);
  }

  importWorkbook(file: File): Observable<SpreadsheetImportResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<SpreadsheetImportResponse>(`${this.api}/importar`, form);
  }

  downloadModel(): Observable<Blob> {
    return this.http.get(`${this.api}/modelo`, { responseType: 'blob' });
  }
}
