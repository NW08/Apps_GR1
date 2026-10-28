import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { CLOUDINARY_NAME, CLOUDINARY_UPLOAD_PRESET } from '../config';

@Injectable({ providedIn: 'root' })
export class ImagenService {
  private http = inject(HttpClient);

  /** Sube la foto (dataUrl) y devuelve una URL pública permanente. */
  async subir(dataUrl: string): Promise<string> {
    const cloudName = CLOUDINARY_NAME;
    const uploadPreset = CLOUDINARY_UPLOAD_PRESET;
    const body = new FormData();
    body.append('file', dataUrl);
    body.append('upload_preset', uploadPreset);

    const r = await firstValueFrom(
      this.http
        .post<{ secure_url: string }>(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          body
        )
        .pipe(timeout(30000))
    );
    return r.secure_url;
  }
}
