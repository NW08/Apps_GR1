import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { Rol } from '../../domain/models/rol';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const perfil = await auth.asegurarCargado();
  return perfil ? true : router.parseUrl('/auth/login');
};

export const cambioClaveGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const perfil = await auth.asegurarCargado();
  return perfil?.debeCambiarClave ? router.parseUrl('/auth/cambiar-clave') : true;
};

export const rolGuard =
  (roles: Rol[]): CanActivateFn =>
  async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const perfil = await auth.asegurarCargado();
    if (perfil && roles.includes(perfil.rol)) return true;
    return router.parseUrl(auth.rutaInicio());
  };

export const invitadoGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const perfil = await auth.asegurarCargado();
  return perfil ? router.parseUrl(auth.rutaInicio()) : true;
};
