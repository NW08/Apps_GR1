import type { Routes } from '@angular/router';

export const VEEDOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./veedor-shell.component').then((m) => m.VeedorShellComponent),
    children: [
      { path: 'mesas', loadComponent: () => import('./mis-mesas.page').then((m) => m.MisMesasPage) },
      { path: '', redirectTo: 'mesas', pathMatch: 'full' },
    ],
  },
  {
    path: 'acta/:jrvId/:dignidad',
    loadComponent: () => import('../actas/acta-form.page').then((m) => m.ActaFormPage),
  },
];
