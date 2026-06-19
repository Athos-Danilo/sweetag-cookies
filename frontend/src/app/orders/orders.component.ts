import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  protected authService = inject(AuthService);
  protected router = inject(Router);

  // Registro manual de testes para visualização
  protected orders: any[] = [
    {
      id: 'PED-4A9B2C',
      date: new Date().toISOString(),
      total: 35.00,
      paymentMethod: 'Pix',
      status: 'Em Preparo',
      statusStep: 2, // 1: Aguardando, 2: Preparo, 3: Rota, 4: Entregue
      items: [
        { name: 'Cookie Lacan', quantity: 2, price: 10.00 },
        { name: 'Cookie Freud', quantity: 1, price: 15.00 }
      ],
      delivery: {
        department: 'Psicologia',
        block: 'Bloco C',
        room: 'Sala 304'
      }
    },
    {
      id: 'PED-1X7F9K',
      date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 dias atrás
      total: 20.00,
      paymentMethod: 'Dinheiro (Com troco para R$ 50)',
      status: 'Entregue',
      statusStep: 4,
      items: [
        { name: 'Cookie Skinner', quantity: 2, price: 10.00 }
      ],
      delivery: {
        department: 'Fisioterapia',
        block: 'Bloco A',
        room: 'Sala 102'
      }
    }
  ];

  selectedOrder: any = null;

  constructor() {
    // Se o usuário não estiver logado, redireciona para o login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  protected goBack() {
    if (this.selectedOrder) {
      this.selectedOrder = null;
    } else {
      this.router.navigate(['/']); // Retorna para home
    }
  }
  
  protected viewOrder(order: any) {
    this.selectedOrder = order;
  }
}
