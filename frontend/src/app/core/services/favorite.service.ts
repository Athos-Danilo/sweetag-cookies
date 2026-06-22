import { Injectable, inject, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/favorites`;

  public readonly favoriteIds = signal<string[]>([]);

  constructor() {
    effect(() => {
      const loggedIn = this.authService.isLoggedIn();
      if (loggedIn) {
        this.loadFavorites();
      } else {
        this.favoriteIds.set([]);
      }
    });
  }

  async loadFavorites() {
    try {
      const ids = await firstValueFrom(this.http.get<string[]>(this.apiUrl));
      this.favoriteIds.set(ids);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  async toggleFavorite(productId: string) {
    if (!this.authService.isLoggedIn()) {
      return false; // Not logged in
    }

    const currentIds = this.favoriteIds();
    const isFavorited = currentIds.includes(productId);

    try {
      if (isFavorited) {
        // Optimistic UI update
        this.favoriteIds.update(ids => ids.filter(id => id !== productId));
        await firstValueFrom(this.http.delete(`${this.apiUrl}/${encodeURIComponent(productId)}`));
      } else {
        // Optimistic UI update
        this.favoriteIds.update(ids => [...ids, productId]);
        await firstValueFrom(this.http.post(this.apiUrl, { product_id: productId }));
      }
      return true;
    } catch (error) {
      // Revert optimistic update on error
      console.error('Error toggling favorite:', error);
      this.loadFavorites(); // Reload true state from server
      return false;
    }
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIds().includes(productId);
  }
}
