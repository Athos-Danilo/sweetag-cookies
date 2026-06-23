import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CampaignData {
  id: number;
  total_goal: number;
  current_arrecadado: number;
  motivational_text: string;
  show_publicly: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getCampaign(): Observable<CampaignData> {
    return this.http.get<CampaignData>(`${this.apiUrl}/campaign`);
  }

  updateCampaign(data: Partial<CampaignData>): Observable<CampaignData> {
    return this.http.put<CampaignData>(`${this.apiUrl}/admin/campaign`, data);
  }

  getOrders(status?: string): Observable<any[]> {
    const url = status ? `${this.apiUrl}/admin/orders?status=${status}` : `${this.apiUrl}/admin/orders`;
    return this.http.get<any[]>(url);
  }

  approvePix(orderId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/orders/${orderId}/approve-pix`, {});
  }

  updateOrderStatus(orderId: number, status: string, status_step: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/admin/orders/${orderId}/status`, {
      status,
      status_step
    });
  }
}
