import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  login(whatsapp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      whatsapp
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  register(whatsapp: string, nome: string, aceitaNotificacoes: boolean): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
      whatsapp,
      nome,
      aceitaNotificacoes
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
