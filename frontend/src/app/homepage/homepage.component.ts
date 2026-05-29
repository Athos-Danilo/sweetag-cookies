import { Component, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface CookieItem {
  id: string;
  nome: string;
  sabor: string;
  valor: number;
  imagem: string;
  diagnostico: string; // Detalhe divertido de psicologia para enriquecer o visual
  categoria: string;
}

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.scss'
})
export class HomepageComponent {
  // Lista dos cookies temáticos conforme os requisitos do usuário e a identidade do Stitch
  protected readonly cookies = signal<CookieItem[]>([
    {
      id: '#LC-1901',
      nome: 'Cookie Lacan',
      sabor: 'Kinder',
      valor: 9.00,
      imagem: 'assets/fotos/lacan.jpeg',
      diagnostico: 'Desejo inconsciente estruturado como uma linguagem de chocolate.',
      categoria: 'Psicanálise'
    },
    {
      id: '#SK-1904',
      nome: 'Cookie Skinner',
      sabor: 'Ninho Queimado',
      valor: 9.00,
      imagem: 'assets/fotos/Ninho%20queimado.png',
      diagnostico: 'Reforço positivo imediato após a primeira mordida.',
      categoria: 'Behaviorismo'
    },
    {
      id: '#YG-1875',
      nome: 'Cookie Jung',
      sabor: 'Farinha Láctea',
      valor: 8.00,
      imagem: 'assets/fotos/Farinha%20l%C3%A1ctea.png',
      diagnostico: 'Uma jornada pelo inconsciente coletivo dos sabores da infância.',
      categoria: 'Psicologia Analítica'
    },
    {
      id: '#PG-1896',
      nome: 'Cookie Piaget',
      sabor: 'Nutella',
      valor: 9.00,
      imagem: 'assets/fotos/piaget.jpeg',
      diagnostico: 'Assimilação e acomodação de avelã em perfeita harmonia cognitiva.',
      categoria: 'Cognitivismo'
    },
    {
      id: '#FD-1856',
      nome: 'Cookie Freud',
      sabor: 'Speculoos',
      valor: 8.00,
      imagem: 'assets/fotos/freud.jpeg',
      diagnostico: 'Onde o Id e o Superego concordam que a canela é irresistível.',
      categoria: 'Psicanálise'
    },
    {
      id: '#CR-1902',
      nome: 'Cookie Carl Rogers',
      sabor: 'Tradicional',
      valor: 8.00,
      imagem: 'assets/fotos/tradicional.png',
      diagnostico: 'Aceitação incondicional de um clássico com gotas de chocolate.',
      categoria: 'Humanismo'
    }
  ]);

  // Contador de sacola para interação
  protected readonly sacola = signal<number>(0);

  protected adicionarAoCarrinho() {
    this.sacola.update(val => val + 1);
  }
}
