import { Component, OnInit, signal, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
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
  protected readonly hasActiveOrder = signal<boolean>(true); // MOCK: Simulando que há um pedido em andamento

  private readonly destroyRef = inject(DestroyRef);
  protected authService = inject(AuthService);

  constructor(private cartService: CartService, private router: Router) {
    this.currentUrl = this.router.url;
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

    // Monitora a rota ativa para atualizar a aba ativa na barra inferior
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: any) => {
        this.currentUrl = event.urlAfterRedirects || event.url;
      });
  }

  protected isActive(route: string): boolean {
    if (route === '/') {
      return this.currentUrl === '/' || this.currentUrl === '/homepage' || this.currentUrl === '';
    }
    return this.currentUrl.startsWith(route);
  }
}
