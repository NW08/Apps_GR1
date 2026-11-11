import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
      },
      {
        path: 'candidatos',
        loadComponent: () => import('./pages/candidatos/candidatos.page').then((m) => m.CandidatosPage),
      },
      {
        path: '',
        redirectTo: 'registro',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'registro',
    redirectTo: 'tabs/registro',
    pathMatch: 'full',
  },
  {
    path: 'candidatos',
    redirectTo: 'tabs/candidatos',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'tabs/registro',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'tabs/registro',
  },
];
