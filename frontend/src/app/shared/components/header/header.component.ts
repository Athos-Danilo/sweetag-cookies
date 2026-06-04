import { Component, OnInit, signal, DestroyRef, inject, HostListener } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  protected itemCount = 0;
  protected currentUrl = '';
  protected readonly cartAnimating = signal<boolean>(false);
  protected readonly bgOpacity = signal<number>(1);
  
  private readonly destroyRef = inject(DestroyRef);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scroll = window.scrollY || document.documentElement.scrollTop || 0;
    const maxScroll = 120; // Rolagem limite onde atinge a opacidade mínima
    const minOpacity = 0.3;
    // Reduz opacidade linearmente de 1.0 até 0.3
    const opacity = Math.max(minOpacity, 1 - (scroll / maxScroll) * (1 - minOpacity));
    this.bgOpacity.set(opacity);
  }

  constructor(private cartService: CartService, private router: Router) {
    this.currentUrl = this.router.url;
  }

  ngOnInit() {
    // Monitora a contagem de itens do carrinho
    this.cartService.cartItems$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const newCount = this.cartService.getItemCount();
        if (newCount > this.itemCount) {
          // Ativa animação de pulo do carrinho
          this.cartAnimating.set(true);
          setTimeout(() => this.cartAnimating.set(false), 500);
        }
        this.itemCount = newCount;
      });

    // Monitora a rota ativa para aplicar estilos ativos
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
