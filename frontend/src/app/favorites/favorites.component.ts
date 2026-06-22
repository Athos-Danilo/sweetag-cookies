import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';
import { FavoriteService } from '../core/services/favorite.service';
import { CookieService, CookieItem } from '../core/services/cookie.service';
import { Product } from '../core/models/product.model';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { ProductModalComponent } from '../shared/components/product-modal/product-modal.component';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterLink, FooterComponent, ProductModalComponent],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss'
})
export class FavoritesComponent {
  protected authService = inject(AuthService);
  protected cartService = inject(CartService);
  protected favoriteService = inject(FavoriteService);
  protected cookieService = inject(CookieService);
  protected router = inject(Router);

  protected quantity = signal(1);
  protected isLoggedIn = this.authService.isLoggedIn;

  // Selected cookie details for the modal
  protected selectedCookieDetail = signal<CookieItem | null>(null);

  // Mapped list of favorite cookies
  protected favoriteCookies = computed(() => {
    const ids = this.favoriteService.favoriteIds();
    return ids.map(id => this.cookieService.getCookieById(id)).filter((c): c is CookieItem => !!c);
  });

  // O "Mais Vendido" - Mock do Cookie Skinner para não-logados
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

  protected decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  protected increaseQuantity() {
    this.quantity.update(q => q + 1);
  }

  protected confirmAddToCart() {
    this.adicionarAoCarrinho(this.bestSeller, this.quantity());
  }

  protected adicionarAoCarrinho(cookie: CookieItem, quantity: number = 1) {
    const product: Product = {
      id: cookie.id,
      name: cookie.nome,
      theme: cookie.categoria,
      description: cookie.diagnostico,
      price: cookie.valor,
      imageUrl: cookie.imagem,
      ingredients: cookie.ingredientes,
      nutritionalInfo: cookie.valorEnergetico,
      stock: 50,
      availableToday: true
    };
    
    for (let i = 0; i < quantity; i++) {
      this.cartService.addToCart(product);
    }
    
    this.router.navigate(['/cart']);
  }

  protected desfavoritar(cookieId: string, event: Event) {
    event.stopPropagation();
    this.favoriteService.toggleFavorite(cookieId);
  }

  protected openCookieModal(cookie: CookieItem) {
    this.selectedCookieDetail.set(cookie);
    document.body.style.overflow = 'hidden';
  }

  protected closeCookieModal() {
    this.selectedCookieDetail.set(null);
    document.body.style.overflow = '';
  }
}
