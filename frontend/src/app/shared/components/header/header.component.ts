import { Component, OnInit, signal, DestroyRef, inject, HostListener } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
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
  protected readonly bgOpacity = signal<number>(0.85);
  protected readonly scrolled = signal<boolean>(false);
  
  private readonly destroyRef = inject(DestroyRef);
  protected authService = inject(AuthService);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scroll = window.scrollY || document.documentElement.scrollTop || 0;
    this.scrolled.set(scroll > 20);

    const maxScroll = 120; // Rolagem limite onde atinge a opacidade mínima
    const minOpacity = 0.55; // Mantém legibilidade excelente ao rolar
    const maxOpacity = 0.85; // Leve transparência no topo
    // Reduz opacidade linearmente de maxOpacity até minOpacity
    const opacity = Math.max(minOpacity, maxOpacity - (scroll / maxScroll) * (maxOpacity - minOpacity));
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

  private logoClickCount = 0;
  private logoClickTimeout: any = null;

  protected onLogoClick(event: Event) {
    this.scrollToTop(event);

    this.logoClickCount++;
    if (this.logoClickTimeout) {
      clearTimeout(this.logoClickTimeout);
    }

    if (this.logoClickCount === 5) {
      this.logoClickCount = 0;
      this.router.navigate(['/admin/login']);
    } else {
      this.logoClickTimeout = setTimeout(() => {
        this.logoClickCount = 0;
      }, 2000); // Reseta se não clicar mais em 2 segundos
    }
  }

  protected scrollToTop(event: Event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const path = this.router.url.split('?')[0];
    if (path !== '/' && path !== '/homepage' && path !== '') {
      this.router.navigate(['/']);
    }
  }
}
