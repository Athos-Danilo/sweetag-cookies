import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItemCreate {
  product_id?: number;
  name: string;
  quantity: number;
  price: number;
}

export interface OrderCreatePayload {
  address_id: number;
  total: number;
  payment_method: string;
  items: OrderItemCreate[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  createOrder(payload: OrderCreatePayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
