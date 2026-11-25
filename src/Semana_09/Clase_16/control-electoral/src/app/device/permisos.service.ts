import { Injectable } from '@angular/core';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export class PermisoDenegadoError extends Error {}

@Injectable({ providedIn: 'root' })
export class DevicePermissionsService {
  async asegurarCamara(): Promise<void> {
    // En el navegador los permisos los gestiona el propio navegador.
    if (!Capacitor.isNativePlatform()) return;
    let estado = await Camera.checkPermissions();
    if (estado.camera === 'prompt' || estado.camera === 'prompt-with-rationale') {
      estado = await Camera.requestPermissions({ permissions: ['camera'] });
    }
    if (estado.camera !== 'granted' && estado.camera !== 'limited') {
      throw new PermisoDenegadoError(
        'Permiso de cámara denegado. Actívelo en Ajustes > Aplicaciones > Control Electoral > Permisos > Cámara.',
      );
    }
  }

  async asegurarUbicacion(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    let estado = await Geolocation.checkPermissions();
    if (estado.location === 'prompt' || estado.location === 'prompt-with-rationale') {
      estado = await Geolocation.requestPermissions({ permissions: ['location'] });
    }
    if (estado.location !== 'granted') {
      throw new PermisoDenegadoError(
        'Permiso de ubicación denegado. Actívelo en Ajustes > Aplicaciones > Control Electoral > Permisos > Ubicación.',
      );
    }
  }
}
