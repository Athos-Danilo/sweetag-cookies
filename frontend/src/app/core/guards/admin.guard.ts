import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getUser();

  if (authService.isLoggedIn() && user && user.is_admin) {
    return true;
  }

  // Redireciona para o login do admin se não for administrador
  router.navigate(['/admin/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
