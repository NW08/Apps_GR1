import type { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'inicio',
        loadComponent: () =>
          import('../pages/inicio/inicio.page').then((m) => m.InicioPage),
      },
      {
        path: 'actividades',
        loadComponent: () =>
          import('../pages/actividades/actividades.page').then(
            (m) => m.ActividadesPage,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('../pages/usuarios/usuarios.page').then((m) => m.UsuariosPage),
      },
      {
        path: 'dispositivo',
        loadComponent: () =>
          import('../pages/dispositivo/dispositivo.page').then(
            (m) => m.DispositivoPage,
          ),
      },
      {
        path: '',
        redirectTo: '/tabs/inicio',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/inicio',
    pathMatch: 'full',
  },
];
