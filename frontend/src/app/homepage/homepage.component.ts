import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { Product } from '../core/models/product.model';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { ProductModalComponent } from '../shared/components/product-modal/product-modal.component';
import { CookieService, CookieItem } from '../core/services/cookie.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [DecimalPipe, CommonModule, FooterComponent, ProductModalComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
  private cookieService = inject(CookieService);
  protected readonly cookies = this.cookieService.cookies;

  protected readonly categories = ['Todos', 'Psicanálise', 'Behaviorismo', 'Psicologia Analítica', 'Cognitivismo', 'Humanismo'];
  protected selectedCategory = signal<string>('Todos');

  protected filteredCookies = computed(() => {
    const category = this.selectedCategory();
    if (category === 'Todos') {
      return this.cookies();
    }
    return this.cookies().filter(c => c.categoria === category);
  });

  protected itemCount = 0;
  protected readonly cartAnimating = signal<boolean>(false);
  
  // Modal State
  protected selectedCookieDetail = signal<CookieItem | null>(null);

  protected selectCategory(category: string) {
    this.selectedCategory.set(category);
  }

  protected openCookieModal(cookie: CookieItem) {
    this.selectedCookieDetail.set(cookie);
    document.body.style.overflow = 'hidden'; // Prevents background scrolling
  }

  protected closeCookieModal() {
    this.selectedCookieDetail.set(null);
    document.body.style.overflow = '';
  }

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit() {
    // Busca os produtos reais do backend
    this.cookieService.fetchCookies().subscribe({
      next: (data) => console.log('Cookies carregados:', data),
      error: (err) => console.error('Erro ao carregar cookies:', err)
    });

    this.cartService.cartItems$.subscribe(() => {
      this.itemCount = this.cartService.getItemCount();
    });
  }


  protected adicionarAoCarrinho(cookie: CookieItem, quantity: number = 1) {
    const product: Product = {
      id: String(cookie.id),
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
    
    this.cartAnimating.set(true);
    setTimeout(() => {
      this.cartAnimating.set(false);
    }, 500);
    
    if (this.selectedCookieDetail() !== null) {
      this.closeCookieModal();
    }
  }

  protected goToCart() {
    this.router.navigate(['/cart']);
  }
}
