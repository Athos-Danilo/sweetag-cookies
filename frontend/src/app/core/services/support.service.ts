import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SupportTicketCreate {
  category: string;
  orderId?: string | null;
  message: string;
}

export interface SupportTicketResponse {
  id: number;
  category: string;
  order_id: string | null;
  message: string;
  user_id: number | null;
  status: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private apiUrl = `${environment.apiUrl}/support/tickets`;

  constructor(private http: HttpClient) {}

  createTicket(ticket: SupportTicketCreate): Observable<SupportTicketResponse> {
    return this.http.post<SupportTicketResponse>(this.apiUrl, ticket);
  }
}
