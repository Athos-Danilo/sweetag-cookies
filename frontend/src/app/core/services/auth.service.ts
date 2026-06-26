import { Injectable, inject, signal, computed } from '@angular/core';
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

  public readonly currentUser = signal<any>(this.getUser());
  public readonly isLoggedIn = computed(() => !!this.currentUser());

  login(whatsapp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      whatsapp
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
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
        this.currentUser.set(response.user);
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
    this.currentUser.set(null);
  }

  adminLogin(whatsapp: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/admin/login`, {
      whatsapp,
      password
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
      })
    );
  }

  verifySuperPassword(password: string): Observable<{ valid: boolean }> {
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/admin/verify-super-password`, {
      superadmin_password: password
    });
  }

  adminRegister(whatsapp: string, nome: string, password: string, superadminPassword?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/register`, {
      whatsapp,
      nome,
      password,
      superadmin_password: superadminPassword
    }).pipe(
      tap(response => {
        this.setToken(response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
      })
    );
  }

  adminRecover(whatsapp: string, recoveryCode: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/recover`, {
      whatsapp,
      recovery_code: recoveryCode,
      new_password: newPassword
    });
  }
}
