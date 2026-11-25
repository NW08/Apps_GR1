import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../../core/supabase/supabase.client';
import type { Dignidad, EstadoActa } from '../../domain/models/acta';

export interface ResultadoCandidato {
  candidaturaId: string;
  candidato: string;
  organizacion: string;
  lista: string;
  votosTotales: number;
  votosSinObservadas: number;
}

export interface TotalesBlancosNulos {
  blancos: number;
  nulos: number;
  sufragantes: number;
  blancosSinObservadas: number;
  nulosSinObservadas: number;
  sufragantesSinObservadas: number;
  actasObservadas: number;
}

export interface AvanceRecinto {
  recintoId: string;
  recinto: string;
  parroquia: string;
  totalJrv: number;
  actasAlcalde: number;
  actasPrefecto: number;
  actasObservadas: number;
  actasSinUbicacion: number;
}

export interface ActaUbicacion {
  id: string;
  recinto: string;
  mesa: number;
  dignidad: Dignidad;
  estado: EstadoActa;
  lat: number | null;
  lng: number | null;
  precisionM: number | null;
  ubicacionComprobable: boolean;
  capturadoEn: string | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardRepository {
  private readonly sb = inject(SUPABASE);

  // recintoId null = consolidado.
  async resultados(dignidad: Dignidad, recintoId: string | null): Promise<ResultadoCandidato[]> {
    // Se parte de todas las candidaturas para mostrar también las de 0 votos.
    const { data: cands, error: e1 } = await this.sb
      .from('candidaturas')
      .select('id, nombre, organizaciones(nombre, lista)')
      .eq('dignidad', dignidad);
    if (e1) throw e1;

    let q = this.sb.from('resultados_por_candidato_recinto').select('*').eq('dignidad', dignidad);
    if (recintoId) q = q.eq('recinto_id', recintoId);
    const { data: filas, error: e2 } = await q;
    if (e2) throw e2;

    const mapa = new Map<string, ResultadoCandidato>();
    for (const c of cands ?? []) {
      const org = (c as any).organizaciones ?? {};
      mapa.set(c.id, {
        candidaturaId: c.id,
        candidato: c.nombre,
        organizacion: org.nombre ?? '',
        lista: org.lista ?? '',
        votosTotales: 0,
        votosSinObservadas: 0,
      });
    }
    for (const f of filas ?? []) {
      const r = mapa.get(f['candidatura_id']);
      if (!r) continue;
      r.votosTotales += f['votos_totales'] ?? 0;
      r.votosSinObservadas += f['votos_sin_observadas'] ?? 0;
    }
    return [...mapa.values()].sort((a, b) => a.lista.localeCompare(b.lista));
  }

  async blancosNulos(dignidad: Dignidad, recintoId: string | null): Promise<TotalesBlancosNulos> {
    let q = this.sb.from('resultados_blancos_nulos_recinto').select('*').eq('dignidad', dignidad);
    if (recintoId) q = q.eq('recinto_id', recintoId);
    const { data, error } = await q;
    if (error) throw error;
    const t: TotalesBlancosNulos = {
      blancos: 0,
      nulos: 0,
      sufragantes: 0,
      blancosSinObservadas: 0,
      nulosSinObservadas: 0,
      sufragantesSinObservadas: 0,
      actasObservadas: 0,
    };
    for (const f of data ?? []) {
      t.blancos += f['blancos_totales'] ?? 0;
      t.nulos += f['nulos_totales'] ?? 0;
      t.sufragantes += f['sufragantes_totales'] ?? 0;
      t.blancosSinObservadas += f['blancos_sin_observadas'] ?? 0;
      t.nulosSinObservadas += f['nulos_sin_observadas'] ?? 0;
      t.sufragantesSinObservadas += f['sufragantes_sin_observadas'] ?? 0;
      t.actasObservadas += f['actas_observadas'] ?? 0;
    }
    return t;
  }

  async avance(): Promise<AvanceRecinto[]> {
    const { data, error } = await this.sb.from('avance_actas_recinto').select('*').order('recinto_nombre');
    if (error) throw error;
    return (data ?? []).map((f: Record<string, any>) => ({
      recintoId: f['recinto_id'],
      recinto: f['recinto_nombre'],
      parroquia: f['parroquia'],
      totalJrv: f['total_jrv'] ?? 0,
      actasAlcalde: f['actas_alcalde'] ?? 0,
      actasPrefecto: f['actas_prefecto'] ?? 0,
      actasObservadas: f['actas_observadas'] ?? 0,
      actasSinUbicacion: f['actas_sin_ubicacion'] ?? 0,
    }));
  }

  async actasConUbicacion(): Promise<ActaUbicacion[]> {
    const { data, error } = await this.sb
      .from('actas')
      .select('id, dignidad, estado, lat, lng, precision_m, ubicacion_comprobable, capturado_en, jrv(numero, recinto_id, recintos(nombre))')
      .order('capturado_en', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((f: any) => ({
      id: f.id,
      recinto: f.jrv?.recintos?.nombre ?? '',
      mesa: f.jrv?.numero ?? 0,
      dignidad: f.dignidad,
      estado: f.estado,
      lat: f.lat,
      lng: f.lng,
      precisionM: f.precision_m,
      ubicacionComprobable: !!f.ubicacion_comprobable && f.lat != null && f.lng != null,
      capturadoEn: f.capturado_en,
    }));
  }
}
