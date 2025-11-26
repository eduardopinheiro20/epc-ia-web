import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SaveResult } from '../models/save-result.model';

@Injectable({
  providedIn: 'root'
})
export class IaService {

  private api = 'http://localhost:8080/api/ia';

  constructor(private http: HttpClient) {}

  getBilhete(): Observable<any> {
    return this.http.get(`${this.api}/bilhete-do-dia`);
  }

  salvarBilhete(ticket: any) {
    return this.http.post<SaveResult>(`${this.api}/salvar`, { ticket });
  }

  getHistoricoBilhetes(page: number, size: number, start?: string | null, end?: string | null) {
    return this.http.get(`${this.api}/historico-bilhetes`, {
      params: {
        page,
        size,
        start: start ?? '',
        end: end ?? ''
      }
    });
  }

  getJogosFuturos() {
    return this.http.get(`${this.api}/jogos-futuros`);
  }

  getJogosEncerrados(start?: string, end?: string) {
    const params: any = {};

    if (start) params.start = start;
    if (end) params.end = end;

    return this.http.get<any>(`${this.api}/jogos-historicos`, { params });
  }

}
