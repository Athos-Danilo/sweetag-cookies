import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CookieItem {
  id: number | string;
  name?: string;
  description?: string;
  history_branding?: string;
  ingredients?: string;
  nutritional_table?: any;
  image_url?: string;
  price?: number;
  stock_quantity?: number;
  daily_availability?: boolean;
  is_active?: boolean;

  // Propriedades de compatibilidade legada para compatibilidade de templates
  nome: string;
  sabor: string;
  valor: number;
  imagem: string;
  diagnostico: string;
  categoria: string;
  peso: string;
  dimensoes: string;
  ingredientes: string[];
  valorEnergetico: string;
}

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  private http = inject(HttpClient);
  
  // Sinal reativo que mantém o estado da listagem dos cookies
  public readonly cookies = signal<CookieItem[]>([]);

  // Carrega cookies da API e popula o signal
  fetchCookies(): Observable<CookieItem[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/products`).pipe(
      map(products => products.map(p => this.mapToCookieItem(p))),
      tap(mappedCookies => {
        this.cookies.set(mappedCookies);
      })
    );
  }

  getCookieById(id: string | number): CookieItem | undefined {
    return this.cookies().find(c => String(c.id) === String(id));
  }

  // Método auxiliar de mapeamento do backend para o frontend
  private mapToCookieItem(product: any): CookieItem {
    const nutrition = product.nutritional_table || {};
    return {
      ...product,
      // Mapeamento legado
      nome: product.name,
      sabor: product.description ? product.description.split('.')[0] : product.name, // Sabor ou resumo
      valor: product.price,
      imagem: product.image_url || 'assets/fotos/default.png',
      diagnostico: product.description || '',
      categoria: product.history_branding || 'Psicologia',
      peso: nutrition.peso || '120g',
      dimensoes: nutrition.dimensoes || '9cm de diâmetro',
      ingredientes: product.ingredients 
        ? product.ingredients.split(',').map((i: string) => i.trim()) 
        : [],
      valorEnergetico: nutrition.valorEnergetico || '400 kcal'
    };
  }
}
