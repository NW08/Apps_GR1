import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export type ResultadoFoto =
  | { estado: 'ok'; dataUrl: string }
  | { estado: 'cancelado' }
  | { estado: 'denegado' }
  | { estado: 'error' };

@Injectable({ providedIn: 'root' })
export class FotoService {
  async capturar(): Promise<ResultadoFoto> {
    try {
      let perm = await Camera.checkPermissions();
      if (perm.camera !== 'granted') {
        perm = await Camera.requestPermissions({ permissions: ['camera'] });
      }
      if (perm.camera !== 'granted') return { estado: 'denegado' };
    } catch {
      // En navegador la verificación puede no estar soportada: se intenta capturar igualmente
    }

    try {
      const foto = await Camera.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.DataUrl,
        quality: 60,
        width: 1024,
        correctOrientation: true,
      });
      return foto.dataUrl ? { estado: 'ok', dataUrl: foto.dataUrl } : { estado: 'error' };
    } catch (e) {
      const msg = String((e as { message?: string })?.message ?? e).toLowerCase();
      if (msg.includes('cancel')) return { estado: 'cancelado' };
      if (msg.includes('denied') || msg.includes('permission')) return { estado: 'denegado' };
      return { estado: 'error' };
    }
  }
}