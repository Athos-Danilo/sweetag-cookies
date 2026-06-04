import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    // O carrinho agora inicia vazio, aguardando os itens da Homepage
  }

  private addMockData() {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Cookie "Freud Supremo"',
        theme: 'Psicanálise',
        description: 'Para os desejos mais profundos do seu id. Gotas intensas de chocolate amargo.',
        price: 8.0,
        imageUrl: 'assets/cookies/freud.webp', // Substituir por imagens reais depois
        ingredients: ['Farinha', 'Açúcar Mascavo', 'Chocolate Amargo 70%'],
        nutritionalInfo: '350 kcal',
        stock: 10,
        availableToday: true
      },
      {
        id: '2',
        name: 'Cookie "Jean Piaget"',
        theme: 'Epistemologia Genética',
        description: 'Em constante processo de adaptação e assimilação de sabor. Recheio de Nutella.',
        price: 9.5,
        imageUrl: 'assets/cookies/piaget.webp',
        ingredients: ['Farinha', 'Açúcar', 'Nutella', 'Nozes'],
        nutritionalInfo: '400 kcal',
        stock: 5,
        availableToday: true
      }
    ];

    this.addToCart(mockProducts[0]);
    this.addToCart(mockProducts[1]);
    this.updateQuantity('2', 2); // 2 cookies piaget
  }

  get cartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  addToCart(product: Product) {
    const items = this.cartItems;
    const existingItem = items.find(item => item.product.id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
        this.cartItemsSubject.next([...items]);
      }
    } else {
      this.cartItemsSubject.next([...items, { product, quantity: 1 }]);
    }
  }

  removeFromCart(productId: string) {
    const items = this.cartItems.filter(item => item.product.id !== productId);
    this.cartItemsSubject.next(items);
  }

  updateQuantity(productId: string, quantity: number) {
    const items = this.cartItems;
    const item = items.find(i => i.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else if (quantity <= item.product.stock) {
        item.quantity = quantity;
        this.cartItemsSubject.next([...items]);
      }
    }
  }

  clearCart() {
    this.cartItemsSubject.next([]);
  }

  getTotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  }

  getItemCount(): number {
    return this.cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }
}
