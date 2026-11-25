import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../../core/supabase/supabase.client';
import type { Perfil } from '../../domain/models/perfil';
import type { Recinto } from '../../domain/models/recinto';
import { aPerfil } from './fila.mapper';

export interface NuevoRecinto {
  parroquia: string;
  nombre: string;
  numJrv: number;
  lat?: number | null;
  lng?: number | null;
}

@Injectable({ providedIn: 'root' })
export class RecintosRepository {
  private readonly sb = inject(SUPABASE);

  async listar(): Promise<Recinto[]> {
    const { data, error } = await this.sb.from('recintos').select('*').order('nombre');
    if (error) throw error;
    return (data ?? []).map(aRecinto);
  }

  // Un trigger crea sus JRV.
  async crear(r: NuevoRecinto): Promise<Recinto> {
    const { data, error } = await this.sb
      .from('recintos')
      .insert({
        provincia: 'Pichincha',
        canton: 'Quito',
        parroquia: r.parroquia,
        nombre: r.nombre,
        num_jrv: r.numJrv,
        lat: r.lat ?? null,
        lng: r.lng ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return aRecinto(data);
  }

  async coordinadores(): Promise<Map<string, Perfil>> {
    const { data, error } = await this.sb.from('perfiles').select('*').eq('rol', 'recinto');
    if (error) throw error;
    const mapa = new Map<string, Perfil>();
    for (const f of data ?? []) {
      const p = aPerfil(f);
      if (p.recintoId) mapa.set(p.recintoId, p);
    }
    return mapa;
  }

  async coordinadorDe(recintoId: string): Promise<Perfil | null> {
    const { data, error } = await this.sb
      .from('perfiles')
      .select('*')
      .eq('rol', 'recinto')
      .eq('recinto_id', recintoId)
      .maybeSingle();
    if (error) throw error;
    return data ? aPerfil(data) : null;
  }
}

function aRecinto(f: Record<string, any>): Recinto {
  return {
    id: f['id'],
    provincia: f['provincia'],
    canton: f['canton'],
    parroquia: f['parroquia'],
    nombre: f['nombre'],
    numJrv: f['num_jrv'],
    lat: f['lat'],
    lng: f['lng'],
  };
}
