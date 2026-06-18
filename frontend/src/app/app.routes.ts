import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AuthComponent } from './auth/auth.component';
import { CartComponent } from './cart/cart.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { OrdersComponent } from './orders/orders.component';
import { AddressesComponent } from './addresses/addresses.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: AuthComponent },
  { path: 'cart', component: CartComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'addresses', component: AddressesComponent },
  { path: 'homepage', redirectTo: '', pathMatch: 'full' },
  { path: 'correta', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
