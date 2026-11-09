import { Injectable, signal } from '@angular/core';
import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

export type userPhoto = UserPhoto;

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos = signal<UserPhoto[]>([]);
  private PHOTO_STORAGE: string = 'photos';
  private isNative: boolean = Capacitor.isNativePlatform();

  constructor() {
    this.loadSaved();
  }

  public async loadSaved(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
      const photos: UserPhoto[] = value ? JSON.parse(value) : [];

      if (!this.isNative) {
        for (const photo of photos) {
          try {
            const readFile = await Filesystem.readFile({
              path: photo.filepath,
              directory: Directory.Data,
            });
            const data = readFile.data;
            photo.webviewPath =
              typeof data === 'string' && data.startsWith('data:')
                ? data
                : `data:image/jpeg;base64,${data}`;
          } catch (readError) {
            console.warn(
              `No se pudo leer la foto ${photo.filepath}:`,
              readError
            );
          }
        }
      } else {
        for (const photo of photos) {
          photo.webviewPath = Capacitor.convertFileSrc(photo.filepath);
        }
      }

      this.photos.set(photos);
    } catch (error) {
      console.error('Error al cargar fotos guardadas:', error);
    }
  }

  public async addNewToGallery(): Promise<void> {
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100,
        correctOrientation: true,
        saveToGallery: true,
      });

      const savedImageFile = await this.savePicture(capturedPhoto);

      this.photos.update((photos) => [savedImageFile, ...photos]);

      await this.savePhotosToPreferences();
    } catch (error) {
      console.log('Captura cancelada o error al tomar foto:', error);
    }
  }

  private async savePicture(photo: Photo): Promise<UserPhoto> {
    const base64Data = await this.readAsBase64(photo);
    const fileName = Date.now() + '.jpeg';

    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data,
    });

    if (this.isNative) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri),
      };
    } else {
      return {
        filepath: fileName,
        webviewPath:
          photo.webPath ??
          (base64Data.startsWith('data:')
            ? base64Data
            : `data:image/jpeg;base64,${base64Data}`),
      };
    }
  }

  private async savePhotosToPreferences(): Promise<void> {
    try {
      // En entorno web se evita almacenar strings gigantes en base64 dentro de Preferences/localStorage
      const photosToStore = this.photos().map((p) => {
        if (!this.isNative) {
          return { filepath: p.filepath };
        }
        return {
          filepath: p.filepath,
          webviewPath: p.webviewPath,
        };
      });

      await Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(photosToStore),
      });
    } catch (error) {
      console.error('Error al guardar en Preferences:', error);
    }
  }

  private async readAsBase64(photo: Photo): Promise<string> {
    if (this.isNative && photo.path) {
      const file = await Filesystem.readFile({
        path: photo.path,
      });
      return file.data as string;
    } else if (photo.webPath) {
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      return await this.convertBlobToBase64(blob);
    } else {
      throw new Error('No se encontró una ruta válida para la foto.');
    }
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }

  public async deletePicture(
    photo: UserPhoto,
    position?: number
  ): Promise<void> {
    // 1. Eliminar reactivamente de la señal de fotos
    this.photos.update((photos) =>
      photos.filter((p, index) => {
        if (photo.filepath) {
          return p.filepath !== photo.filepath;
        }
        return position !== undefined ? index !== position : true;
      })
    );

    // 2. Persistir lista actualizada en Preferences sin saturar LocalStorage
    await this.savePhotosToPreferences();

    // 3. Eliminar archivo físico del sistema de archivos
    try {
      const filename = photo.filepath.substring(
        photo.filepath.lastIndexOf('/') + 1
      );
      await Filesystem.deleteFile({
        path: filename,
        directory: Directory.Data,
      });
    } catch (error) {
      console.warn('Error al eliminar archivo del sistema de archivos:', error);
    }
  }
}
