import { Injectable, inject, signal } from '@angular/core';
import { mapearError } from '../../core/errors/supabase-error.mapper';
import { MesasRepository } from '../../data/repositories/mesas.repository';
import type { Estado } from '../../domain/models/estado';
import type { Mesa } from '../../domain/models/mesa';

@Injectable({ providedIn: 'root' })
export class VeedorMesasStore {
  private readonly repo = inject(MesasRepository);
  private readonly _estado = signal<Estado<Mesa[]>>({ tipo: 'inactivo' });
  readonly estado = this._estado.asReadonly();

  async cargar(silencioso = false): Promise<void> {
    if (!silencioso) this._estado.set({ tipo: 'cargando' });
    try {
      const mesas = await this.repo.listar(); // RLS devuelve solo las asignadas
      this._estado.set(mesas.length ? { tipo: 'exito', datos: mesas } : { tipo: 'vacio' });
    } catch (e) {
      this._estado.set({ tipo: 'error', error: mapearError(e), reintentar: () => this.cargar() });
    }
  }
}
