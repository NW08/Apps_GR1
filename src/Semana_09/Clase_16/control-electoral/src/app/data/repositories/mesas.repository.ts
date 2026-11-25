import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../../core/supabase/supabase.client';
import type { Mesa } from '../../domain/models/mesa';

@Injectable({ providedIn: 'root' })
export class MesasRepository {
  private readonly sb = inject(SUPABASE);

  async listar(recintoId?: string): Promise<Mesa[]> {
    let q = this.sb.from('mesas_estado').select('*').order('numero');
    if (recintoId) q = q.eq('recinto_id', recintoId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((f: Record<string, any>) => ({
      id: f['id'],
      recintoId: f['recinto_id'],
      numero: f['numero'],
      veedorId: f['veedor_id'],
      veedorNombre: f['veedor_id'] ? `${f['veedor_nombres'] ?? ''} ${f['veedor_apellidos'] ?? ''}`.trim() : null,
      actasRegistradas: f['actas_registradas'],
      estado: f['estado'],
    }));
  }

  async obtener(jrvId: string): Promise<Mesa | null> {
    const { data, error } = await this.sb.from('mesas_estado').select('*').eq('id', jrvId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data['id'],
      recintoId: data['recinto_id'],
      numero: data['numero'],
      veedorId: data['veedor_id'],
      veedorNombre: data['veedor_id'] ? `${data['veedor_nombres'] ?? ''} ${data['veedor_apellidos'] ?? ''}`.trim() : null,
      actasRegistradas: data['actas_registradas'],
      estado: data['estado'],
    };
  }

  async asignarVeedor(jrvId: string, veedorId: string | null): Promise<void> {
    const { data, error } = await this.sb.from('jrv').update({ veedor_id: veedorId }).eq('id', jrvId).select('id');
    if (error) throw error;
    if (!data?.length) throw { code: '42501', message: 'permission denied' };
  }
}
