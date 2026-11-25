import { Injectable, inject } from '@angular/core';
import { SUPABASE } from '../../core/supabase/supabase.client';
import type { Dignidad } from '../../domain/models/acta';

const BUCKET = 'actas';

// Las políticas de Storage validan la pertenencia con los segmentos de la ruta.
@Injectable({ providedIn: 'root' })
export class FotosRepository {
  private readonly sb = inject(SUPABASE);

  async subir(recintoId: string, jrvId: string, dignidad: Dignidad, blob: Blob): Promise<string> {
    const path = `${recintoId}/${jrvId}/${dignidad}.jpg`;
    const { error } = await this.sb.storage.from(BUCKET).upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (error) throw error;
    return path;
  }

  async urlFirmada(path: string, segundos = 300): Promise<string> {
    const { data, error } = await this.sb.storage.from(BUCKET).createSignedUrl(path, segundos);
    if (error) throw error;
    return data.signedUrl;
  }
}
