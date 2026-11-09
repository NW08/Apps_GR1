import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full',
  },
  {
    path: 'inicio',
    loadComponent: () => import('./pages/inicio/inicio.page').then((m) => m.InicioPage),
  },
  {
    path: 'incidencias',
    loadComponent: () => import('./pages/incidencias/incidencias.page').then((m) => m.IncidenciasPage),
  },
  {
    path: 'incidencias/:id',
    loadComponent: () => import('./pages/detalle/detalle.page').then((m) => m.DetallePage),
  },
  {
    path: 'seguimiento',
    loadComponent: () => import('./pages/seguimiento/seguimiento.page').then((m) => m.SeguimientoPage),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
