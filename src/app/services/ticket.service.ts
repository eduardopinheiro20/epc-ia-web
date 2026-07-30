import { Injectable } from "@angular/core";
import { SaveResult } from "../models/save-result.model";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private baseUrl = 'http://localhost:8080/api/ticket';

  constructor(private http: HttpClient) {}

  salvarBilhete(ticket: any) {
    return this.http.post<SaveResult>(`${this.baseUrl}/salvar`, { ticket });
  }


   getHistoricoBilhetes(
    page: number,
    size: number,
    start?: string,
    end?: string,
    all: boolean = false
  ): Observable<{ items: any[]; page: number; pages: number }> {

    return this.http.get<any>(`${this.baseUrl}/historico-bilhetes`, {
      params: {
        page,
        size,
        start: start || '',
        end: end || '',
        all
      }
    }).pipe(
      map(resp => ({
        items: resp.items ?? [],
        page: resp.page ?? 1,
        pages: resp.pages ?? 0
      }))
    );
  }

}