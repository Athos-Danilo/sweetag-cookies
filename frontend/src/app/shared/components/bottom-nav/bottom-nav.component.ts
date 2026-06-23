import { Component, OnInit, signal, DestroyRef, inject, effect } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bottom-nav.component.html',
  styleUrl: './bottom-nav.component.scss'
})
export class BottomNavComponent implements OnInit {
  protected itemCount = 0;
  protected currentUrl = '';
  protected readonly cartAnimating = signal<boolean>(false);
  protected readonly hasActiveOrder = signal<boolean>(false);

  private readonly destroyRef = inject(DestroyRef);
  protected authService = inject(AuthService);
  private orderService = inject(OrderService);

  constructor(private cartService: CartService, private router: Router) {
    this.currentUrl = this.router.url;

    // Monitora o estado de autenticação para recalcular a visibilidade do botão "Acompanhar"
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.checkActiveOrders();
      } else {
        this.hasActiveOrder.set(false);
      }
    });
  }

  ngOnInit() {
    // Monitora a contagem de itens do carrinho para o badge do mobile
    this.cartService.cartItems$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const newCount = this.cartService.getItemCount();
        if (newCount > this.itemCount) {
          this.cartAnimating.set(true);
          setTimeout(() => this.cartAnimating.set(false), 500);
        }
        this.itemCount = newCount;
      });

    // Monitora a rota ativa para atualizar a aba ativa na barra inferior e verificar pedidos ativos
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
        this.checkActiveOrders();
      });

    // Executa verificação inicial no carregamento do componente
    this.checkActiveOrders();
  }

  private checkActiveOrders() {
    if (!this.authService.isLoggedIn()) {
      this.hasActiveOrder.set(false);
      return;
    }

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        // O botão Acompanhar só aparece se houver pedido que não esteja EXPIRADO nem Entregue
        const active = orders.some(o => o.status !== 'EXPIRADO' && o.status !== 'Entregue');
        this.hasActiveOrder.set(active);
      },
      error: () => {
        this.hasActiveOrder.set(false);
      }
    });
  }

  protected isActive(route: string): boolean {
    if (route === '/') {
      return this.currentUrl === '/' || this.currentUrl === '/homepage' || this.currentUrl === '';
    }
    return this.currentUrl.startsWith(route);
  }
}
