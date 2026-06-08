import { Component, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- A cortina de fundo desliza para a esquerda com a classe .slide-left -->
    <div class="preloader-overlay" [class.slide-left]="isFadingOut">
      <!-- Container oculto para pré-carregamento dos PNGs (evita oscilação de tela) -->
      <div style="display: none;">
        <img src="assets/fotos/1.png" alt="preload" />
        <img src="assets/fotos/2.png" alt="preload" />
        <img src="assets/fotos/3.png" alt="preload" />
        <img src="assets/fotos/4.png" alt="preload" />
        <img src="assets/fotos/5.png" alt="preload" />
      </div>

      <!-- O conteúdo interno desaparece e desliza para a esquerda com efeito de paralaxe -->
      <div class="preloader-content">
        <!-- Imagem do Cookie Animado (PNG) com efeito elástico de desaparecer -->
        <div class="cookie-wrapper" 
             [class.bite-pulse]="isBiting" 
             [class.fully-eaten]="stage() === 6">
          <img [src]="'assets/fotos/' + (stage() <= 5 ? stage() : 5) + '.png'" class="cookie-img" alt="Cookie" />
        </div>

        <!-- Título do Projeto -->
        <h1 class="brand-title">SweetAg Cookies</h1>
      </div>
    </div>
  `,
  styles: [`
    /* Fundo degradê pêssego/laranja suave (35% opacidade) sobre fundo creme */
    .preloader-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: 
        radial-gradient(circle, rgba(241, 195, 153, 0.35) 0%, rgba(255, 144, 0, 0.35) 100%), 
        #FAF8F5;
      z-index: 99999;
      overflow: hidden;
      transform: translateX(0);
      /* Sombra projetada na lateral direita para dar nítida separação ao deslizar */
      box-shadow: 25px 0 70px rgba(46, 28, 18, 0.25);
      /* Transição de subida de cortina ultra-suave com bezier premium */
      transition: transform 0.8s cubic-bezier(0.85, 0, 0.15, 1);
    }

    /* Animação da Cortina Deslizando para a Esquerda (Opção B) */
    .preloader-overlay.slide-left {
      transform: translateX(-100%);
    }

    /* Conteúdo interno com efeito de paralaxe no encerramento */
    .preloader-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s ease-out;
    }

    /* Durante o deslizamento, o conteúdo interno move-se para a esquerda mais rápido e some */
    .preloader-overlay.slide-left .preloader-content {
      transform: translateX(-100px);
      opacity: 0;
    }

    /* Container do Cookie (Grande e centralizado) */
    .cookie-wrapper {
      width: 220px;
      height: 220px;
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: scale(1);
      opacity: 1;
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
      transform: scale(0.92) rotate(-3deg);
    }

    /* Animação do Último Pedaço sendo comido (Encolhe elasticamente até sumir) */
    .cookie-wrapper.fully-eaten {
      transform: scale(0);
      opacity: 0;
    }

    /* Título do Projeto */
    .brand-title {
      font-family: 'Epilogue', 'Plus Jakarta Sans', sans-serif;
      font-size: 2.8rem;
      font-weight: 800;
      color: #2E1C12; /* marrom profundo oficial */
      letter-spacing: -0.03em;
      opacity: 0;
      transform: translateY(10px);
      animation: fadeInUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) 0.1s forwards;
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Ajustes para Celulares e Telas Menores */
    @media (max-width: 576px) {
      .brand-title {
        font-size: 2rem;
      }
      .cookie-wrapper {
        width: 160px;
        height: 160px;
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class PreloaderComponent implements OnInit {
  @Output() finished = new EventEmitter<void>();

  // Começa no estágio 1 (1.png) e avança até 6 (6 = totalmente comido/scale 0)
  protected readonly stage = signal<number>(1);
  protected isBiting = false;
  protected isFadingOut = false;

  ngOnInit() {
    this.runAnimationSequence();
  }

  private runAnimationSequence() {
    const intervalTime = 400; // 400ms por estágio de mordida

    const timer = setInterval(() => {
      const currentStage = this.stage();
      if (currentStage < 5) {
        // Mordidas sequenciais (estágios 1 a 4)
        this.isBiting = true;
        this.stage.update(s => s + 1);
        
        setTimeout(() => {
          this.isBiting = false;
        }, 120);
      } else if (currentStage === 5) {
        // Transição do último pedaço (estágio 5 para 6: encolhimento elástico)
        this.stage.update(s => s + 1); // stage = 6 (ativa .fully-eaten)
        clearInterval(timer);
        
        // Aguarda 300ms para o cookie sumir por completo antes de deslizar a cortina
        setTimeout(() => {
          this.triggerSlideLeft();
        }, 300);
      }
    }, intervalTime);
  }

  private triggerSlideLeft() {
    this.isFadingOut = true; // Ativa a classe .slide-left na cortina
    
    // Aguarda o término do deslizamento da cortina (800ms) para remover o componente do DOM
    setTimeout(() => {
      this.finished.emit();
    }, 800);
  }
}
