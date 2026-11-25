import { Injectable, inject } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { aGrises, evaluarNitidez, type ResultadoNitidez } from './image-quality.util';
import { DevicePermissionsService } from './permisos.service';

export interface FotoCapturada {
  blob: Blob;
  dataUrl: string;
  nitidez: ResultadoNitidez;
}

const ANCHO_ANALISIS = 500;

@Injectable({ providedIn: 'root' })
export class CamaraService {
  private readonly permisos = inject(DevicePermissionsService);

  async tomarFoto(): Promise<FotoCapturada | null> {
    await this.permisos.asegurarCamara();
    let dataUrl: string | undefined;
    try {
      const foto = await Camera.getPhoto({
        source: CameraSource.Camera, // sin galería: la foto debe tomarse en el momento (ADR-003)
        resultType: CameraResultType.DataUrl,
        quality: 70,
        width: 1600,
        correctOrientation: true,
        saveToGallery: false,
        allowEditing: false,
      });
      dataUrl = foto.dataUrl;
    } catch (e) {
      const msg = String((e as Error)?.message ?? e);
      if (/cancel/i.test(msg)) return null;
      throw new Error('No se pudo abrir la cámara. Intente nuevamente.');
    }
    if (!dataUrl) return null;

    const nitidez = await this.evaluar(dataUrl);
    const blob = await (await fetch(dataUrl)).blob();
    return { blob, dataUrl, nitidez };
  }

  private async evaluar(dataUrl: string): Promise<ResultadoNitidez> {
    const img = await this.cargarImagen(dataUrl);
    const escala = Math.min(1, ANCHO_ANALISIS / img.width);
    const ancho = Math.max(3, Math.round(img.width * escala));
    const alto = Math.max(3, Math.round(img.height * escala));
    const canvas = document.createElement('canvas');
    canvas.width = ancho;
    canvas.height = alto;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { varianza: 0, brilloMedio: 0, aceptada: true };
    ctx.drawImage(img, 0, 0, ancho, alto);
    const { data } = ctx.getImageData(0, 0, ancho, alto);
    return evaluarNitidez(aGrises(data), ancho, alto);
  }

  private cargarImagen(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('No se pudo leer la foto.'));
      img.src = src;
    });
  }
}
