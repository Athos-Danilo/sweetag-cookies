import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

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
}
