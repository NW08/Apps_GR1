import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../../core/supabase/supabase.client';
import type { Acta, Dignidad, VotoCandidatura } from '../../domain/models/acta';

export interface GuardarActaDatos {
  jrvId: string;
  dignidad: Dignidad;
  votos: VotoCandidatura[];
  nulos: number;
  blancos: number;
  totalSufragantes: number;
  fotoPath: string;
  lat: number | null;
  lng: number | null;
  precisionM: number | null;
  capturadoEn: string | null;
  ubicacionComprobable: boolean;
  esInconsistente: boolean;
  observacion: string | null;
  versionBase: number | null;
}

// guardar_acta es transaccional y SECURITY INVOKER: valida totales, versiona y respeta RLS.
@Injectable({ providedIn: 'root' })
export class ActasRepository {
  private readonly sb = inject(SUPABASE);

  async obtener(jrvId: string, dignidad: Dignidad): Promise<Acta | null> {
    const { data, error } = await this.sb
      .from('actas')
      .select('*, acta_votos(candidatura_id, votos)')
      .eq('jrv_id', jrvId)
      .eq('dignidad', dignidad)
      .maybeSingle();
    if (error) throw error;
    return data ? this.aActa(data) : null;
  }

  async guardar(d: GuardarActaDatos): Promise<Acta> {
    const { data, error } = await this.sb.rpc('guardar_acta', {
      p_jrv_id: d.jrvId,
      p_dignidad: d.dignidad,
      p_votos: d.votos.map((v) => ({ candidatura_id: v.candidaturaId, votos: v.votos })),
      p_nulos: d.nulos,
      p_blancos: d.blancos,
      p_total_sufragantes: d.totalSufragantes,
      p_foto_path: d.fotoPath,
      p_lat: d.lat,
      p_lng: d.lng,
      p_precision_m: d.precisionM,
      p_capturado_en: d.capturadoEn,
      p_ubicacion_comprobable: d.ubicacionComprobable,
      p_es_inconsistente: d.esInconsistente,
      p_observacion: d.observacion,
      p_client_uuid: crypto.randomUUID(),
      p_version_base: d.versionBase,
    });
    if (error) throw error;
    return this.aActa({ ...(data as Record<string, any>), acta_votos: d.votos.map((v) => ({ candidatura_id: v.candidaturaId, votos: v.votos })) });
  }

  private aActa(f: Record<string, any>): Acta {
    return {
      id: f['id'],
      jrvId: f['jrv_id'],
      dignidad: f['dignidad'],
      votos: (f['acta_votos'] ?? []).map((v: Record<string, any>) => ({ candidaturaId: v['candidatura_id'], votos: v['votos'] })),
      nulos: f['nulos'],
      blancos: f['blancos'],
      totalSufragantes: f['total_sufragantes'],
      fotoPath: f['foto_path'],
      lat: f['lat'],
      lng: f['lng'],
      precisionM: f['precision_m'],
      capturadoEn: f['capturado_en'],
      ubicacionComprobable: f['ubicacion_comprobable'],
      estado: f['estado'],
      observacion: f['observacion'],
      version: f['version'],
      actualizadoEn: f['actualizado_en'],
    };
  }
}
