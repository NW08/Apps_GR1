import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthRepository } from '../../data/repositories/auth.repository';
import type { Perfil } from '../../domain/models/perfil';
import type { Rol } from '../../domain/models/rol';

export const INICIO_POR_ROL: Record<Rol, string> = {
  provincial: '/provincial/recintos',
  recinto: '/recinto/mesas',
  veedor: '/veedor/mesas',
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly repo = inject(AuthRepository);
  private readonly _perfil = signal<Perfil | null>(null);
  private cargado = false;

  readonly perfil = this._perfil.asReadonly();
  readonly autenticado = computed(() => this._perfil() !== null);
  readonly rol = computed(() => this._perfil()?.rol ?? null);

  async asegurarCargado(): Promise<Perfil | null> {
    if (!this.cargado) {
      this.cargado = true;
      try {
        this._perfil.set(await this.repo.perfilPropio());
      } catch {
        this._perfil.set(null);
      }
    }
    return this._perfil();
  }

  async iniciarSesion(cedula: string, clave: string): Promise<Perfil> {
    await this.repo.iniciarSesion(cedula.trim(), clave);
    const perfil = await this.repo.perfilPropio();
    if (!perfil) {
      await this.repo.cerrarSesion();
      throw { code: '42501', message: 'Cuenta sin perfil asignado' };
    }
    this.cargado = true;
    this._perfil.set(perfil);
    return perfil;
  }

  async cambiarClave(nueva: string): Promise<void> {
    await this.repo.cambiarClave(nueva);
    const p = this._perfil();
    if (p) this._perfil.set({ ...p, debeCambiarClave: false });
  }

  recuperar(email: string): Promise<void> {
    return this.repo.recuperar(email.trim());
  }

  async cerrarSesion(): Promise<void> {
    await this.repo.cerrarSesion();
    this._perfil.set(null);
  }

  rutaInicio(): string {
    const p = this._perfil();
    if (!p) return '/auth/login';
    if (p.debeCambiarClave) return '/auth/cambiar-clave';
    return INICIO_POR_ROL[p.rol];
  }
}
