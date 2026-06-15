import { Component, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- A cortina de fundo desliza para cima com a classe .slide-up -->
    <div class="preloader-overlay" [class.slide-up]="isFadingOut">
      <!-- Container oculto para pré-carregamento dos PNGs (evita oscilação de tela) -->
      <div style="display: none;">
        <img src="assets/fotos/1.png" alt="preload" />
        <img src="assets/fotos/2.png" alt="preload" />
        <img src="assets/fotos/3.png" alt="preload" />
        <img src="assets/fotos/4.png" alt="preload" />
        <img src="assets/fotos/5.png" alt="preload" />
      </div>
 
      <!-- O conteúdo interno desaparece e desliza para cima com efeito de paralaxe -->
      <div class="preloader-content">
        <!-- Imagem do Cookie Animado (PNG) com efeito elástico de desaparecer -->
        <div class="cookie-wrapper" 
             [class.bite-pulse]="isBiting" 
             [class.fully-eaten]="stage() === 6">
          <img [src]="'assets/fotos/' + (stage() <= 5 ? stage() : 5) + '.png'" class="cookie-img" alt="Cookie" />
        </div>
 
        <!-- Título do Projeto -->
        <h1 class="brand-title" [class.fully-eaten]="stage() === 6">SweetAg Cookies</h1>
      </div>
    </div>
  `,
  styles: [`
    /* Fundo degradê original (bem quente: laranja/pêssego) */
    .preloader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: radial-gradient(circle, rgba(241, 195, 153, 0.5) 0%, rgba(255, 144, 0, 0.5) 100%), #FAF8F5;
      z-index: 99999;
      overflow: hidden;
      transform: translateY(0);
      /* Sombra projetada na parte inferior para dar nítida separação ao subir */
      box-shadow: 0 25px 70px rgba(46, 28, 18, 0.25);
      /* Transição de subida de cortina ultra-suave com bezier premium */
      transition: transform 0.5s cubic-bezier(0.85, 0, 0.15, 1);
    }

    /* Transiciona para o degradê oficial da homepage no final da animação */
    .preloader-overlay::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 50% 0%, #FAF8F5 0%, #FAF2E6 40%, #F5ECD7 100%);
      z-index: -1;
      opacity: 0;
      animation: transitionToHomeGradient 3.7s cubic-bezier(0.25, 1, 0.5, 1) forwards;
    }
 
    /* Animação da Cortina Deslizando para Cima (Opção A) */
    .preloader-overlay.slide-up {
      transform: translateY(-100%);
    }
 
    /* Conteúdo interno com efeito de paralaxe no encerramento */
    .preloader-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      z-index: 1;
      transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease-out;
    }
 
    /* Durante o deslizamento, o conteúdo interno move-se para cima mais rápido e some */
    .preloader-overlay.slide-up .preloader-content {
      transform: translateY(-100px);
      opacity: 0;
    }
 
    /* Container do Cookie (Grande e centralizado) */
    .cookie-wrapper {
      width: 150px;
      height: 150px;
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: scale(1);
      opacity: 0; /* Inicia invisível para a animação */
      animation: cookieBounceIn 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      /* Transição elástica premium para encolhimento do último pedaço */
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out;
    }
 
    .cookie-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 12px 28px rgba(46, 28, 18, 0.12));
    }
 
    /* Micro-animação: leve encolhimento e rotação ao mudar a imagem (simulando a mordida) */
    .cookie-wrapper.bite-pulse {
      transform: scale(0.92) rotate(-3deg) !important;
    }
 
    /* Animação do Último Pedaço sendo comido (Encolhe elasticamente até sumir) */
    .cookie-wrapper.fully-eaten {
      transform: scale(0) !important;
      opacity: 0 !important;
    }
 
    /* Título do Projeto */
    .brand-title {
      font-family: 'Epilogue', 'Plus Jakarta Sans', sans-serif;
      font-size: 2.2rem;
      font-weight: 800;
      color: #2E1C12; /* marrom profundo oficial */
      letter-spacing: -0.03em;
      opacity: 0;
      transform: translateY(10px);
      animation: fadeInUp 1s cubic-bezier(0.25, 1, 0.5, 1) 0.1s forwards;
      /* Transição elástica suave para a saída sincronizada */
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out;
    }
 
    /* Sincroniza a saída do título com o desaparecimento do cookie */
    .brand-title.fully-eaten {
      transform: scale(0) !important;
      opacity: 0 !important;
    }
 
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Animação de entrada do cookie (zoom e elasticidade suave) */
    @keyframes cookieBounceIn {
      0% {
        opacity: 0;
        transform: scale(0.4) rotate(-10deg);
      }
      70% {
        transform: scale(1.08) rotate(3deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
      }
    }

    /* Animação para transicionar o degradê suavemente até o final da animação */
    @keyframes transitionToHomeGradient {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
 
    /* Tablet (Telas médias) */
    @media (max-width: 1024px) {
      .brand-title {
        font-size: 1.8rem;
      }
      .cookie-wrapper {
        width: 120px;
        height: 120px;
        margin-bottom: 1.5rem;
      }
    }

    /* Mobile (Telas pequenas) */
    @media (max-width: 768px) {
      .brand-title {
        font-size: 1.4rem;
      }
      .cookie-wrapper {
        width: 95px;
        height: 95px;
        margin-bottom: 1.2rem;
      }
    }
  `]
})
export class PreloaderComponent implements OnInit {
  @Output() finished = new EventEmitter<void>();
  @Output() slideStart = new EventEmitter<void>(); // Evento disparado ao iniciar o slide
 
  // Começa no estágio 1 (1.png) e avança até 6 (6 = totalmente comido/scale 0)
  protected readonly stage = signal<number>(1);
  protected isBiting = false;
  protected isFadingOut = false;
 
  ngOnInit() {
    this.runAnimationSequence();
  }
 
  private runAnimationSequence() {
    const nextStep = () => {
      const currentStage = this.stage();
      if (currentStage < 5) {
        // Mordidas sequenciais (estágios 1 a 4)
        this.isBiting = true;
        this.stage.update(s => s + 1);
        
        setTimeout(() => {
          this.isBiting = false;
        }, 120);

        // Próximo estágio em 400ms
        setTimeout(nextStep, 400);
      } else if (currentStage === 5) {
        // Transição do último pedaço (estágio 5 para 6: encolhimento elástico)
        this.stage.update(s => s + 1); // stage = 6 (ativa .fully-eaten)
        
        // Aguarda 100ms (imediato após sumir a imagem) para começar a deslizar a cortina
        setTimeout(() => {
          this.triggerSlideLeft();
        }, 100);
      }
    };

    // A primeira imagem (cookie inteiro) fica na tela por 2000ms (1s de entrada + 1s estático)
    setTimeout(nextStep, 2000);
  }
 
  private triggerSlideLeft() {
    this.isFadingOut = true; // Ativa a classe .slide-up na cortina
    this.slideStart.emit(); // Emite o sinal de início de revelação
    
    // Aguarda o término do deslizamento da cortina (500ms) para remover o componente do DOM
    setTimeout(() => {
      this.finished.emit();
    }, 500);
  }
}
