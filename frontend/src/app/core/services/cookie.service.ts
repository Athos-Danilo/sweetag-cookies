import { Injectable, signal } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  public readonly cookies = signal<CookieItem[]>([
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
      imagem: 'assets/fotos/Ninho queimado.png',
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
      imagem: 'assets/fotos/Farinha láctea.png',
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

  getCookieById(id: string): CookieItem | undefined {
    return this.cookies().find(c => c.id === id);
  }
}
