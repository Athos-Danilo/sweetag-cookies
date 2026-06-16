import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { PreloaderComponent } from './shared/components/preloader/preloader.component';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, BottomNavComponent, PreloaderComponent],
  template: `
    <div [class]="'app-layout-container ' + currentRouteClass + (showPreloader ? ' preloader-active' : '') + (isRevealing ? ' preloader-reveal' : '')">
      <app-header></app-header>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
      <app-bottom-nav></app-bottom-nav>
    </div>
    <app-preloader *ngIf="showPreloader" (slideStart)="onPreloaderSlideStart()" (finished)="onPreloaderFinished()"></app-preloader>
  `,
  styles: [`
    .app-layout-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
      /* Transição de entrada suave sincronizada com o slide da cortina */
      transition: transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s ease-out;
    }

    /* Esconde/reduz a home enquanto o preloader roda */
    .app-layout-container.preloader-active {
      opacity: 0;
      transform: scale(0.96);
    }

    /* Efeito de revelação (zoom-in suave e fade-in) sincronizado com a cortina */
    .app-layout-container.preloader-reveal {
      opacity: 1 !important;
      transform: scale(1) !important;
    }

    /* Fundo degradê oficial da homepage aplicado a todo o container da rota-home */
    .app-layout-container.route-home {
      background: radial-gradient(circle at 50% 0%, #FAF8F5 0%, #FAF2E6 40%, #F5ECD7 100%);
    }

    .app-content {
      flex: 1;
      width: 100%;
    }

    /* Regra CSS: no mobile (celular), oculta o Header nas páginas que não são a Home */
    @media (max-width: 767px) {
      .app-layout-container:not(.route-home) app-header {
        display: none !important;
      }
    }
  `]
})
export class App implements OnInit {
  protected currentRouteClass = 'route-home';
  protected showPreloader = false;
  protected isRevealing = false; // Controla o efeito visual de revelação da homepage
  private lastUrl = '';
  private readonly destroyRef = inject(DestroyRef);

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkPreloaderRoute(this.router.url);
    this.updateRouteClass(this.router.url);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.checkPreloaderRoute(url);
        this.updateRouteClass(url);
      });
  }

  private checkPreloaderRoute(url: string) {
    const path = url.split('?')[0]; // Ignora query parameters para comparação
    const isHomepage = path === '/' || path === '/homepage' || path === '';

    // Dispara o preloader apenas no primeiro carregamento da aplicação se a rota inicial for a homepage
    if (isHomepage && this.lastUrl === '') {
      this.showPreloader = true;
      this.isRevealing = false;
    }

    this.lastUrl = path;
  }

  protected onPreloaderSlideStart() {
    this.isRevealing = true;
    window.scrollTo(0, 0);
  }

  protected onPreloaderFinished() {
    this.showPreloader = false;
    this.isRevealing = false;
    window.scrollTo(0, 0);
  }

  private updateRouteClass(url: string) {
    if (url === '/' || url === '/homepage' || url === '') {
      this.currentRouteClass = 'route-home';
    } else if (url.startsWith('/cart')) {
      this.currentRouteClass = 'route-cart';
    } else if (url.startsWith('/login')) {
      this.currentRouteClass = 'route-login';
    } else {
      this.currentRouteClass = 'route-other';
    }
  }
}
export default App;
