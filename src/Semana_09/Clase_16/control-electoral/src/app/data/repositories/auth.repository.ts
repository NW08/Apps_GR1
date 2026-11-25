import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../../core/supabase/supabase.client';
import type { Perfil } from '../../domain/models/perfil';
import { aPerfil } from './fila.mapper';

@Injectable({ providedIn: 'root' })
export class AuthRepository {
  private readonly sb = inject(SUPABASE);

  async iniciarSesion(cedula: string, clave: string): Promise<void> {
    const { data: email, error: e1 } = await this.sb.rpc('email_por_cedula', { p_cedula: cedula });
    if (e1) throw e1;
    if (!email) throw { code: 'invalid_credentials', message: 'Invalid login credentials' };
    const { error } = await this.sb.auth.signInWithPassword({ email: email as string, password: clave });
    if (error) throw error;
  }

  async usuarioActualId(): Promise<string | null> {
    const { data } = await this.sb.auth.getSession();
    return data.session?.user.id ?? null;
  }

  async perfilPropio(): Promise<Perfil | null> {
    const id = await this.usuarioActualId();
    if (!id) return null;
    const { data, error } = await this.sb.from('perfiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? aPerfil(data) : null;
  }

  async cambiarClave(nueva: string): Promise<void> {
    const { error } = await this.sb.auth.updateUser({ password: nueva });
    if (error) throw error;
    const { error: e2 } = await this.sb.rpc('marcar_clave_cambiada');
    if (e2) throw e2;
  }

  async recuperar(email: string): Promise<void> {
    const { error } = await this.sb.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async cerrarSesion(): Promise<void> {
    await this.sb.auth.signOut();
  }
}
