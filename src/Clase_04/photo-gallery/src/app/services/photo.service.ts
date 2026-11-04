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

export interface userPhoto {
  filepath: string;
  webviewPath?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PhotoService {
  public photos = signal<userPhoto[]>([]);
  private PHOTO_STORAGE: string = 'photos';
  private isNative: boolean = Capacitor.isNativePlatform();

  public async loadSaved() {
    try {
      const { value } = await Preferences.get({ key: this.PHOTO_STORAGE });
      const photos: userPhoto[] = value ? JSON.parse(value) : [];

      if (!this.isNative) {
        for (const photo of photos) {
          try {
            const readFile = await Filesystem.readFile({
              path: photo.filepath,
              directory: Directory.Data,
            });
            photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
          } catch (readError) {
            console.warn(
              `No se pudo leer la foto ${photo.filepath}:`,
              readError
            );
          }
        }
      }

      this.photos.set(photos);
    } catch (error) {
      console.error('Error al cargar fotos guardadas:', error);
    }
  }

  public async addNewToGallery() {
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

      await Preferences.set({
        key: this.PHOTO_STORAGE,
        value: JSON.stringify(this.photos()),
      });
    } catch (error) {
      console.log('Captura cancelada o error al tomar foto:', error);
    }
  }

  private async savePicture(photo: Photo): Promise<userPhoto> {
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
        webviewPath: photo.webPath,
      };
    }
  }

  private async readAsBase64(photo: Photo): Promise<string> {
    if (this.isNative) {
      const file = await Filesystem.readFile({
        path: photo.path!,
      });
      return file.data as string;
    } else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  private convertBlobToBase64(
    blob: Blob
  ): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  }

  public async deletePicture(photo: userPhoto, position: number) {
    this.photos.update((photos) =>
      photos.filter((_, index) => index !== position)
    );

    await Preferences.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos()),
    });

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
