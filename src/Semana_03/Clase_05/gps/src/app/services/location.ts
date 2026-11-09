import { Injectable } from '@angular/core';

export interface GpsCoords {
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  /**
   * Obtiene la posición GPS actual utilizando la API nativa de geolocalización.
   */
  getCurrentPosition(): Promise<GpsCoords> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('La geolocalización no está disponible en este navegador o dispositivo.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }
}

export { LocationService as Location };
