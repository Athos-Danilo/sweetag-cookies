import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { Product } from '../core/models/product.model';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { ProductModalComponent } from '../shared/components/product-modal/product-modal.component';
import { CookieService, CookieItem } from '../core/services/cookie.service';

const PSYCHOLOGY_QUOTES = [
  { text: 'Quem olha para fora sonha, quem olha para dentro desperta.', author: 'Carl Jung' },
  { text: 'Eu não sou o que aconteceu comigo, eu sou o que escolhi me tornar.', author: 'Carl Jung' },
  { text: 'Conheça todas as teorias, domine todas as técnicas, mas ao tocar uma alma humana, seja apenas outra alma humana.', author: 'Carl Jung' },
  { text: 'Até que você torne o inconsciente consciente, ele direcionará sua vida e você o chamará de destino.', author: 'Carl Jung' },
  { text: 'Tudo o que nos irrita nos outros pode nos levar a uma compreensão de nós mesmos.', author: 'Carl Jung' },
  { text: 'Olhe para dentro, para as suas profundezas, aprenda primeiro a se conhecer.', author: 'Sigmund Freud' },
  { text: 'A inteligência é o único meio que possuímos para guiar nossa conduta.', author: 'Sigmund Freud' },
  { text: 'Ser inteiramente honesto consigo mesmo é um bom exercício.', author: 'Sigmund Freud' },
  { text: 'Um dia, in retrospecto, os anos de luta parecerão os mais belos.', author: 'Sigmund Freud' },
  { text: 'A ciência moderna ainda não produziu um medicamento calmante tão eficaz quanto poucas palavras bondosas.', author: 'Sigmund Freud' },
  { text: 'Não considere nenhuma prática como imutável. Mude e esteja pronto para mudar novamente.', author: 'B.F. Skinner' },
  { text: 'A educação é o que sobrevive depois que tudo o que foi aprendido foi esquecido.', author: 'B.F. Skinner' },
  { text: 'Os homens agem sobre o mundo, modificam-no e, por sua vez, são modificados pelas consequências de suas ações.', author: 'B.F. Skinner' },
  { text: 'O comportamento é um produto da história de reforço do indivíduo.', author: 'B.F. Skinner' },
  { text: 'O principal objetivo da educação é criar pessoas capazes de fazer coisas novas.', author: 'Jean Piaget' },
  { text: 'A inteligência é o que você usa quando não sabe o que fazer.', author: 'Jean Piaget' },
  { text: 'As crianças não são garrafas que devem ser cheias, mas velas que devem ser acesas.', author: 'Jean Piaget' },
  { text: 'O curioso paradoxo é que quando me aceito como sou, então posso mudar.', author: 'Carl Rogers' },
  { text: 'A única pessoa que é educada é aquela que aprendeu a aprender e a mudar.', author: 'Carl Rogers' },
  { text: 'O grau em que posso criar relacionamentos que facilitam o crescimento dos outros é a medida do crescimento que alcancei em mim mesmo.', author: 'Carl Rogers' },
  { text: 'O desejo do homem é o desejo do Outro.', author: 'Jacques Lacan' },
  { text: 'Amar é dar o que não se tem a alguém que não o quer.', author: 'Jacques Lacan' },
  { text: 'Você pode saber o que disse, mas nunca o que o outro escutou.', author: 'Jacques Lacan' },
  { text: 'A verdade tem estrutura de ficção.', author: 'Jacques Lacan' },
  { text: 'O que um homem pode ser, ele deve ser.', author: 'Abraham Maslow' },
  { text: 'Se você planeja ser qualquer coisa menos do que aquilo que é capaz de ser, provavelmente será infeliz todos os dias da sua vida.', author: 'Abraham Maslow' },
  { text: 'Para quem só sabe usar martelo, todo problema se parece com um prego.', author: 'Abraham Maslow' },
  { text: 'Não há situação que não possa ser compreendida, nem há problema que não possa ser resolvido.', author: 'Alfred Adler' },
  { text: 'A única coisa que se pode fazer com a vida é segui-la.', author: 'Alfred Adler' },
  { text: 'O autoconhecimento é o começo da sabedoria, que é o fim do medo.', author: 'Jiddu Krishnamurti' },
  { text: 'O condicionamento social impede o pleno desenvolvimento do potencial humano.', author: 'Ivan Pavlov' },
  { text: 'Não há nada mais prático do que uma boa teoria.', author: 'Kurt Lewin' },
  { text: 'A vida é uma tarefa que nos foi dada para ser feita.', author: 'Viktor Frankl' },
  { text: 'Quem tem um porquê para viver pode suportar quase qualquer como.', author: 'Viktor Frankl' }
];

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [DecimalPipe, CommonModule, FooterComponent, ProductModalComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent implements OnInit, OnDestroy {
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

  // Typewriter Animation State
  protected displayText = signal<string>('Qual a sua prescrição de hoje?');
  protected displayAuthor = signal<string>('');
  protected isInitialPhrase = signal<boolean>(true);
  protected isCursorBlinking = signal<boolean>(true);
  protected showAuthor = signal<boolean>(false);
  protected isFadingOut = signal<boolean>(false);

  private typewriterTimeout: any;
  private isDestroyed = false;
  private readonly quotes = PSYCHOLOGY_QUOTES;

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

    // Inicia o loop das frases
    this.runLoop();
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }
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

  // Typewriter loop logic
  private async runLoop() {
    // Aguarda o preloader terminar se ele estiver ativo na página
    await this.waitForPreloader();
    if (this.isDestroyed) return;

    // 1. Exibir frase inicial por 3 segundos a partir do momento em que a página fica visível
    await this.sleep(3000);
    if (this.isDestroyed) return;

    // Embaralhar as frases para exibição aleatória sem repetição imediata
    let remainingQuotes = [...this.quotes];
    this.shuffleArray(remainingQuotes);
    let quoteIndex = 0;

    while (!this.isDestroyed) {
      // 2. Fade-out suave da frase atual antes de mudar (chama menos atenção que o backspace caractere por caractere)
      this.isFadingOut.set(true);
      await this.sleep(400); // Tempo para a animação do fade-out concluir no SCSS
      if (this.isDestroyed) return;

      this.displayText.set('');
      this.displayAuthor.set('');
      this.showAuthor.set(false);
      this.isFadingOut.set(false);

      await this.sleep(250); // Pausa muito breve no estado vazio
      if (this.isDestroyed) return;

      this.isInitialPhrase.set(false);

      // Pega a próxima frase
      if (quoteIndex >= remainingQuotes.length) {
        remainingQuotes = [...this.quotes];
        this.shuffleArray(remainingQuotes);
        quoteIndex = 0;
      }
      
      const currentQuote = remainingQuotes[quoteIndex++];
      
      // Digita a nova frase
      await this.typeSentence(currentQuote.text);
      if (this.isDestroyed) return;

      // Exibe o autor com fade-in
      this.displayAuthor.set(currentQuote.author);
      this.showAuthor.set(true);

      // Espera o tempo de leitura da frase (dobrado para 9 segundos/9000ms)
      await this.sleep(9000);
      if (this.isDestroyed) return;
    }
  }

  private async typeSentence(text: string) {
    this.isCursorBlinking.set(false); // Fica fixo durante a digitação
    for (let i = 0; i <= text.length; i++) {
      if (this.isDestroyed) return;
      this.displayText.set(text.substring(0, i));
      await this.sleep(45 + Math.random() * 25); // Velocidade de digitação natural e humana
    }
    this.isCursorBlinking.set(true); // Pisca quando termina
  }

  private sleep(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      this.typewriterTimeout = setTimeout(resolve, ms);
    });
  }

  private shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private async waitForPreloader() {
    while (this.isPreloaderActive() && !this.isDestroyed) {
      await this.sleep(100);
    }
  }

  private isPreloaderActive(): boolean {
    if (typeof document === 'undefined') return false;
    const preloaderOverlay = document.querySelector('.preloader-overlay');
    const layoutActive = document.querySelector('.app-layout-container.preloader-active');
    return !!(preloaderOverlay || layoutActive);
  }
}
