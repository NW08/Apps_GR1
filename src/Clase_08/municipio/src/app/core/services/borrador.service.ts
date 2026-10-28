import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface Borrador {
  tipo: string;
  descripcion: string;
  direccion: string;
  sector: string;
  prioridad: string;
  latitud: number | null;
  longitud: number | null;
  guardadoEn: string;
}

const VACIO: Borrador = {
  tipo: '',
  descripcion: '',
  direccion: '',
  sector: '',
  prioridad: '',
  latitud: null,
  longitud: null,
  guardadoEn: '',
};

// La foto va en una clave aparte para no reescribirla en cada tecla
const K_DATOS = 'borrador_registro';
const K_FOTO = 'borrador_foto';

@Injectable({ providedIn: 'root' })
export class BorradorService {
  async obtener(): Promise<{ datos: Borrador; foto: string | null } | null> {
    const datosTxt = (await Preferences.get({ key: K_DATOS })).value;
    const foto = (await Preferences.get({ key: K_FOTO })).value;
    if (!datosTxt && !foto) return null;

    let datos: Borrador = { ...VACIO };
    if (datosTxt) {
      try {
        datos = { ...VACIO, ...JSON.parse(datosTxt) };
      } catch {
        await this.descartar(); // borrador corrupto: no se puede recuperar
        return null;
      }
    }
    return { datos, foto };
  }

  async guardarDatos(datos: Borrador | null) {
    if (datos) await Preferences.set({ key: K_DATOS, value: JSON.stringify(datos) });
    else await Preferences.remove({ key: K_DATOS });
  }

  async guardarFoto(foto: string | null) {
    if (foto) await Preferences.set({ key: K_FOTO, value: foto });
    else await Preferences.remove({ key: K_FOTO });
  }

  async descartar() {
    await Preferences.remove({ key: K_DATOS });
    await Preferences.remove({ key: K_FOTO });
  }
}
