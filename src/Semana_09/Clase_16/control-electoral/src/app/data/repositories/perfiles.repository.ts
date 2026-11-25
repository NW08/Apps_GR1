import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../../core/supabase/supabase.client';
import type { Perfil } from '../../domain/models/perfil';
import { aPerfil } from './fila.mapper';

@Injectable({ providedIn: 'root' })
export class PerfilesRepository {
  private readonly sb = inject(SUPABASE);

  async veedoresDeRecinto(recintoId: string): Promise<Perfil[]> {
    const { data, error } = await this.sb
      .from('perfiles')
      .select('*')
      .eq('rol', 'veedor')
      .eq('recinto_id', recintoId)
      .order('apellidos');
    if (error) throw error;
    return (data ?? []).map(aPerfil);
  }
}
