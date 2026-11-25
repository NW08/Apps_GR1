import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../../core/supabase/supabase.client';
import type { Dignidad } from '../../domain/models/acta';
import type { Candidatura } from '../../domain/models/candidatura';

@Injectable({ providedIn: 'root' })
export class CatalogoRepository {
  private readonly sb = inject(SUPABASE);

  async candidaturas(dignidad: Dignidad): Promise<Candidatura[]> {
    const { data, error } = await this.sb
      .from('candidaturas')
      .select('id,nombre,dignidad,organizacion_id,organizaciones(nombre,lista)')
      .eq('dignidad', dignidad);
    if (error) throw error;
    const lista = (data ?? []).map((f: Record<string, any>) => {
      const org = Array.isArray(f['organizaciones']) ? f['organizaciones'][0] : f['organizaciones'];
      return {
        id: f['id'],
        organizacionId: f['organizacion_id'],
        organizacionNombre: org?.nombre ?? '',
        lista: org?.lista ?? '',
        dignidad: f['dignidad'],
        nombre: f['nombre'],
      } satisfies Candidatura;
    });
    return lista.sort((a, b) => a.lista.localeCompare(b.lista, 'es', { numeric: true }));
  }
}
