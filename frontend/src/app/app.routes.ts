import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { AuthComponent } from './auth/auth.component';
import { CartComponent } from './cart/cart.component';
import { FavoritesComponent } from './favorites/favorites.component';
import { OrdersComponent } from './orders/orders.component';
import { AddressesComponent } from './addresses/addresses.component';
import { TermsPrivacy } from './terms-privacy/terms-privacy.component';
import { SupportComponent } from './support/support.component';
import { AboutComponent } from './about/about.component';
import { PaymentsComponent } from './payments/payments.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminLoginComponent } from './admin-panel/login/login.component';
import { AdminDashboardComponent } from './admin-panel/dashboard/dashboard.component';
import { AdminOrdersComponent } from './admin-panel/orders/orders.component';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'login', component: AuthComponent },
  { path: 'cart', component: CartComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'addresses', component: AddressesComponent },
  { path: 'terms-privacy', component: TermsPrivacy },
  { path: 'support', component: SupportComponent },
  { path: 'about', component: AboutComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'user-profile', component: UserProfileComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [adminGuard] },
  { path: 'homepage', redirectTo: '', pathMatch: 'full' },
  { path: 'correta', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
