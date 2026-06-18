import { Component, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { Product } from '../core/models/product.model';
import { FooterComponent } from '../shared/components/footer/footer.component';

export interface CookieItem {
  id: string;
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

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, FooterComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent {
  protected authService = inject(AuthService);
  protected cartService = inject(CartService);
  protected router = inject(Router);

  protected quantity = signal(1);

  // O "Mais Vendido" - Mock do Cookie Skinner
  protected bestSeller: CookieItem = {
    id: '#SK-1904',
    nome: 'Cookie Skinner',
    sabor: 'Ninho Queimado',
    valor: 10.00,
    imagem: 'assets/fotos/Ninho%20queimado.png',
    diagnostico: 'Reforço positivo imediato após a primeira mordida.',
    categoria: 'Behaviorismo',
    peso: '130g',
    dimensoes: '9.5cm de diâmetro',
    ingredientes: ['Farinha de trigo premium', 'Manteiga', 'Açúcar mascavo', 'Leite Ninho tostado na frigideira', 'Brigadeiro branco cremoso', 'Essência de caramelo'],
    valorEnergetico: '480 kcal'
  };

  protected isLoggedIn = this.authService.isLoggedIn();

  protected decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  protected increaseQuantity() {
    this.quantity.update(q => q + 1);
  }

  protected confirmAddToCart() {
    const product: Product = {
      id: this.bestSeller.id,
      name: this.bestSeller.nome,
      theme: this.bestSeller.categoria,
      description: this.bestSeller.diagnostico,
      price: this.bestSeller.valor,
      imageUrl: this.bestSeller.imagem,
      ingredients: this.bestSeller.ingredientes,
      nutritionalInfo: this.bestSeller.valorEnergetico,
      stock: 50,
      availableToday: true
    };
    
    for (let i = 0; i < this.quantity(); i++) {
      this.cartService.addToCart(product);
    }
    
    this.router.navigate(['/cart']);
  }
}
