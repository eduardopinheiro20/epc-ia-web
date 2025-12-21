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

  getJogosFuturos() {
    return this.http.get(`${this.api}/jogos-futuros`);
  }

  getJogosEncerrados(filters: any) {
    return this.http.get(`${this.api}/jogos-historicos`, { params: filters });
  }


}
