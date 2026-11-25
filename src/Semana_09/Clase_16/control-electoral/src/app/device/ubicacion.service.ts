import { Injectable, inject } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { DevicePermissionsService, PermisoDenegadoError } from './permisos.service';

export interface Ubicacion {
  lat: number;
  lng: number;
  precisionM: number;
  capturadoEn: string;
}

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  private readonly permisos = inject(DevicePermissionsService);

  async obtener(): Promise<Ubicacion> {
    await this.permisos.asegurarUbicacion();
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
      return {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        precisionM: Math.round(pos.coords.accuracy),
        capturadoEn: new Date(pos.timestamp || Date.now()).toISOString(),
      };
    } catch (e) {
      if (e instanceof PermisoDenegadoError) throw e;
      const msg = String((e as Error)?.message ?? e);
      if (/timeout|time out|expired/i.test(msg)) {
        throw new Error('No se obtuvo la ubicación a tiempo. Salga a un lugar abierto o reintente.');
      }
      if (/disabled|location services|not enabled|unavailable/i.test(msg)) {
        throw new Error('El GPS está desactivado. Actívelo y reintente.');
      }
      throw new Error('No se pudo obtener la ubicación.');
    }
  }
}
