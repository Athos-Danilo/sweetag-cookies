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

  // Aqui ficará a lista de pedidos no futuro (vindo do backend). Por enquanto, vazia.
  protected orders: any[] = [];

  constructor() {
    // Se o usuário não estiver logado, redireciona para o login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  protected goBack() {
    this.router.navigate(['/login']); // A tela de login atua como perfil/menu
  }
}
