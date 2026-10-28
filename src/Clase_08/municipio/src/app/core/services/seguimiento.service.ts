import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const KEY = 'seguimiento_codigos';

@Injectable({ providedIn: 'root' })
export class SeguimientoService {
  private _codigos = signal<string[]>([]);
  readonly codigos = this._codigos.asReadonly();
  readonly listo: Promise<void>;

  constructor() {
    this.listo = this.cargar();
  }

  private async cargar() {
    try {
      const { value } = await Preferences.get({ key: KEY });
      const datos = value ? JSON.parse(value) : [];
      this._codigos.set(Array.isArray(datos) ? datos : []);
    } catch {
      this._codigos.set([]);
    }
  }

  esMarcado(codigo: string): boolean {
    return this._codigos().includes(codigo);
  }

  async alternar(codigo: string) {
    await this.listo; // evita sobrescribir antes de terminar la lectura inicial
    const actual = this._codigos();
    const nuevo = actual.includes(codigo)
      ? actual.filter((c) => c !== codigo)
      : [...actual, codigo];
    this._codigos.set(nuevo);
    await Preferences.set({ key: KEY, value: JSON.stringify(nuevo) });
  }
}