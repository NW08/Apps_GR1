import { Injectable, inject } from '@angular/core';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { SUPABASE } from '../../core/supabase/supabase.client';
import type { NuevaCuenta } from '../../domain/models/perfil';

export interface CuentaCreada {
  id: string;
  correoEnviado: boolean;
}

@Injectable({ providedIn: 'root' })
export class CuentasApi {
  private readonly sb = inject(SUPABASE);

  crearCoordinador(datos: NuevaCuenta, recintoId: string): Promise<CuentaCreada> {
    return this.invocar('crear-coordinador-recinto', { ...datos, recinto_id: recintoId });
  }

  crearVeedor(datos: NuevaCuenta): Promise<CuentaCreada> {
    return this.invocar('crear-veedor', { ...datos });
  }

  private async invocar(funcion: string, body: Record<string, unknown>): Promise<CuentaCreada> {
    const { data, error } = await this.sb.functions.invoke(funcion, { body });
    if (error) {
      // La función responde { error } con el mensaje en español.
      if (error instanceof FunctionsHttpError) {
        const status = error.context?.status as number | undefined;
        let mensaje = 'No se pudo crear la cuenta.';
        try {
          const cuerpo = await error.context.json();
          mensaje = cuerpo?.error ?? mensaje;
        } catch {
          // respuesta sin JSON
        }
        throw { status, message: mensaje };
      }
      throw error;
    }
    return { id: data?.id, correoEnviado: !!data?.correoEnviado };
  }
}
