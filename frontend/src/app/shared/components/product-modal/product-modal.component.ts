import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FavoriteService } from '../../../core/services/favorite.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss']
})
export class ProductModalComponent {
  @Input() cookie!: any; // Accepts CookieItem
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<{cookie: any, quantity: number}>();

  private favoriteService = inject(FavoriteService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  quantity = signal(1);

  closeModal() {
    this.close.emit();
  }

  increaseQuantity() {
    this.quantity.update(q => q + 1);
  }

  decreaseQuantity() {
    this.quantity.update(q => (q > 1 ? q - 1 : 1));
  }

  confirmAddToCart() {
    this.addToCart.emit({ cookie: this.cookie, quantity: this.quantity() });
  }

  isFavorite(): boolean {
    return this.favoriteService.isFavorite(this.cookie.id);
  }

  async toggleFavorite() {
    const isLoggedIn = await this.favoriteService.toggleFavorite(this.cookie.id);
    if (!isLoggedIn) {
      this.notificationService.showToast('Faça login para salvar seus favoritos! 🧠🍪');
      this.router.navigate(['/login']);
      this.closeModal();
    }
  }
}

