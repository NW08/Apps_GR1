import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'incidencias',
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
    path: 'seguimiento',
    loadComponent: () => import('./pages/seguimiento/seguimiento.page').then((m) => m.SeguimientoPage),
  },
  {
    path: 'detalle',
    loadComponent: () => import('./pages/detalle/detalle.page').then((m) => m.DetallePage),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
  },
];
