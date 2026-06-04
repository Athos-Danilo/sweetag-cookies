import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AuthComponent } from './auth/auth.component';
import { CartComponent } from './cart/cart.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: AuthComponent },
  { path: 'cart', component: CartComponent },
  { path: 'homepage', redirectTo: '', pathMatch: 'full' },
  { path: 'correta', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
