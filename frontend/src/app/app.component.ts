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
    <div [class]="'app-layout-container ' + currentRouteClass">
      <app-header></app-header>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
      <app-bottom-nav></app-bottom-nav>
    </div>
    <app-preloader *ngIf="showPreloader" (finished)="onPreloaderFinished()"></app-preloader>
  `,
  styles: [`
    .app-layout-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 100%;
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
    const wasOnHomepage = this.lastUrl === '/' || this.lastUrl === '/homepage' || this.lastUrl === '';

    // Dispara o preloader se navega para a homepage vindo de outra página, ou no primeiro carregamento
    if (isHomepage && (!wasOnHomepage || this.lastUrl === '')) {
      this.showPreloader = true;
    }

    this.lastUrl = path;
  }

  protected onPreloaderFinished() {
    this.showPreloader = false;
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
