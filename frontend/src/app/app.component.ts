import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent, BottomNavComponent],
  template: `
    <div [class]="'app-layout-container ' + currentRouteClass">
      <app-header></app-header>
      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
      <app-bottom-nav></app-bottom-nav>
    </div>
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
  private readonly destroyRef = inject(DestroyRef);

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateRouteClass(this.router.url);

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;
        this.updateRouteClass(url);
      });
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
