import { Component, signal, computed, OnInit } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { Product } from '../core/models/product.model';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { ProductModalComponent } from '../shared/components/product-modal/product-modal.component';

export interface CookieItem {
  id: string;
  nome: string;
  sabor: string;
  valor: number;
  imagem: string;
  diagnostico: string; // Detalhe divertido de psicologia para enriquecer o visual
  categoria: string;
  peso: string;
  dimensoes: string;
  ingredientes: string[];
  valorEnergetico: string;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [DecimalPipe, CommonModule, FooterComponent, ProductModalComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit {
  protected readonly cookies = signal<CookieItem[]>([
    {
      id: '#LC-1901',
      nome: 'Cookie Lacan',
      sabor: 'Kinder',
      valor: 10.00,
      imagem: 'assets/fotos/lacan.jpeg',
      diagnostico: 'Desejo inconsciente estruturado como uma linguagem de chocolate.',
      categoria: 'Psicanálise',
      peso: '120g',
      dimensoes: '9cm de diâmetro',
      ingredientes: ['Farinha de trigo premium', 'Manteiga importada', 'Açúcar mascavo', 'Ovos caipiras', 'Gotas de chocolate ao leite', 'Recheio cremoso de Kinder Bueno', 'Toque de baunilha'],
      valorEnergetico: '450 kcal'
    },
    {
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
    },
    {
      id: '#YG-1875',
      nome: 'Cookie Jung',
      sabor: 'Farinha Láctea',
      valor: 9.00,
      imagem: 'assets/fotos/Farinha%20l%C3%A1ctea.png',
      diagnostico: 'Uma jornada pelo inconsciente coletivo dos sabores da infância.',
      categoria: 'Psicologia Analítica',
      peso: '115g',
      dimensoes: '9cm de diâmetro',
      ingredientes: ['Farinha de trigo enriquecida', 'Manteiga sem sal', 'Farinha Láctea Nestlé', 'Açúcar demerara', 'Chocolate branco', 'Toque de mel'],
      valorEnergetico: '420 kcal'
    },
    {
      id: '#PG-1896',
      nome: 'Cookie Piaget',
      sabor: 'Nutella',
      valor: 10.00,
      imagem: 'assets/fotos/piaget.jpeg',
      diagnostico: 'Assimilação e acomodação de avelã em perfeita harmonia cognitiva.',
      categoria: 'Cognitivismo',
      peso: '140g',
      dimensoes: '10cm de diâmetro',
      ingredientes: ['Farinha de trigo premium', 'Manteiga extra', 'Açúcar cristal', 'Cacau em pó 50%', 'Recheio abundante de Nutella original', 'Avelãs trituradas'],
      valorEnergetico: '520 kcal'
    },
    {
      id: '#FD-1856',
      nome: 'Cookie Freud',
      sabor: 'Speculoos',
      valor: 9.00,
      imagem: 'assets/fotos/freud.jpeg',
      diagnostico: 'Onde o Id e o Superego concordam que a canela é irresistível.',
      categoria: 'Psicanálise',
      peso: '110g',
      dimensoes: '8.5cm de diâmetro',
      ingredientes: ['Farinha de trigo', 'Manteiga', 'Açúcar mascavo escuro', 'Canela em pó', 'Noz-moscada', 'Cravo moído', 'Pasta cremosa de biscoito Lotus Biscoff'],
      valorEnergetico: '410 kcal'
    },
    {
      id: '#CR-1902',
      nome: 'Cookie Carl Rogers',
      sabor: 'Tradicional',
      valor: 9.00,
      imagem: 'assets/fotos/tradicional.png',
      diagnostico: 'Aceitação incondicional de um clássico com gotas de chocolate.',
      categoria: 'Humanismo',
      peso: '115g',
      dimensoes: '9cm de diâmetro',
      ingredientes: ['Farinha de trigo premium', 'Manteiga integral', 'Açúcar cristal e mascavo', 'Extrato de baunilha Bourbon', 'Gotas de chocolate meio amargo 54%', 'Pitada de sal marinho'],
      valorEnergetico: '430 kcal'
    }
  ]);

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
    this.cartService.cartItems$.subscribe(() => {
      this.itemCount = this.cartService.getItemCount();
    });
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
