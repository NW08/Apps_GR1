import type { Routes } from '@angular/router';
import { authGuard, cambioClaveGuard, invitadoGuard, rolGuard } from './core/auth/guards';

export const routes: Routes = [
  {
    path: 'auth/login',
    canActivate: [invitadoGuard],
    loadComponent: () => import('./features/auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/recuperar',
    loadComponent: () => import('./features/auth/recuperar.page').then((m) => m.RecuperarPage),
  },
  {
    path: 'auth/cambiar-clave',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/cambiar-clave.page').then((m) => m.CambiarClavePage),
  },
  {
    path: 'veedor',
    canActivate: [authGuard, cambioClaveGuard, rolGuard(['veedor'])],
    loadChildren: () => import('./features/veedor/veedor.routes').then((m) => m.VEEDOR_ROUTES),
  },
  {
    path: 'recinto',
    canActivate: [authGuard, cambioClaveGuard, rolGuard(['recinto'])],
    loadChildren: () => import('./features/recinto/recinto.routes').then((m) => m.RECINTO_ROUTES),
  },
  {
    path: 'provincial',
    canActivate: [authGuard, cambioClaveGuard, rolGuard(['provincial'])],
    loadChildren: () => import('./features/provincial/provincial.routes').then((m) => m.PROVINCIAL_ROUTES),
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' },
];
