// src/app/services/bankroll.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class BankrollService {
  private baseUrl = "http://localhost:8080/api/bankroll";

  constructor(private http: HttpClient) {}

  getBankroll(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  createBankroll(initial: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, { initial });
  }

  // endpoint que vincula um ticket à banca ativa
  linkTicket(ticket_id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/link-ticket`, { ticket_id });
  }

  resetBankroll(): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset`, {});
  }

  validarAutomatico(): Observable<any> {
    return this.http.post(`${this.baseUrl}/validar`, {});
  }

  cashout(finalValue: number) {
    return this.http.post(`${this.baseUrl}/cashout`, {
      finalValue
    });
  }


}
