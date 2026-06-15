import { Component, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preloader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.scss'
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

    // A primeira imagem (cookie inteiro) fica na tela por 1500ms (1s de entrada + 0.5s estático)
    setTimeout(nextStep, 1500);
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
