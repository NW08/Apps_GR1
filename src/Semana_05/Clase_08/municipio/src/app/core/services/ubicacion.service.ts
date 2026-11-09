import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { coordenadasValidas } from '../utils/coordenadas';

export type ResultadoUbicacion =
  | { estado: 'ok'; latitud: number; longitud: number }
  | { estado: 'denegado' }
  | { estado: 'no_disponible' };

@Injectable({ providedIn: 'root' })
export class UbicacionService {
  async obtener(): Promise<ResultadoUbicacion> {
    try {
      let perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
        perm = await Geolocation.requestPermissions();
      }
      if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
        return { estado: 'denegado' };
      }
    } catch {
    }

    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      const latitud = Number(pos.coords.latitude.toFixed(6));
      const longitud = Number(pos.coords.longitude.toFixed(6));
      return coordenadasValidas(latitud, longitud)
        ? { estado: 'ok', latitud, longitud }
        : { estado: 'no_disponible' };
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? e).toLowerCase();
      if (msg.includes('denied') || msg.includes('permission')) return { estado: 'denegado' };
      return { estado: 'no_disponible' }; // GPS apagado, timeout, etc.
    }
  }
}